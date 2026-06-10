import { mount, unmount } from "svelte";
import Renderer from "../components/Renderer.svelte";
import type {
  ActionContext,
  Bounds,
  ContextMenuAction,
  Options,
  Plugin,
  Position,
  SettableOptions,
  SourceInfo,
  SvelteLensAPI,
  SvelteLensState,
} from "../types.js";
import {
  DRAG_THRESHOLD_PX,
  ELEMENT_DETECTION_THROTTLE_MS,
  FEEDBACK_DURATION_MS,
  HOST_ATTRIBUTE,
} from "../constants.js";
import { mountRoot } from "../utils/mount-root.js";
import { createElementBounds } from "../utils/create-element-bounds.js";
import { getElementAtPosition } from "../utils/get-element-at-position.js";
import { isMountHost } from "../utils/is-mount-host.js";
import { isKeyboardEventFromInput } from "../utils/is-keyboard-event-from-input.js";
import { copyToClipboard } from "../utils/copy-to-clipboard.js";
import { getTagName } from "../utils/get-tag-name.js";
import { formatHtmlPreview } from "../utils/format-html-preview.js";
import { parseActivationKey } from "../utils/parse-activation-key.js";
import { createLensStore } from "./store.svelte.js";
import { createPluginRegistry } from "./plugin-registry.svelte.js";
import { resolveSource, getStackContext } from "./source.js";
import { copyPlugin } from "./plugins/copy.js";
import { openPlugin } from "./plugins/open.js";

const noop = (): void => {};

const createNoopApi = (): SvelteLensAPI => ({
  activate: noop,
  deactivate: noop,
  toggle: noop,
  isActive: () => false,
  isEnabled: () => false,
  setEnabled: noop,
  copyElement: () => Promise.resolve(false),
  getSource: () => Promise.resolve(null),
  getStackContext: () => Promise.resolve(""),
  getState: () => ({
    isActive: false,
    isDragging: false,
    isCopying: false,
    targetElement: null,
  }),
  setOptions: noop,
  registerPlugin: noop,
  unregisterPlugin: noop,
  getPlugins: () => [],
  dispose: noop,
});

const isCopyKeyCombo = (event: KeyboardEvent): boolean => {
  if (event.key !== "c" && event.key !== "C") return false;
  return event.metaKey || event.ctrlKey;
};

interface InitGuards {
  hasBeenInited: boolean;
}

const guards: InitGuards = { hasBeenInited: false };

export const init = (rawOptions?: Options): SvelteLensAPI => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return createNoopApi();
  }
  if (rawOptions?.enabled === false) {
    return createNoopApi();
  }
  if (guards.hasBeenInited) {
    return createNoopApi();
  }
  guards.hasBeenInited = true;

  const initialOptions: SettableOptions = {
    activationMode: rawOptions?.activationMode,
    keyHoldDuration: rawOptions?.keyHoldDuration,
    allowActivationInsideInput: rawOptions?.allowActivationInsideInput,
    activationKey: rawOptions?.activationKey,
    getContent: rawOptions?.getContent,
  };

  const store = createLensStore({
    keyHoldDuration: rawOptions?.keyHoldDuration ?? 100,
  });
  const pluginRegistry = createPluginRegistry(initialOptions);

  // Parse the activationKey option into a key-matcher function.
  // Falls back to Cmd/Ctrl+Alt+G when no activationKey is configured.
  const matchesActivationKey = parseActivationKey(initialOptions.activationKey);
  const hasCustomActivationKey =
    initialOptions.activationKey !== undefined &&
    (typeof initialOptions.activationKey === "function" ||
      (typeof initialOptions.activationKey === "string" &&
        initialOptions.activationKey.trim() !== ""));

  const { root, shadowRoot, host } = mountRoot();

  const renderState = $state<{
    selectionVisible: boolean;
    selectionBounds: Bounds | null;
    selectionTagName: string | null;
    selectionComponentName: string | null;
    selectionStatus: "idle" | "copying" | "copied" | "error";
    selectionStatusText: string | undefined;
    isActive: boolean;
    enabled: boolean;
    contextMenuPosition: Position | null;
    contextMenuActions: ContextMenuAction[];
    actionContext: ActionContext | null;
  }>({
    selectionVisible: false,
    selectionBounds: null,
    selectionTagName: null,
    selectionComponentName: null,
    selectionStatus: "idle",
    selectionStatusText: undefined,
    isActive: false,
    enabled: true,
    contextMenuPosition: null,
    contextMenuActions: [],
    actionContext: null,
  });

  let lastDetectionAt = 0;
  let copyResetTimer: ReturnType<typeof setTimeout> | null = null;
  let copyInProgress = false;

  const updateSelectionFromElement = (element: Element | null): void => {
    if (!element) {
      renderState.selectionVisible = false;
      renderState.selectionBounds = null;
      renderState.selectionTagName = null;
      renderState.selectionComponentName = null;
      return;
    }
    renderState.selectionVisible = true;
    renderState.selectionBounds = createElementBounds(element);
    renderState.selectionTagName = getTagName(element);
    void resolveSource(element).then((source) => {
      if (store.state.detectedElement === element) {
        renderState.selectionComponentName = source?.componentName ?? null;
      }
    });
  };

  const detectElement = (clientX: number, clientY: number): void => {
    const element = getElementAtPosition(clientX, clientY);
    if (element === store.state.detectedElement) return;
    store.setDetectedElement(element);
    updateSelectionFromElement(element);
  };

  const onPointerMove = (event: PointerEvent): void => {
    if (!store.state.isActive) return;
    store.setPointer({ x: event.clientX, y: event.clientY });
    const now = performance.now();
    if (now - lastDetectionAt < ELEMENT_DETECTION_THROTTLE_MS) return;
    lastDetectionAt = now;
    detectElement(event.clientX, event.clientY);
  };

  const performCopy = async (element: Element): Promise<boolean> => {
    if (copyInProgress) return false;
    copyInProgress = true;
    const elements = [element];
    renderState.selectionStatus = "copying";
    store.startCopy();

    try {
      await pluginRegistry.hooks.onBeforeCopy(elements);
      const userContent = pluginRegistry.store.options.getContent
        ? await pluginRegistry.store.options.getContent(elements)
        : await buildDefaultContent(element);

      const finalContent = await pluginRegistry.hooks.transformCopyContent(userContent, elements);

      const success = await copyToClipboard(finalContent);
      if (!success) {
        throw new Error("Clipboard write failed");
      }

      pluginRegistry.hooks.onAfterCopy(elements, true);
      store.completeCopy(element);
      renderState.selectionStatus = "copied";
      renderState.selectionStatusText = "Copied";
      scheduleStatusReset();
      return true;
    } catch (caught) {
      const error = caught instanceof Error ? caught : new Error(String(caught));
      pluginRegistry.hooks.onCopyError(error);
      pluginRegistry.hooks.onAfterCopy(elements, false);
      store.completeCopy(element, error.message);
      renderState.selectionStatus = "error";
      renderState.selectionStatusText = error.message;
      scheduleStatusReset();
      return false;
    } finally {
      copyInProgress = false;
    }
  };

  const buildDefaultContent = async (element: Element): Promise<string> => {
    const html = formatHtmlPreview(element);
    const stack = await getStackContext(element);
    return stack ? `${html}${stack}` : html;
  };

  const scheduleStatusReset = (): void => {
    if (copyResetTimer) clearTimeout(copyResetTimer);
    copyResetTimer = setTimeout(() => {
      renderState.selectionStatus = "idle";
      renderState.selectionStatusText = undefined;
    }, FEEDBACK_DURATION_MS);
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (!renderState.enabled) return;
    if (
      !pluginRegistry.store.options.allowActivationInsideInput &&
      isKeyboardEventFromInput(event)
    ) {
      return;
    }

    if (isCopyKeyCombo(event) && store.state.isActive && store.state.detectedElement) {
      event.preventDefault();
      event.stopPropagation();
      void performCopy(store.state.detectedElement);
      return;
    }

    if (event.key === "Escape" && store.state.isActive) {
      event.preventDefault();
      deactivate();
      return;
    }

    // Use the parsed activationKey matcher if a custom key was configured,
    // otherwise fall back to the default Cmd/Ctrl+Alt+G shortcut.
    const isActivationKey = hasCustomActivationKey
      ? matchesActivationKey(event)
      : event.key === "g" && (event.metaKey || event.ctrlKey) && event.altKey;
    if (isActivationKey) {
      event.preventDefault();
      toggle();
    }
  };

  const onContextMenuEvent = (event: MouseEvent): void => {
    if (!store.state.isActive) return;
    if (!store.state.detectedElement) return;
    event.preventDefault();
    event.stopPropagation();
    showContextMenu({ x: event.clientX, y: event.clientY }, store.state.detectedElement);
  };

  const showContextMenu = async (position: Position, element: Element): Promise<void> => {
    const source = await resolveSource(element);
    const ctx: ActionContext = {
      element,
      elements: [element],
      filePath: source?.filePath,
      lineNumber: source?.lineNumber ?? undefined,
      componentName: source?.componentName ?? undefined,
      tagName: getTagName(element),
      hideContextMenu: () => {
        renderState.contextMenuPosition = null;
        renderState.actionContext = null;
      },
      cleanup: () => {
        store.deactivate();
        renderState.isActive = false;
      },
    };
    renderState.contextMenuPosition = position;
    renderState.actionContext = ctx;
    renderState.contextMenuActions = pluginRegistry.store.actions;
    pluginRegistry.hooks.onContextMenu(element, position);
  };

  const dismissContextMenu = (): void => {
    renderState.contextMenuPosition = null;
    renderState.actionContext = null;
  };

  const activate = (): void => {
    if (!renderState.enabled) return;
    store.activate();
    renderState.isActive = true;
    pluginRegistry.hooks.onActivate();
  };

  const deactivate = (): void => {
    store.deactivate();
    renderState.isActive = false;
    renderState.selectionVisible = false;
    renderState.selectionBounds = null;
    renderState.selectionTagName = null;
    renderState.selectionComponentName = null;
    renderState.selectionStatus = "idle";
    renderState.selectionStatusText = undefined;
    renderState.contextMenuPosition = null;
    renderState.actionContext = null;
    if (copyResetTimer) {
      clearTimeout(copyResetTimer);
      copyResetTimer = null;
    }
    pluginRegistry.hooks.onDeactivate();
  };

  const toggle = (): void => {
    if (store.state.isActive) deactivate();
    else activate();
  };

  let mounted: ReturnType<typeof mount> | null = null;

  const mountRenderer = (): void => {
    mounted = mount(Renderer, {
      target: root,
      props: {
        get selectionVisible() {
          return renderState.selectionVisible;
        },
        get selectionBounds() {
          return renderState.selectionBounds;
        },
        get selectionTagName() {
          return renderState.selectionTagName;
        },
        get selectionComponentName() {
          return renderState.selectionComponentName;
        },
        get selectionStatus() {
          return renderState.selectionStatus;
        },
        get selectionStatusText() {
          return renderState.selectionStatusText;
        },
        get toolbarVisible() {
          return pluginRegistry.store.theme.toolbar.enabled !== false;
        },
        get toolbarEnabled() {
          return renderState.enabled;
        },
        get isActive() {
          return renderState.isActive;
        },
        onToggleActive: toggle,
        get contextMenuPosition() {
          return renderState.contextMenuPosition;
        },
        get contextMenuActions() {
          return renderState.contextMenuActions;
        },
        get actionContext() {
          return renderState.actionContext;
        },
        onContextMenuDismiss: dismissContextMenu,
      },
    });
  };

  const installListeners = (): void => {
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("contextmenu", onContextMenuEvent, true);
    window.addEventListener("scroll", refreshSelectionBounds, true);
    window.addEventListener("resize", refreshSelectionBounds);
  };

  const uninstallListeners = (): void => {
    document.removeEventListener("pointermove", onPointerMove, true);
    document.removeEventListener("keydown", onKeyDown, true);
    document.removeEventListener("contextmenu", onContextMenuEvent, true);
    window.removeEventListener("scroll", refreshSelectionBounds, true);
    window.removeEventListener("resize", refreshSelectionBounds);
  };

  const refreshSelectionBounds = (): void => {
    if (!store.state.detectedElement) return;
    if (!store.state.detectedElement.isConnected) {
      store.setDetectedElement(null);
      updateSelectionFromElement(null);
      return;
    }
    renderState.selectionBounds = createElementBounds(store.state.detectedElement);
  };

  installListeners();
  mountRenderer();

  const api: SvelteLensAPI = {
    activate,
    deactivate,
    toggle,
    isActive: () => store.state.isActive,
    isEnabled: () => renderState.enabled,
    setEnabled: (value: boolean) => {
      renderState.enabled = value;
      if (!value) deactivate();
    },
    copyElement: async (target: Element | Element[]) => {
      const elements = Array.isArray(target) ? target : [target];
      const first = elements[0];
      if (!first) return false;
      return performCopy(first);
    },
    getSource: resolveSource,
    getStackContext: getStackContext,
    getState: (): SvelteLensState => ({
      isActive: store.state.isActive,
      isDragging: false,
      isCopying: store.state.isCopying,
      targetElement: store.state.detectedElement,
    }),
    setOptions: (options: SettableOptions) => pluginRegistry.setOptions(options),
    registerPlugin: (plugin: Plugin) => pluginRegistry.register(plugin, api),
    unregisterPlugin: (name: string) => pluginRegistry.unregister(name),
    getPlugins: () => pluginRegistry.getPluginNames(),
    dispose: () => {
      uninstallListeners();
      if (copyResetTimer) {
        clearTimeout(copyResetTimer);
        copyResetTimer = null;
      }
      if (mounted) void unmount(mounted);
      mounted = null;
      host.remove();
      guards.hasBeenInited = false;
      if (typeof window !== "undefined") {
        delete window.__SVELTE_LENS__;
      }
    },
  };

  for (const builtin of [copyPlugin, openPlugin]) {
    pluginRegistry.register(builtin, api);
  }

  return api;
};

export {
  resolveSource as getSource,
  resolveStack as getStack,
  getStackContext,
  getElementContext,
} from "./source.js";

export const isLensHost = (element: Element): boolean => {
  if (typeof document === "undefined") return false;
  return Boolean(element.closest(`[${HOST_ATTRIBUTE}]`));
};

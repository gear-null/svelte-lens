import type { Plugin, SvelteLensAPI } from "./types.js";
import { init as coreInit } from "./core/index.svelte.js";

const flushPendingPlugins = (api: SvelteLensAPI): void => {
  while (pendingPlugins.length > 0) {
    const plugin = pendingPlugins.shift();
    if (plugin) api.registerPlugin(plugin);
  }
};

const init = (options?: import("./types.js").Options): SvelteLensAPI => {
  if (typeof window !== "undefined" && window.__SVELTE_LENS_DISABLED__) {
    options = { ...options, enabled: false };
  }
  const api = coreInit(options);
  if (api.isEnabled()) {
    setGlobalApi(api);
    flushPendingPlugins(api);
    // Dispatch event for plugin integrations — only on explicit init.
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("svelte-lens:init", { detail: api }));
    }
    // Wrap dispose so the module-level globalApi is also cleared.
    const origDispose = api.dispose.bind(api);
    api.dispose = () => {
      origDispose();
      setGlobalApi(null);
    };
  }
  return api;
};

export { init };
export {
  getSource,
  getStack,
  getStackContext,
  getElementContext,
  isLensHost,
} from "./core/index.svelte.js";

export { copyPlugin } from "./core/plugins/copy.js";
export { openPlugin } from "./core/plugins/open.js";

export type {
  Options,
  SettableOptions,
  ActivationKey,
  ActivationMode,
  Plugin,
  PluginConfig,
  PluginHooks,
  ContextMenuAction,
  ActionContext,
  Theme,
  SourceInfo,
  ElementContext,
  SvelteLensAPI,
  SvelteLensState,
  Position,
  Bounds,
} from "./types.js";

declare global {
  interface Window {
    __SVELTE_LENS__?: SvelteLensAPI;
    __SVELTE_LENS_DISABLED__?: boolean;
  }
}

let globalApi: SvelteLensAPI | null = null;
const pendingPlugins: Plugin[] = [];

export const getGlobalApi = (): SvelteLensAPI | null => {
  if (typeof window === "undefined") return globalApi;
  return window.__SVELTE_LENS__ ?? globalApi ?? null;
};

const setGlobalApi = (api: SvelteLensAPI | null): void => {
  globalApi = api;
  if (typeof window !== "undefined") {
    if (api) {
      Object.defineProperty(window, "__SVELTE_LENS__", {
        value: api,
        configurable: true, // allows dispose() to delete
        enumerable: false,
        writable: false, // prevents overwrite by other scripts
      });
    } else {
      delete window.__SVELTE_LENS__;
    }
  }
};

export const registerPlugin = (plugin: Plugin): void => {
  const api = getGlobalApi();
  if (api) {
    api.registerPlugin(plugin);
    return;
  }
  pendingPlugins.push(plugin);
};

export const unregisterPlugin = (name: string): void => {
  const api = getGlobalApi();
  if (api) {
    api.unregisterPlugin(name);
    return;
  }
  const pendingIndex = pendingPlugins.findIndex((plugin) => plugin.name === name);
  if (pendingIndex !== -1) pendingPlugins.splice(pendingIndex, 1);
};

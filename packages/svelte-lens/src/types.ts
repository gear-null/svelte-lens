export interface Position {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: string;
}

export interface SourceInfo {
  filePath: string;
  lineNumber: number | null;
  columnNumber: number | null;
  componentName: string | null;
}

export interface ElementContext {
  element: Element;
  tagName: string;
  componentName: string | null;
  source: SourceInfo | null;
  stack: SourceInfo[];
  htmlPreview: string;
  stackString: string;
}

export type ActivationKey = string | ((event: KeyboardEvent) => boolean);

export type ActivationMode = "toggle" | "hold";

export interface Options {
  enabled?: boolean;
  activationMode?: ActivationMode;
  keyHoldDuration?: number;
  allowActivationInsideInput?: boolean;
  activationKey?: ActivationKey;
  getContent?: (elements: Element[]) => Promise<string> | string;
}

export interface SettableOptions extends Omit<Options, "enabled"> {
  enabled?: never;
}

export interface Theme {
  enabled?: boolean;
  hue?: number;
  selectionBox?: { enabled?: boolean };
  toolbar?: { enabled?: boolean };
  elementLabel?: { enabled?: boolean };
}

export interface PluginHooks {
  onActivate?: () => void;
  onDeactivate?: () => void;
  onElementSelect?: (element: Element) => boolean | void | Promise<boolean>;
  onBeforeCopy?: (elements: Element[]) => void | Promise<void>;
  transformCopyContent?: (content: string, elements: Element[]) => string | Promise<string>;
  onAfterCopy?: (elements: Element[], success: boolean) => void;
  onCopyError?: (error: Error) => void;
  onContextMenu?: (element: Element, position: Position) => void;
}

export interface ContextMenuAction {
  id: string;
  label: string;
  shortcut?: string;
  enabled?: boolean | ((context: ActionContext) => boolean);
  onAction: (context: ActionContext) => void | Promise<void>;
}

export interface ActionContext {
  element: Element;
  elements: Element[];
  filePath?: string;
  lineNumber?: number;
  componentName?: string;
  tagName?: string;
  hideContextMenu: () => void;
  cleanup: () => void;
}

export interface PluginConfig {
  theme?: Partial<Theme>;
  options?: SettableOptions;
  actions?: ContextMenuAction[];
  hooks?: PluginHooks;
  cleanup?: () => void;
}

export interface Plugin {
  name: string;
  theme?: Partial<Theme>;
  options?: SettableOptions;
  actions?: ContextMenuAction[];
  hooks?: PluginHooks;
  setup?: (api: SvelteLensAPI) => PluginConfig | void;
}

export interface SvelteLensState {
  isActive: boolean;
  isDragging: boolean;
  isCopying: boolean;
  targetElement: Element | null;
}

export interface SvelteLensAPI {
  activate: () => void;
  deactivate: () => void;
  toggle: () => void;
  isActive: () => boolean;
  isEnabled: () => boolean;
  setEnabled: (enabled: boolean) => void;
  copyElement: (elements: Element | Element[]) => Promise<boolean>;
  getSource: (element: Element) => Promise<SourceInfo | null>;
  getStackContext: (element: Element) => Promise<string>;
  getState: () => SvelteLensState;
  setOptions: (options: SettableOptions) => void;
  registerPlugin: (plugin: Plugin) => void;
  unregisterPlugin: (name: string) => void;
  getPlugins: () => string[];
  dispose: () => void;
}

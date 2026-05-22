import type { Position } from "../types.js";
import { OFFSCREEN_POSITION } from "../constants.js";

export interface StoreInput {
  keyHoldDuration: number;
}

export interface LensStore {
  isActive: boolean;
  isHolding: boolean;
  holdingSince: number | null;
  isCopying: boolean;
  copiedAt: number | null;
  pointer: Position;
  detectedElement: Element | null;
  targetElement: Element | null;
  lastCopiedElement: Element | null;
  contextMenuPosition: Position | null;
  contextMenuElement: Element | null;
  copyError: string | null;
}

export const createLensStore = (_input: StoreInput) => {
  const state = $state<LensStore>({
    isActive: false,
    isHolding: false,
    holdingSince: null,
    isCopying: false,
    copiedAt: null,
    pointer: { x: OFFSCREEN_POSITION, y: OFFSCREEN_POSITION },
    detectedElement: null,
    targetElement: null,
    lastCopiedElement: null,
    contextMenuPosition: null,
    contextMenuElement: null,
    copyError: null,
  });

  const activate = (): void => {
    state.isActive = true;
    state.isHolding = false;
    state.holdingSince = null;
    state.copyError = null;
  };

  const deactivate = (): void => {
    state.isActive = false;
    state.isHolding = false;
    state.holdingSince = null;
    state.isCopying = false;
    state.copiedAt = null;
    state.lastCopiedElement = null;
    state.copyError = null;
    state.detectedElement = null;
    state.targetElement = null;
    state.contextMenuPosition = null;
    state.contextMenuElement = null;
  };

  const toggle = (): void => {
    if (state.isActive) deactivate();
    else activate();
  };

  const startHold = (): void => {
    state.isHolding = true;
    state.holdingSince = Date.now();
  };

  const releaseHold = (): void => {
    state.isHolding = false;
    state.holdingSince = null;
  };

  const startCopy = (): void => {
    state.isCopying = true;
  };

  const completeCopy = (element: Element | null, error?: string): void => {
    state.isCopying = false;
    state.copiedAt = Date.now();
    state.lastCopiedElement = element;
    state.copyError = error ?? null;
  };

  const setPointer = (position: Position): void => {
    state.pointer = position;
  };

  const setDetectedElement = (element: Element | null): void => {
    state.detectedElement = element;
  };

  const setTargetElement = (element: Element | null): void => {
    state.targetElement = element;
  };

  const showContextMenu = (position: Position, element: Element): void => {
    state.contextMenuPosition = position;
    state.contextMenuElement = element;
  };

  const hideContextMenu = (): void => {
    state.contextMenuPosition = null;
    state.contextMenuElement = null;
  };

  return {
    state,
    activate,
    deactivate,
    toggle,
    startHold,
    releaseHold,
    startCopy,
    completeCopy,
    setPointer,
    setDetectedElement,
    setTargetElement,
    showContextMenu,
    hideContextMenu,
  };
};

export type LensStoreInstance = ReturnType<typeof createLensStore>;

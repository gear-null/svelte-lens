import { describe, it, expect, vi, beforeEach } from "vitest";
import { createLensStore, type LensStoreInstance } from "../core/store.svelte.js";

describe("createLensStore", () => {
  let store: LensStoreInstance;

  beforeEach(() => {
    store = createLensStore({ keyHoldDuration: 100 });
  });

  it("starts with inactive state", () => {
    expect(store.state.isActive).toBe(false);
    expect(store.state.isHolding).toBe(false);
    expect(store.state.detectedElement).toBe(null);
  });

  it("activate sets isActive to true", () => {
    store.activate();
    expect(store.state.isActive).toBe(true);
  });

  it("deactivate resets relevant state", () => {
    store.activate();
    store.setDetectedElement(document.createElement("div"));
    store.deactivate();
    expect(store.state.isActive).toBe(false);
    expect(store.state.detectedElement).toBe(null);
    expect(store.state.targetElement).toBe(null);
    expect(store.state.contextMenuPosition).toBe(null);
  });

  it("toggle flips isActive", () => {
    store.toggle();
    expect(store.state.isActive).toBe(true);
    store.toggle();
    expect(store.state.isActive).toBe(false);
  });

  it("startHold and releaseHold manage holding state", () => {
    store.startHold();
    expect(store.state.isHolding).toBe(true);
    expect(store.state.holdingSince).not.toBe(null);

    store.releaseHold();
    expect(store.state.isHolding).toBe(false);
    expect(store.state.holdingSince).toBe(null);
  });

  it("startCopy and completeCopy manage copying state", () => {
    const el = document.createElement("div");
    store.startCopy();
    expect(store.state.isCopying).toBe(true);

    store.completeCopy(el);
    expect(store.state.isCopying).toBe(false);
    expect(store.state.copiedAt).not.toBe(null);
    expect(store.state.lastCopiedElement).toBe(el);
  });

  it("completeCopy with error sets copyError", () => {
    store.startCopy();
    store.completeCopy(null, "Clipboard failed");
    expect(store.state.copyError).toBe("Clipboard failed");
  });

  it("deactivate resets copy-related state", () => {
    const el = document.createElement("div");
    store.startCopy();
    store.completeCopy(el, "some error");
    expect(store.state.isCopying).toBe(false);
    expect(store.state.copiedAt).not.toBe(null);
    expect(store.state.lastCopiedElement).toBe(el);
    expect(store.state.copyError).toBe("some error");

    store.deactivate();
    expect(store.state.isCopying).toBe(false);
    expect(store.state.copiedAt).toBe(null);
    expect(store.state.lastCopiedElement).toBe(null);
    expect(store.state.copyError).toBe(null);
  });

  it("setPointer updates position", () => {
    store.setPointer({ x: 100, y: 200 });
    expect(store.state.pointer).toEqual({ x: 100, y: 200 });
  });

  it("showContextMenu and hideContextMenu manage menu state", () => {
    const el = document.createElement("div");
    store.showContextMenu({ x: 50, y: 60 }, el);
    expect(store.state.contextMenuPosition).toEqual({ x: 50, y: 60 });
    expect(store.state.contextMenuElement).toBe(el);

    store.hideContextMenu();
    expect(store.state.contextMenuPosition).toBe(null);
    expect(store.state.contextMenuElement).toBe(null);
  });
});

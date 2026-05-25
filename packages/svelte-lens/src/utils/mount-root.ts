import { HOST_ATTRIBUTE, MOUNT_ROOT_RECHECK_DELAY_MS, Z_INDEX_OVERLAY } from "../constants.js";

interface MountRootResult {
  root: HTMLDivElement;
  host: HTMLElement;
  shadowRoot: ShadowRoot;
}

const attachToBody = (host: HTMLElement): void => {
  // Guard against the document being torn down (e.g. between tests, or SSR).
  if (typeof document === "undefined" || !document.body) return;
  const candidates = document.querySelectorAll<HTMLElement>(`[${HOST_ATTRIBUTE}]`);
  for (const candidate of candidates) {
    if (candidate === host) continue;
    if (!candidate.shadowRoot) candidate.remove();
  }
  document.body.appendChild(host);
};

const scheduleAttach = (host: HTMLElement): void => {
  if (typeof document === "undefined") return;
  if (document.body) {
    attachToBody(host);
    return;
  }
  const onReady = (): void => {
    document.removeEventListener("DOMContentLoaded", onReady);
    attachToBody(host);
  };
  document.addEventListener("DOMContentLoaded", onReady, { once: true });
};

export const mountRoot = (): MountRootResult => {
  const existing = document.querySelectorAll<HTMLElement>(`[${HOST_ATTRIBUTE}]`);
  for (const existingHost of existing) {
    const existingRoot = existingHost.shadowRoot?.querySelector(`[${HOST_ATTRIBUTE}]`);
    if (existingRoot instanceof HTMLDivElement && existingHost.shadowRoot) {
      return { root: existingRoot, host: existingHost, shadowRoot: existingHost.shadowRoot };
    }
    existingHost.remove();
  }

  const host = document.createElement("div");
  host.setAttribute(HOST_ATTRIBUTE, "true");
  host.style.zIndex = String(Z_INDEX_OVERLAY);
  host.style.position = "fixed";
  host.style.inset = "0";
  host.style.pointerEvents = "none";
  host.style.contain = "strict";

  const shadowRoot = host.attachShadow({ mode: "open" });

  const root = document.createElement("div");
  root.setAttribute(HOST_ATTRIBUTE, "true");
  shadowRoot.appendChild(root);

  scheduleAttach(host);

  setTimeout(() => attachToBody(host), MOUNT_ROOT_RECHECK_DELAY_MS);

  return { root, host, shadowRoot };
};

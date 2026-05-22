import { describe, it, expect, vi } from "vitest";
import { copyToClipboard } from "./copy-to-clipboard.js";

describe("copyToClipboard", () => {
  it("uses navigator.clipboard.writeText when available", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    const result = await copyToClipboard("hello");
    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
  });

  it("falls back to execCommand when clipboard API fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.assign(navigator, { clipboard: { writeText } });

    // jsdom doesn't have execCommand, so we define it on Document.prototype
    const execMock = vi.fn().mockReturnValue(true);
    Document.prototype.execCommand = execMock;
    const result = await copyToClipboard("fallback");
    expect(result).toBe(true);
    expect(execMock).toHaveBeenCalledWith("copy");
    delete (Document.prototype as unknown as Record<string, unknown>).execCommand;
  });

  it("returns false when both methods fail", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.assign(navigator, { clipboard: { writeText } });

    const execMock = vi.fn().mockReturnValue(false);
    Document.prototype.execCommand = execMock;
    const result = await copyToClipboard("fails");
    expect(result).toBe(false);
    delete (Document.prototype as unknown as Record<string, unknown>).execCommand;
  });
});

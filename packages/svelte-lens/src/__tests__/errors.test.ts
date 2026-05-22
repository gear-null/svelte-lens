import { describe, it, expect } from "vitest";
import { CopyFailedError, DispatchError } from "../errors.js";

describe("CopyFailedError", () => {
  it("has correct name property", () => {
    const err = new CopyFailedError("copy failed");
    expect(err.name).toBe("CopyFailedError");
    expect(err.message).toBe("copy failed");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("DispatchError", () => {
  it("has correct name property", () => {
    const err = new DispatchError("dispatch failed");
    expect(err.name).toBe("DispatchError");
    expect(err.message).toBe("dispatch failed");
    expect(err).toBeInstanceOf(Error);
  });
});

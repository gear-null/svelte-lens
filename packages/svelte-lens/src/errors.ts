export class CopyFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CopyFailedError";
  }
}

export class DispatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DispatchError";
  }
}

import type { AppErrorOptions,ErrorCode } from "../type/error.type.js";

export class AppError extends Error {
  public readonly status: number;
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>|undefined;

  constructor(options: AppErrorOptions) {
    super(options.message);

    this.name = "AppError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;

    if (options.cause) {
      (this as any).cause = options.cause;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}


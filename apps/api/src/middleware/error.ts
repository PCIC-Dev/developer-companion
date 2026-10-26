import type { ErrorRequestHandler, RequestHandler } from "express";

/** An error carrying an HTTP status and a machine-readable code. */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

/** Reached when no route matched — hands a 404 to the error handler. */
export const notFound: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, "not_found", "Resource not found"));
};

/**
 * Terminal error handler (Express 5 recognises it by its four arguments).
 * Serialises every error into the single JSON envelope { code, message, requestId }.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const status = err instanceof AppError ? err.status : 500;
  const code = err instanceof AppError ? err.code : "internal_error";
  const message = err instanceof AppError ? err.message : "Internal server error";

  res.status(status).json({ code, message, requestId: String(req.id) });
};

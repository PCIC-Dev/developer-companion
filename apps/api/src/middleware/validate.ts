import type { RequestHandler } from "express";
import type { ZodType } from "zod";

import { AppError } from "./error";

/**
 * Thin request-body validator. Pass a zod schema — ideally one imported from
 * @pcic/shared so the web form and this endpoint validate identically. On
 * success the parsed value replaces req.body; on failure it throws a 422.
 */
export function validateBody(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new AppError(422, "validation_error", "Request body failed validation."));
      return;
    }
    req.body = result.data;
    next();
  };
}

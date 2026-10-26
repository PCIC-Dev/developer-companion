import type { RequestHandler } from "express";

import { AppError } from "./error";

/**
 * Authentication middleware — STUB. NOT IMPLEMENTED.
 *
 * Intended shape: read the bearer token, verify it as a Supabase JWT, look up
 * the member's role, and attach both to the request (req.member / req.role,
 * typed in ../types/express.d.ts). Downstream handlers then read req.member.
 */
export const requireMember: RequestHandler = (req, _res, next) => {
  // TODO(auth): verify the Supabase JWT and populate req.member / req.role.
  //   const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  //   const { data, error } = await admin.auth.getUser(token); // ../lib/supabase
  //   if (error || !data.user) { next(new AppError(401, "unauthenticated", "Invalid token")); return; }
  //   req.member = { id: data.user.id };
  //   req.role = "member";
  void req;
  next(new AppError(501, "not_implemented", "Authentication is not implemented yet (stub)."));
};

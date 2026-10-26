// Augments Express's Request with the fields the auth middleware attaches.
import "express";

declare global {
  namespace Express {
    interface Request {
      /** Set by requireMember once a Supabase JWT has been verified. */
      member?: { id: string };
      /** The member's role, set alongside `member`. */
      role?: string;
    }
  }
}

export {};

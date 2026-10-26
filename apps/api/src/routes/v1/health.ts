import { Router } from "express";

/** Liveness check. The only real route in this scaffold. */
export const healthRouter: Router = Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

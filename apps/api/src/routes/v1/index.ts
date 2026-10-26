import { Router } from "express";

import { healthRouter } from "./health";

/**
 * API v1 router, mounted at /api/v1 by src/index.ts.
 *
 * Convention for adding a route:
 *   1. Create src/routes/v1/<feature>.ts exporting a Router (see health.ts).
 *   2. Validate input with validateBody(schema from @pcic/shared).
 *   3. Protect private/mutating routes with requireMember.
 *   4. Mount it here: v1Router.use("/<feature>", featureRouter).
 * Breaking changes get a new version (/api/v2), never a mutation of v1.
 */
export const v1Router: Router = Router();

v1Router.use("/health", healthRouter);

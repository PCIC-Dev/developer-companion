import { randomUUID } from "node:crypto";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";

import { errorHandler, notFound } from "./middleware/error";
import { v1Router } from "./routes/v1";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  }),
);
app.use(
  pinoHttp({
    genReqId: (req, res) => {
      const header = req.headers["x-request-id"];
      const id = (Array.isArray(header) ? header[0] : header) ?? randomUUID();
      res.setHeader("x-request-id", id);
      return id;
    },
  }),
);
app.use(express.json());

app.use("/api/v1", v1Router);

// 404 then the terminal error handler (must be last). Express 5 forwards
// rejected promises from async handlers here automatically.
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`API listening on http://localhost:${String(port)}`);
});

import express, { type Express } from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { errorHandler } from "./errorHandler.js";
import { authLimiter } from "./rateLimit.js";

function buildTestApp(): Express {
  const app = express();
  app.use("/auth", authLimiter);
  app.post("/auth/login", (_req, res) => {
    res.status(204).end();
  });
  app.use(errorHandler);
  return app;
}

describe("authLimiter", () => {
  it("allows 10 requests per minute, then blocks with 429 RATE_LIMITED", async () => {
    const app = buildTestApp();

    for (let attempt = 1; attempt <= 10; attempt += 1) {
      const response = await request(app).post("/auth/login");
      expect(response.status).toBe(204);
    }

    const blocked = await request(app).post("/auth/login");
    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Please wait a moment and try again.",
      },
    });
    expect(blocked.get("Retry-After")).toBeDefined();
  });
});
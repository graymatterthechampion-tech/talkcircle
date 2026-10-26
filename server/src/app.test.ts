import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./app.js";
import { env } from "./config/env.js";

describe("app", () => {
  it("reports 503 on /api/health when the database is not connected", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({ status: "degraded", db: "disconnected" });
  });

  it("marks API responses as not cacheable", async () => {
    const response = await request(app).get("/api/health");
    expect(response.get("Cache-Control")).toBe("no-store");
  });

  it("returns the standard 404 shape for unknown API routes", async () => {
    const response = await request(app).get("/api/does-not-exist");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { code: "NOT_FOUND", message: "Route GET /api/does-not-exist not found" },
    });
  });

  it("announces only the configured client origin", async () => {
    const allowed = await request(app).get("/api/health").set("Origin", env.CLIENT_ORIGIN);
    expect(allowed.get("Access-Control-Allow-Origin")).toBe(env.CLIENT_ORIGIN);

    const other = await request(app).get("/api/health").set("Origin", "https://evil.example");
    expect(other.get("Access-Control-Allow-Origin")).not.toBe("https://evil.example");
  });

  it("sets security headers and hides the framework", async () => {
    const response = await request(app).get("/api/health");
    expect(response.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.get("X-Powered-By")).toBeUndefined();
  });
});
import express, { type Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { AppError } from "../utils/AppError.js";
import { errorHandler, notFound } from "./errorHandler.js";

const SampleModel = mongoose.model(
  "ErrorHandlerSample",
  new mongoose.Schema({ bio: { type: String, maxlength: 5 } }),
);

function buildTestApp(): Express {
  const app = express();
  app.use(express.json({ limit: "1kb" }));

  app.get("/app-error", () => {
    throw AppError.forbidden("You can only edit your own comments");
  });

  app.get("/zod-error", () => {
    z.object({ username: z.string().min(3) }).parse({ username: "a" });
  });

  app.get("/cast-error", () => {
    throw new mongoose.Error.CastError("ObjectId", "abc", "_id");
  });

  app.get("/mongoose-validation-error", async() => {
    const document = new SampleModel({ bio: "far too long" });
    await document.validate();
    const validationError = document.validateSync();
    if (validationError) {
      throw validationError;
    }
  });

  app.get("/duplicate-key", () => {
    throw Object.assign(new Error('E11000 duplicate key error: { email: "ada@example.com" }'), {
      code: 11000,
    });
  });

  app.post("/echo", (_req, res) => {
    res.status(204).end();
  });

  app.get("/sync-bug", () => {
    throw new Error("Something exploded");
  });

  app.get("/async-bug", async () => {
    await Promise.resolve();
    throw new Error("Async failure");
  });

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

describe("errorHandler", () => {
  const app = buildTestApp();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a 404 in the standard shape for unknown routes", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await request(app).get("/does-not-exist");
    expect (errorSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: { code: "NOT_FOUND", message: "Route GET /does-not-exist not found" },
    });
  });

  it("keeps the status and code of an AppError", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await request(app).get("/app-error");
    expect(errorSpy).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      error: { code: "FORBIDDEN", message: "You can only edit your own comments" },
    });
  });

  it("turns a Zod error into a 400 with field details", async () => {
    const response = await request(app).get("/zod-error");
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: { code: "VALIDATION_ERROR", details: [{ path: "username" }] },
    });
  });

  it("turns an invalid MongoDB id into a 400 INVALID_ID", async () => {
    const response = await request(app).get("/cast-error");
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { code: "INVALID_ID", message: "Invalid value for _id" },
    });
  });

  it("turns a Mongoose schema failure into a 400 with field details", async () => {
    const response = await request(app).get("/mongoose-validation-error");
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: { code: "VALIDATION_ERROR", details: [{ path: "bio" }] },
    });
  });

  it("turns a duplicate key into a 409 without leaking the duplicated value", async () => {
    const response = await request(app).get("/duplicate-key");
    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: { code: "CONFLICT", message: "A record with these details already exists" },
    });
    expect(JSON.stringify(response.body)).not.toContain("ada@example.com");
  });

  it("rejects malformed JSON with a 400 INVALID_JSON", async () => {
    const response = await request(app)
      .post("/echo")
      .set("Content-Type", "application/json")
      .send('{"text": ');
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: { code: "INVALID_JSON", message: "Request body is not valid JSON" },
    });
  });

  it("rejects an oversized body with a 413", async () => {
    const response = await request(app).post("/echo").send({ text: "x".repeat(2000) });
    expect(response.status).toBe(413);
    expect(response.body).toEqual({
      error: { code: "PAYLOAD_TOO_LARGE", message: "Request body is too large" },
    });
  });

  it("turns an unexpected error into a 500 and logs it", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await request(app).get("/sync-bug");
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { code: "INTERNAL_ERROR", message: "Something exploded" },
    });
    expect(errorSpy).toHaveBeenCalled();
  });

  it("catches errors thrown inside async handlers", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const response = await request(app).get("/async-bug");
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: { code: "INTERNAL_ERROR", message: "Async failure" },
    });
  });
});
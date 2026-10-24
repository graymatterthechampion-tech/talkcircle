import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";


interface ErrorBody {
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}

function buildBody(code: string, message: string, details?: unknown): ErrorBody {
    if (details === undefined) {
        return {error: { code, message } };
    }
    return {error: { code, message, details } };
}

function isDuplicateKeyError(error: unknown): boolean {
    if (typeof error !== "object" || error === null) {
        return false;
    }
    if (!("code" in error)) {
        return false;
    }
    return error.code === 11000;
}

function getBodyParserType(error: unknown): string | null {
    if (typeof error !== "object" || error === null) {
        return null;
    }
    if (!("type" in error)) {
        return null;
    }
    const value = error.type;
    if (typeof value !== "string") {
        return null;
    }
    return value;
}

export const notFound: RequestHandler = (req, _res, next) => {
  next(AppError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
    if (res.headersSent) {
        next(error);
        return;
    }

    if (error instanceof AppError) {
        res.status(error.statusCode).json(buildBody(error.code, error.message, error.details));
        return;
    }

    if (error instanceof ZodError) {
     const issues = error.issues.map((issue) => ({
        path: issue.path.map((segment) => String(segment)).join("."),
        message: issue.message,
     }));
     res.status(400).json(buildBody("VALIDATION_ERROR", "Invalid request data", issues));
     return;
    }

    if(error instanceof mongoose.Error.CastError) {
        res.status(400).json(buildBody("INVALID_ID", `Invalid value for ${error.path}`));
        return;
    }

    if (error instanceof mongoose.Error.ValidationError) {
        const fields = Object.values(error.errors).map((fieldError) => ({
            path: fieldError.path,
            message: fieldError.message,
        }));
        res.status(400).json(buildBody("VALIDATION_ERROR", "Invalid data", fields));
        return;
    }

    if (isDuplicateKeyError(error)) {
        res.status(409).json(buildBody("CONFLICT", "A record with these details already exists"));
        return;
    }

    const parserType = getBodyParserType(error);

    if (parserType === "entity.parse.failed") {
        res.status(400).json(buildBody("INVALID_JSON", "Request body is not valid JSON"));
        return;
    }

    if (parserType === "entity.too.large") {
        res.status(413).json(buildBody("PAYLOAD_TOO_LARGE", "Request body is too large"));
        return;
    }

    const message = error instanceof Error ? error.message : "Uknown error";
    const stack = error instanceof Error ? error.stack : undefined;
    console.error(`Unhandled error: ${message}`);
    if (stack !== undefined) {
        console.error(stack);
    }

    const publicMessage = env.NODE_ENV === "production" ? "Something went wrong" : message;
    res.status (500).json(buildBody("INTERNAL_ERROR", publicMessage));

    
};


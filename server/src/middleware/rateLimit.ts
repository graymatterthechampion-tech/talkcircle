import type { NextFunction, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import { AppError } from "../utils/AppError.js";

const ONE_MINUTE_MS = 60_000;

function rejectTooManyRequests(_req: Request, _res: Response, next: NextFunction): void {
    next(new AppError(429, "RATE_LIMITED", "Too many requests. Please wait a moment and try again."));
}

export const authLimiter = rateLimit({
    windowMs: ONE_MINUTE_MS,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: rejectTooManyRequests,
});

export const apiLimiter = rateLimit({
    windowMs: ONE_MINUTE_MS,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: rejectTooManyRequests,
});

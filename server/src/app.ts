import cors from "cors";
import express, { type Express, type RequestHandler } from "express";
import helmet from "helmet";
import { isDBConnected } from "./config/db.js";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js"
import { apiLimiter, authLimiter } from "./middleware/rateLimit.js";

const noStore: RequestHandler = (_req, res, next) => {
    res.set("Cache-control", "no-store");
    next();
};

const healthCheck: RequestHandler = (_req, res) => {
    const uptimeSeconds = Math.round(process.uptime());

    if (isDBConnected()) {
        res.status(200).json({status: "ok", db: "connected", uptime: uptimeSeconds});
        return;
    }

    res.status(503).json({status: "degraded", db: "disconnected", uptime: uptimeSeconds});
};

export const app: Express = express();

if(env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

app.use(helmet());
app.use(cors({origin: env.CLIENT_ORIGIN}));
app.use(express.json({limit: "1mb"}));
app.use("/api", noStore);

app.get("/api/health", healthCheck);

app.use("/api", apiLimiter);
app.use("/api/auth", authLimiter);

app.use(notFound);
app.use(errorHandler);
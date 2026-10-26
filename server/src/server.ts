import type { Server} from "node:http";
import { app } from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { env } from "./config/env.js";


const SHUTDOWN_TIMEOUT_MS = 10_000;

let server: Server | null = null;
let shuttingDown = false;

function closeHttpServer(httpServer: Server): Promise<void> {
   return new Promise((resolve, reject) => {
    httpServer.close((error) => {
        if (error) {
            reject(error);
            return;
        }
        resolve();
    });
   });
}

async function shutdown(reason: string, exitCode: number): Promise<void> {
    if (shuttingDown) {
        return;
    }
    shuttingDown = true;
    console.info(`${reason}: shutting down`);

    const forceExit = setTimeout(() => {
        console.error("Shutdown timed out, forcing exit");
        process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExit.unref();

    try {
        if (server !== null) {
            await closeHttpServer(server);
        }
        await disconnectDB();
        clearTimeout(forceExit);
        process.exit(exitCode);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`Error during shutdown: ${message}`);
        process.exit(1);
    }
}

async function start(): Promise<void> {
    await connectDB();

    server = app.listen(env.PORT,(error?: Error) => {
        if (error) {
            console.error(`Could not start server on port ${env.PORT}: ${error.message}`);
            void shutdown("Startup failure", 1);
            return;
        }
        console.info(`Server listening on port ${env.PORT} (${env.NODE_ENV})`);
    });
}

process.on("SIGINT", () => {
    void shutdown("SIGINT", 0);
});

process.on("SIGTERM", () => {
    void shutdown("SIGTERM", 0);
});

process.on("unhandledRejection", (reason) => {
    const message = reason instanceof Error ? reason.message : "Unknown reason";
    console.error(`Unhandled promise rejection: ${message}`);
    void shutdown("unhandled rejection", 1);
});

process.on ("uncaughtException", (error) => {
    console.error(`Uncaught exception: ${error.stack ?? error.message}`);
    void shutdown("Uncaught exception", 1);
});

start().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unkown error";
    console.error(`Failed to start server: ${message}`);
    process.exit(1);
});
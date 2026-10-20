import mongoose from "mongoose";
import { env } from "./env.js";

let listernersAttached = false;

function attachConnectionListeners(): void {
    if (listernersAttached) {
        return;
    }
    mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
       console.info("MongoDB reconnected");
    });

    mongoose.connection.on("error", (error: Error) => {
        console.error(`MongoDB connection error: ${error.message}`);
    });

    listernersAttached = true;
}

export async function connectDB(): Promise<void> {
    attachConnectionListeners();
    mongoose.set("strictQuery", true);

    try {
        const instance = await mongoose.connect(env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10_000,
            maxPoolSize: 10,
        });
        console.info(`MongoDB connected: ${instance.connection.host}`);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unkown error";
        console.error(`MongoDB initial connection failed: ${message}`);
        throw error;
    }

   
}

export async function disconnectDB(): Promise<void> {
    await mongoose.connection.close();
    console.info("MongoDB connection closed");
}

export function isDBConnected(): boolean {
    return mongoose.connection.readyState === mongoose.ConnectionStates.connected;
}
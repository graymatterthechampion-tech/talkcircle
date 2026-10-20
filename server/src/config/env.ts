import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.enum (["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    MONGODB_URI: z.string().startsWith("mongodb"),
    CLIENT_ORIGIN: z.url(),
    JWT_SECRET: z.string().min(32),

});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        const problems = result.error.issues.map((issue) => {
            const variableName = issue.path.join(".");
            return ` -${variableName}: ${issue.message}`;
        });

        console.error("invalid environment configuration. Fix server/.env:");
        console.error(problems.join("\n"));
        process.exit(1);
    }

    return result.data;
}

export const env = Object.freeze(loadEnv());
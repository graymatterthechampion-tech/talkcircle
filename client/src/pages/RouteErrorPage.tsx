import type { JSX } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";

function describeError(error: unknown): string {
    if (isRouteErrorResponse(error)) {
        return `The page returned an error (${error.status}).`;
    }
    return "This page couldn't load. Check your connection and try again.";
}

export function RouteErrorPage(): JSX.Element {
    const error = useRouteError();

    return (
        <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-6">
            <h1 className="font-dispaly text-3xl font-bold">Something went wrong</h1>
            <p className="text-ink-muted">{describeError(error)}</p>
            <button
            type= "button"
            onClick={() => {
                window.location.reload();
            }}
            className="flex min-h-11 items-center justify-center rounded-full bg-accent px-5 font-semibold text-on-accent"
            >
                Try again
        </button>
        </main>
    );
}
import type { JSX } from "react";
import { Link } from "react-router";

export default function NotFoundPage(): JSX.Element {
    return (
        <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-6">
        <h1 className="font-display text-3xl font-bold">Page not found </h1>
        <p className="text-ink-muted">That page doesn't exist, or it may have moved.</p>
        <Link
        to="/home"
        className="flex min-h-11 items-center justify-center rounded-full bg-accent px-5 font-semibold text-on-accent"
        >
        Go to Home
        </Link>
        </main>
   );
}
import type { JSX } from "react";
import { Link } from "react-router";

export default function LandingPage(): JSX.Element {
    return (
        <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
            <h1 className="font-logo text-5xl font-bold">Circle</h1>
            <p className="text-lg text-ink-muted">Where fans talk.</p>
            <Link
            to="/home"
            className="flex min-h-11 items-center justify-center rounded-full bg-accent px-5 font-semibold text-on-accent"
            >
                Enter Circle
            </Link>
        </main>
    );
}
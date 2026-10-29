import type { JSX } from "react";

export function PageLoading(): JSX.Element {
    return (
        <div role="status" className="flex min-h-dvh items-center justify-center text-ink-muted">
            Loading...
        </div>
    );
    
}
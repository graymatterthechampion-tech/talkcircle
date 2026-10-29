import type { JSX } from "react";

interface PagePlaceholderProps {
    title: string;
    description: string;
}

export function PagePlaceholder({title, description }: PagePlaceholderProps): JSX.Element {
    return (
        <section className="flex flex-col gap-2">
            <h1 className="font-display text-2xl font-bold">{title}</h1>
            <p className="text-ink-muted">{description}</p>
        </section>
    );
}
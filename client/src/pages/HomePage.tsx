import type { JSX } from "react";
import { PagePlaceholder } from "../components/layout/PagePlaceholder.tsx";

export default function Homepage(): JSX.Element {
    return <PagePlaceholder title="Home" description="Posts from your circles and the people you follow." />;
}
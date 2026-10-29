import type { JSX } from "react";
import { useParams } from "react-router";
import { PagePlaceholder } from "../components/layout/PagePlaceholder.tsx";

export default function ProfilePage(): JSX.Element {
    const { username } = useParams();

    if (username === undefined) {
        return <PagePlaceholder title="Profile" description="No Username in the address." />
    }

    return <PagePlaceholder title={`@${username}`} description="Profile details coming soon." />
}
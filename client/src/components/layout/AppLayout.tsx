import type { JSX } from "react";
import { Outlet, useNavigation } from "react-router";
import { BottomNav } from "./BottomNav.tsx";

export function AppLayout(): JSX.Element {
    const navigation = useNavigation();
    const isLoadingPage = navigation.state === "loading";


    return (
        <div className="min-h-dvh">
            {isLoadingPage ? (
                <div
                role="progressbar"
                aria-label="Loading page"
                className="fixed inset-x-0 top-0 z-20 h-0.5 bg-accent motion-safe: animate-pulse"
                />
            ) : null}
            <main className="mx-auto max-w-md px-4 pb-24">
                <Outlet />
            </main>
            <BottomNav />
            </div>
    );
}
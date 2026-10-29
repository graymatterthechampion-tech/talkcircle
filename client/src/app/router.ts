import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router";
import { AppLayout } from "../components/layout/AppLayout.tsx";
import { PageLoading } from "../components/layout/PageLoading.tsx";
import { RouteErrorPage } from "../pages/RouteErrorPage.tsx";

interface PageModule {
    default: ComponentType;
}

async function loadPage(
    importpage: () => Promise<PageModule>,

): Promise<{Component: ComponentType}> {
    const PageModule = await importpage();
    return { Component: PageModule.default };
}

export const router =createBrowserRouter([
    {
        ErrorBoundary: RouteErrorPage,
        HydrateFallback: PageLoading,
        children: [
            {
                path: "/",
                lazy: () => loadPage(() => import("../pages/LandingPage.tsx")),
            },
            {
                Component: AppLayout,
                children: [
                    {path: "/home", lazy: () => loadPage(() => import("../pages/HomePage.tsx")) },
                    {path: "/explore", lazy: () => loadPage(() => import("../pages/ExplorePage.tsx")) },
                    {path: "/create", lazy: () => loadPage(() => import("../pages/CreatePostPage.tsx")) },
                    {path: "/chats", lazy: () => loadPage(() => import("../pages/ChatsPage.tsx")) },
                    {path: "/profile", lazy: () => loadPage(() => import("../pages/MyProfilePage.tsx")) },
                    {path: "/u/:username", lazy: () => loadPage(() => import("../pages/ProfilePage.tsx")) },
                    {path: "/search", lazy: () => loadPage(() => import("../pages/SearchPage.tsx")) },
                ],
            },
            {
                path: "*",
                lazy: () => loadPage(() => import("../pages/NotFoundPage.tsx")),
            },
        ],
    },
]);
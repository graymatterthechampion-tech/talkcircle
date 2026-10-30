import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import "./index.css";
import { router } from "./app/router.ts";
import { startThemeSync } from "./lib/theme.ts";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("Root element #root was not found in index.html");
}

startThemeSync();

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
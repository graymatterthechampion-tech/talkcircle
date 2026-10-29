import type { JSX } from "react";
import { NavLink } from "react-router";
import { NAV_ITEMS } from "./navItems.ts";

export function BottomNav(): JSX.Element {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-canvas pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-md items-center justify-around px-1 py-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              aria-label={item.label}
              className={({ isActive }) =>
                isActive
                  ? "flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 rounded-control text-accent"
                  : "flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 rounded-control text-icon-muted"
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon aria-hidden="true" size={24} strokeWidth={2} />
                  <span
                    aria-hidden="true"
                    className={isActive ? "size-1.5 rounded-full bg-accent" : "size-1.5 rounded-full"}
                  />
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";

const NAV_HIDDEN = new Set(["/", "/onboarding"]);

export function AppShell() {
  const { pathname } = useLocation();
  const hideNav =
    NAV_HIDDEN.has(pathname) ||
    pathname.startsWith("/report") ||
    pathname.startsWith("/analyze") ||
    pathname.startsWith("/review");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className={hideNav ? "pb-0" : "pb-28"}>
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}

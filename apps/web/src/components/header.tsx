"use client";
import Link from "next/link";
import { Activity } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-emerald-500" />
              <span className="text-lg font-semibold text-foreground">AMC</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {links.map(({ to, label }) => {
                return (
                  <Link
                    key={to}
                    href={to}
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-all text-muted-foreground hover:text-accent-foreground hover:bg-accent"
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  User, 
  Activity,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import UserMenu from "@/components/user-menu";
import { ModeToggle } from "@/components/mode-toggle";

export default function DashboardNavbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  type NavLink = {
    href: string;
    label: string;
  };

  const navLinks: NavLink[] = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/profile", label: "Profile" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-emerald-500" />
              <span className="text-lg font-semibold text-card-foreground">AMC</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href as any}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-muted-foreground hover:text-card-foreground hover:bg-muted"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <UserMenu />
            
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-card-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href as any}
                    className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                      isActive
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-muted-foreground hover:text-card-foreground"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}

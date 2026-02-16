"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Package, Archive, User, Home, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Главная", icon: Home },
  { href: "/parcels", label: "Посылки", icon: Package },
  { href: "/archive", label: "Архив", icon: Archive },
  { href: "/profile", label: "Профиль", icon: User },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top header — в стиле главной */}
      <header className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            <span className="hidden sm:block">GOLD CARGO</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.name} {user?.surname}
            </span>
            {user?.role === "ADMIN" && (
              <Link href="/admin">
                <Button variant="outline" size="sm" className="text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50">
                  <ShieldCheck className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Админ панель</span>
                  <span className="sm:hidden">Админ</span>
                </Button>
              </Link>
            )}
            <ThemeToggle />
            <div className="w-px h-5 bg-border mx-1" />
            <Button variant="ghost" size="icon" onClick={logout} title="Выйти">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden z-40">
        <div className="flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${active ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Icon className="h-5 w-5 mb-0.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop side nav */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-card border-r flex-col pt-16 z-30">
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active
                  ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

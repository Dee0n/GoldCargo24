"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { useEffect } from "react";
import {
  LayoutDashboard, Package, Upload, Users, Tag, Settings, LogOut, Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: "/admin", label: t.nav.dashboard, icon: LayoutDashboard, exact: true },
    { href: "/admin/upload", label: t.nav.uploadXlsx, icon: Upload },
    { href: "/admin/tracks", label: t.nav.tracks, icon: Package },
    { href: "/admin/users", label: t.nav.users, icon: Users },
    { href: "/admin/statuses", label: t.nav.statuses, icon: Tag },
    { href: "/admin/settings", label: t.nav.settings, icon: Settings },
  ];

  useEffect(() => {
    if (!loading && user && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t.common.loading}</div>;

  const isActive = (item: { href: string; exact?: boolean }) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + "/");

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Package className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-white">GOLD CARGO</p>
            <p className="text-xs text-gray-400">{t.admin.panel}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                ? "bg-amber-500 text-white"
                : "text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10 space-y-2">
        <p className="text-xs text-gray-400">{user?.name} {user?.surname}</p>
        <Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start text-gray-400 hover:text-white px-0">
          <LogOut className="h-4 w-4 mr-2" /> {t.common.logout}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-60 bg-gray-900 dark:bg-gray-950 flex-col shrink-0 fixed h-full z-30">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-gray-900 dark:bg-gray-950">
            <Sidebar />
          </aside>
        </div>
      )}

      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        <header className="bg-background border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-foreground flex-1">
            {navItems.find((i) => isActive(i))?.label || t.nav.admin}
          </h1>
          <LocaleSwitcher />
          <ThemeToggle />
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="text-muted-foreground">
              {t.common.toSite}
            </Button>
          </Link>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

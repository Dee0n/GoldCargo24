"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, ArrowLeft } from "lucide-react";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLocale();
  const [form, setForm] = useState({
    name: "", surname: "", phone: "", email: "", password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t.auth.checkData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-background dark:from-amber-950/20 dark:to-background flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>

      <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Package className="h-5 w-5 text-white" />
        </div>
        GOLD CARGO
      </Link>

      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t.auth.registerTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">{t.auth.registerSubtitle}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label>{t.auth.name}</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>{t.auth.surname} <span className="text-muted-foreground text-xs">{t.auth.surnameOptional}</span></Label>
              <Input value={form.surname} onChange={(e) => setForm((p) => ({ ...p, surname: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t.auth.phone}</Label>
              <Input type="tel" placeholder="+7 (777) 123-45-67" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>{t.auth.email} <span className="text-muted-foreground text-xs">{t.auth.emailOptional}</span></Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t.auth.password}</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white">
              {loading ? t.auth.registering : t.auth.register}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t.auth.hasAccount} </span>
            <Link href="/login" className="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-medium">
              {t.auth.loginTitle}
            </Link>
          </div>
        </CardContent>
      </Card>

      <Link href="/" className="mt-6 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> {t.auth.toHome}
      </Link>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ArrowLeft, MessageCircle } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setWhatsapp(d.settings?.whatsappNumber || ""))
      .catch(() => { });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(phone, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const forgotPasswordUrl = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Здравствуйте, я забыл(а) пароль. Мой номер: ")}`
    : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-background dark:from-amber-950/20 dark:to-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <Package className="h-8 w-8 text-amber-600" />
            <span className="text-xl font-bold">GOLD CARGO</span>
          </Link>
          <CardTitle>Вход</CardTitle>
          <CardDescription>Введите номер телефона и пароль</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="77001234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Пароль</Label>
                {forgotPasswordUrl && (
                  <a
                    href={forgotPasswordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-600 hover:underline flex items-center gap-1"
                  >
                    <MessageCircle className="h-3 w-3" />
                    Забыли пароль?
                  </a>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Вход..." : "Войти"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Нет аккаунта?{" "}
              <Link href="/register" className="text-amber-600 hover:underline">
                Зарегистрироваться
              </Link>
            </p>
            <Link href="/" className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3 w-3" />
              На главную
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

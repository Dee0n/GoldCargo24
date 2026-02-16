"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Mail, Hash, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [passwordForm, setPasswordForm] = useState({ password: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          surname: form.surname,
          email: form.email,
          phone: form.phone,
        }),
        credentials: "include",
      });
      if (res.ok) {
        await refreshUser();
        toast.success("Профиль обновлён");
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.password.length < 4) {
      toast.error("Пароль должен быть не менее 4 символов");
      return;
    }
    if (passwordForm.password !== passwordForm.confirm) {
      toast.error("Пароли не совпадают");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordForm.password }),
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Пароль изменён");
        setPasswordForm({ password: "", confirm: "" });
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="md:ml-56 max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Мой профиль</h1>

      {/* Personal info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Личные данные
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Имя</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Фамилия <span className="text-muted-foreground text-xs">(необязательно)</span></Label>
              <Input value={form.surname} onChange={(e) => setForm((p) => ({ ...p, surname: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email <span className="text-muted-foreground text-xs">(необязательно)</span></Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Phone className="h-3 w-3" /> Телефон</Label>
            <Input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </div>

          {user?.clientCode && (
            <>
              <Separator />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="h-4 w-4" />
                <span>Код клиента: <strong className="text-foreground">{user.clientCode}</strong></span>
              </div>
            </>
          )}

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
        </CardContent>
      </Card>

      {/* Password change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" /> Сменить пароль
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Новый пароль</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={passwordForm.password}
                onChange={(e) => setPasswordForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Минимум 4 символа"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Подтвердите пароль</Label>
            <Input
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
              placeholder="Повторите пароль"
            />
          </div>
          <Button onClick={handlePasswordChange} disabled={savingPassword || !passwordForm.password} variant="outline" className="w-full">
            {savingPassword ? "Изменение..." : "Изменить пароль"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

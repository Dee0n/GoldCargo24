"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Mail, Hash, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { t } = useLocale();
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
        toast.success(t.profile.profileUpdated);
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
      toast.error(t.profile.passwordMinError);
      return;
    }
    if (passwordForm.password !== passwordForm.confirm) {
      toast.error(t.profile.passwordMismatch);
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
        toast.success(t.profile.passwordChanged);
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
      <h1 className="text-2xl font-bold">{t.profile.title}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> {t.profile.personalData}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.auth.name}</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t.auth.surname} <span className="text-muted-foreground text-xs">{t.auth.surnameOptional}</span></Label>
              <Input value={form.surname} onChange={(e) => setForm((p) => ({ ...p, surname: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Mail className="h-3 w-3" /> {t.auth.email} <span className="text-muted-foreground text-xs">{t.auth.emailOptional}</span></Label>
            <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1"><Phone className="h-3 w-3" /> {t.auth.phone}</Label>
            <Input type="tel" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
          </div>

          {user?.clientCode && (
            <>
              <Separator />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="h-4 w-4" />
                <span>{t.dashboard.clientCode}: <strong className="text-foreground">{user.clientCode}</strong></span>
              </div>
            </>
          )}

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? t.common.saving : t.common.save}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" /> {t.profile.changePassword}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.profile.newPassword}</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={passwordForm.password}
                onChange={(e) => setPasswordForm((p) => ({ ...p, password: e.target.value }))}
                placeholder={t.profile.minChars}
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
            <Label>{t.profile.confirmPassword}</Label>
            <Input
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
              placeholder={t.profile.repeatPassword}
            />
          </div>
          <Button onClick={handlePasswordChange} disabled={savingPassword || !passwordForm.password} variant="outline" className="w-full">
            {savingPassword ? t.profile.changingPassword : t.profile.changePasswordBtn}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

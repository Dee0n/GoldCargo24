"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Save, DollarSign, MapPin, Phone, Info, ShieldAlert, BookOpen, Instagram } from "lucide-react";
import { toast } from "sonner";

interface Settings {
  exchangeRate: number; chinaAddress: string;
  warehouseAddress: string; whatsappNumber: string; instagramLink: string;
  aboutText: string; prohibitedItems: string; instructionText: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setSettings(d.settings))
      .finally(() => setLoading(false));
  }, []);

  const update = (key: keyof Settings, value: string | number) => {
    setSettings((p) => p ? { ...p, [key]: value } : p);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const r = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
        credentials: "include",
      });
      if (r.ok) {
        toast.success("Настройки сохранены");
      } else {
        const d = await r.json();
        toast.error(d.error || "Ошибка сохранения");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-muted-foreground">Загрузка...</div>;
  if (!settings) return <div className="text-center py-16 text-red-400">Ошибка загрузки</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Настройки</h1>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Сохранение..." : "Сохранить всё"}
        </Button>
      </div>

      {/* Finance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-4 w-4 text-amber-500" /> Финансы
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Курс юаня к тенге (¥ → ₸)</Label>
            <Input
              type="number"
              step="0.01"
              value={settings.exchangeRate ?? ""}
              onChange={(e) => update("exchangeRate", parseFloat(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">1 юань = {settings.exchangeRate} ₸</p>
          </div>
        </CardContent>
      </Card>

      {/* Addresses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="h-4 w-4 text-amber-500" /> Адреса
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Адрес склада в Китае</Label>
            <Input
              value={settings.chinaAddress || ""}
              onChange={(e) => update("chinaAddress", e.target.value)}
              placeholder="Провинция, город, адрес..."
            />
          </div>
          <div className="space-y-2">
            <Label>Адрес склада в Усть-Каменогорске</Label>
            <Input
              value={settings.warehouseAddress || ""}
              onChange={(e) => update("warehouseAddress", e.target.value)}
              placeholder="Алматы, Космическая 8/2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-4 w-4 text-amber-500" /> Контакты
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-green-500" /> Номер WhatsApp
            </Label>
            <Input
              value={settings.whatsappNumber || ""}
              onChange={(e) => update("whatsappNumber", e.target.value)}
              placeholder="+7 (700) 123-45-67"
            />
            <p className="text-xs text-muted-foreground">Только цифры для ссылки: 77001234567</p>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Instagram className="h-3.5 w-3.5 text-pink-500" /> Ссылка на Instagram
            </Label>
            <Input
              value={settings.instagramLink || ""}
              onChange={(e) => update("instagramLink", e.target.value)}
              placeholder="https://instagram.com/goldcargo"
            />
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-amber-500" /> О компании
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={settings.aboutText || ""}
            onChange={(e) => update("aboutText", e.target.value)}
            rows={4}
            placeholder="Описание компании..."
          />
        </CardContent>
      </Card>

      {/* Prohibited */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="h-4 w-4 text-red-500" /> Запрещённые товары
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={settings.prohibitedItems || ""}
            onChange={(e) => update("prohibitedItems", e.target.value)}
            rows={5}
            placeholder="Каждый запрещённый товар с новой строки..."
          />
          <p className="text-xs text-muted-foreground mt-2">Поддерживается многострочный текст. Отображается на главной странице.</p>
        </CardContent>
      </Card>

      {/* Instruction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-amber-500" /> Инструкция
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={settings.instructionText || ""}
            onChange={(e) => update("instructionText", e.target.value)}
            rows={6}
            placeholder="Инструкция для клиентов..."
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Сохранение..." : "Сохранить все настройки"}
        </Button>
      </div>
    </div>
  );
}

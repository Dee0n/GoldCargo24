"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface ImportResult {
  created: number;
  updated: number;
  errors: string[];
  total: number;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".xlsx") && !f.name.endsWith(".xls")) {
      toast.error("Поддерживаются только .xlsx и .xls файлы");
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/tracks/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Ошибка загрузки");
        return;
      }

      setResult(data);
      if (data.errors.length === 0) {
        toast.success(`Загружено: ${data.created} создано, ${data.updated} обновлено`);
      } else {
        toast.warning(`Загружено с ошибками: ${data.errors.length} ошибок`);
      }
    } catch {
      toast.error("Ошибка соединения");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Загрузка XLSX</h1>
        <p className="text-muted-foreground mt-1">Импорт треков из файла китайского склада</p>
      </div>

      {/* Format info */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
        <CardContent className="pt-4 text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <p className="font-medium">Ожидаемый формат файла:</p>
          <ul className="space-y-0.5 text-blue-700 dark:text-blue-300">
            <li>快递单号 — трек-номер</li>
            <li>总单号 — номер партии</li>
            <li>客户姓名 — код клиента</li>
            <li>添加时间 — дата добавления</li>
            <li>更新时间 — дата обновления</li>
            <li>状态 — статус (китайское название)</li>
          </ul>
        </CardContent>
      </Card>

      {/* Upload area */}
      <Card>
        <CardHeader>
          <CardTitle>Выберите файл</CardTitle>
          <CardDescription>Перетащите файл или нажмите для выбора</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30" : "border-border hover:border-muted-foreground/30"
              }`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
          >
            {file ? (
              <div className="space-y-2">
                <FileSpreadsheet className="h-12 w-12 text-green-500 mx-auto" />
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                <p className="text-muted-foreground">Перетащите .xlsx файл сюда</p>
                <p className="text-sm text-muted-foreground">или нажмите для выбора</p>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          {file && (
            <div className="mt-4 flex gap-2">
              <Button onClick={handleUpload} disabled={uploading} className="flex-1">
                {uploading ? "Импорт..." : "Начать импорт"}
              </Button>
              <Button variant="outline" onClick={() => { setFile(null); setResult(null); }}>
                Очистить
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card className={result.errors.length === 0 ? "border-green-200" : "border-yellow-200"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.errors.length === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              Результат импорта
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-2xl font-bold text-foreground">{result.total}</p>
                <p className="text-xs text-muted-foreground">Всего строк</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{result.created}</p>
                <p className="text-xs text-muted-foreground">Создано</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.updated}</p>
                <p className="text-xs text-muted-foreground">Обновлено</p>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="border border-red-200 dark:border-red-800 rounded-lg p-3 bg-red-50 dark:bg-red-950/30 max-h-48 overflow-y-auto">
                <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-2 flex items-center gap-1">
                  <XCircle className="h-4 w-4" /> Ошибки ({result.errors.length}):
                </p>
                {result.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-600 font-mono">{err}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

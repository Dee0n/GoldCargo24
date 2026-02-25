"use client";

import { useLocale } from "@/components/providers/locale-provider";

interface HistoryItem {
  id: string;
  date: string;
  status: { name: string; color: string };
  note?: string | null;
}

export function TrackTimeline({ history }: { history: HistoryItem[] }) {
  const { locale } = useLocale();
  return (
    <div className="space-y-4">
      {history.map((item, index) => (
        <div key={item.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.status.color }}
            />
            {index < history.length - 1 && (
              <div className="w-0.5 flex-1 bg-gray-200 min-h-[24px]" />
            )}
          </div>
          <div className="pb-4">
            <p className="font-medium text-sm" style={{ color: item.status.color }}>
              {item.status.name}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(item.date).toLocaleString(locale === "kz" ? "kk-KZ" : "ru-RU")}
            </p>
            {item.note && <p className="text-xs text-gray-400 mt-1">{item.note}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

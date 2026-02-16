"use client";

import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  name: string;
  color: string;
}

export function StatusBadge({ name, color }: StatusBadgeProps) {
  return (
    <Badge
      style={{ backgroundColor: color, color: "#fff" }}
      className="text-xs font-medium"
    >
      {name}
    </Badge>
  );
}

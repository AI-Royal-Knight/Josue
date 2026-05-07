"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type InlineCreateProps = {
  placeholder: string;
  onConfirm: (name: string) => void;
  onCancel: () => void;
  confirmLabel?: string;
  confirmClass?: string;
};

export function InlineCreate({
  placeholder,
  onConfirm,
  onCancel,
  confirmLabel = "Create",
  confirmClass = "",
}: InlineCreateProps) {
  const [value, setValue] = useState("");

  const confirm = () => {
    const trimmed = value.trim();
    if (trimmed) onConfirm(trimmed);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        autoFocus
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") confirm();
          if (e.key === "Escape") onCancel();
        }}
        className="h-8 w-44 rounded border-[#2d4060] bg-[#111d33] text-[13px] text-[#e2e8f0] placeholder:text-[#374151] focus-visible:ring-blue-500"
      />
      <Button
        size="sm"
        onClick={confirm}
        className={cn("h-8 rounded text-[12px] font-semibold", confirmClass)}
      >
        {confirmLabel}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={onCancel}
        className="h-8 rounded border border-[#1e3a5f] text-[12px] text-[#8a9ab5] hover:bg-[#1a2d45] hover:text-[#e2e8f0]"
      >
        Cancel
      </Button>
    </div>
  );
}

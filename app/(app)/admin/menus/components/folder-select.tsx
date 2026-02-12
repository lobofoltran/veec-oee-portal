"use client";

import { Folder } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FolderOption = {
  id: string;
  label: string;
  parentId: string | null;
};

export function FolderSelect({
  value,
  onValueChange,
  folders,
}: {
  value: string | null;
  onValueChange: (value: string | null) => void;
  folders: FolderOption[];
}) {
  return (
    <Select value={value ?? "none"} onValueChange={(nextValue) => onValueChange(nextValue === "none" ? null : nextValue)}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma pasta" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Sem pasta pai</SelectItem>
        {folders.map((folder) => (
          <SelectItem key={folder.id} value={folder.id}>
            <span className="inline-flex items-center gap-2">
              <Folder className="size-3.5 text-primary" />
              {folder.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

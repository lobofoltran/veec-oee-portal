"use client";

import { useMemo, useState } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReferenceOption } from "@/lib/dictionary/crud";

const EMPTY_VALUE = "__empty__";

export function CrudSelectField({
  id,
  name,
  label,
  required,
  defaultValue,
  options,
}: {
  id: string;
  name: string;
  label: string;
  required: boolean;
  defaultValue?: string;
  options: ReferenceOption[];
}) {
  const initialValue = useMemo(() => {
    if (!defaultValue) return EMPTY_VALUE;
    return defaultValue;
  }, [defaultValue]);

  const [value, setValue] = useState(initialValue);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger id={id} aria-required={required} className="h-9 w-full px-3 py-1 text-sm">
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={EMPTY_VALUE}>Selecione...</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input
        type="hidden"
        name={name}
        required={required}
        value={value === EMPTY_VALUE ? "" : value}
      />
    </div>
  );
}

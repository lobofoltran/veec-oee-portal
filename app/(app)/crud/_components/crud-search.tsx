"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CrudSearch({ initialSearch, pageSize }: { initialSearch: string; pageSize: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(initialSearch);
  const [limit, setLimit] = useState(String(pageSize));

  const currentLimit = useMemo(() => {
    const pageSizeParam = searchParams.get("pageSize") ?? searchParams.get("limit");
    const parsed = Number(pageSizeParam);

    if (!Number.isFinite(parsed) || parsed < 1) {
      return pageSize;
    }

    return Math.floor(parsed);
  }, [searchParams, pageSize]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();

    if (trimmed) {
      next.set("q", trimmed);
    } else {
      next.delete("q");
    }

    next.set("page", "1");
    next.set("pageSize", limit);

    startTransition(() => {
      const queryString = next.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    });
  }

  function handleReset() {
    setValue("");
    setLimit(String(pageSize));

    startTransition(() => {
      const next = new URLSearchParams(searchParams.toString());
      next.delete("q");
      next.delete("page");
      next.set("pageSize", String(pageSize));
      router.push(`${pathname}?${next.toString()}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row md:items-center">
      <Input
        placeholder="Pesquisar em múltiplos campos"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="md:max-w-sm"
        aria-label="Buscar registros"
      />
      <Select
        value={limit}
        onValueChange={(nextLimit) => {
          setLimit(nextLimit);
          const next = new URLSearchParams(searchParams.toString());
          next.set("page", "1");
          next.set("pageSize", nextLimit);
          if (!value.trim()) {
            next.delete("q");
          }
          startTransition(() => {
            router.push(`${pathname}?${next.toString()}`);
          });
        }}
      >
        <SelectTrigger className="w-full md:w-36">
          <SelectValue placeholder="Itens/página" />
        </SelectTrigger>
        <SelectContent>
          {[10, 20, 50, 100].map((option) => (
            <SelectItem key={option} value={String(option)}>
              {option} / página
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Aplicando..." : "Aplicar"}
        </Button>
        <Button type="button" variant="outline" onClick={handleReset} disabled={isPending || (!value && currentLimit === pageSize)}>
          Limpar
        </Button>
      </div>
    </form>
  );
}

"use client";

import Link from "next/link";
import { ChevronDown, Link2, Table2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function CrudNewActions({
  newHref,
  menuHref,
  dictionaryHref,
  hasMenu,
}: {
  newHref: string;
  menuHref: string;
  dictionaryHref: string;
  hasMenu: boolean;
}) {
  return (
    <div className="flex items-center">
      <Button asChild className="rounded-r-none">
        <Link href={newHref}>Novo registro</Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="icon" className="rounded-l-none border-l border-primary-foreground/20" aria-label="Ações de novo registro">
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={dictionaryHref}>
              <Table2 className="size-4" />
              Ver dicionário
            </Link>
          </DropdownMenuItem>
          {hasMenu ? (
            <DropdownMenuItem disabled>
              <Link2 className="size-4" />
              Menu já existe para esta rota
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
              <Link href={menuHref}>
                <Link2 className="size-4" />
                Criar atalho no menu
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type State = {
  ok: boolean;
  message?: string;
};

type ActionFn = (previous: State, formData: FormData) => Promise<State>;

export function CrudCreateMenuHint({
  defaultLabel,
  defaultHref,
  action,
}: {
  defaultLabel: string;
  defaultHref: string;
  action: ActionFn;
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false });

  return (
    <details className="rounded-md border border-dashed p-3 text-sm">
      <summary className="text-muted-foreground hover:text-foreground cursor-pointer select-none">Criar menu</summary>
      <form action={formAction} className="mt-3 grid gap-3 md:grid-cols-4">
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="menu-label">Nome do menu</Label>
          <Input id="menu-label" name="label" defaultValue={defaultLabel} placeholder="Ex.: Clientes" required />
        </div>
        <div className="space-y-1 md:col-span-2">
          <Label htmlFor="menu-href">Caminho</Label>
          <Input id="menu-href" name="href" defaultValue={defaultHref} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="menu-icon">Ícone</Label>
          <Input id="menu-icon" name="icon" defaultValue="FileText" placeholder="FileText" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="menu-order">Ordem</Label>
          <Input id="menu-order" name="order" type="number" defaultValue={0} />
        </div>
        <div className="md:col-span-2 flex items-end">
          <Button type="submit" size="sm" disabled={pending}>{pending ? "Criando..." : "Criar menu"}</Button>
        </div>
      </form>
      {state.message ? (
        <p className={state.ok ? "mt-2 text-xs text-emerald-600" : "text-destructive mt-2 text-xs"}>{state.message}</p>
      ) : null}
    </details>
  );
}

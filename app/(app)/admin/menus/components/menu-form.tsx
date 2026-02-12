"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createMenuAction } from "../actions/create-menu";
import { updateMenuAction } from "../actions/update-menu";
import { FolderSelect, type FolderOption } from "./folder-select";
import { FolderTree } from "./folder-tree";
import { menuFormSchema, type MenuFormInput } from "../schema/menu.schema";
import { IconPreview, IconSelect } from "./icon-select";

export type MenuFormRecord = {
  id: string;
  label: string;
  href: string | null;
  icon: string;
  parentId: string | null;
  order: number;
  enabled: boolean;
};

function toDefaults(initial?: MenuFormRecord, prefill?: Partial<MenuFormInput>): MenuFormInput {
  if (!initial) {
    return {
      name: prefill?.name ?? "",
      path: prefill?.path ?? "",
      icon: prefill?.icon ?? "FileText",
      folderId: prefill?.folderId ?? null,
      order: prefill?.order ?? 0,
      active: prefill?.active ?? true,
      visible: prefill?.visible ?? true,
      isFolder: prefill?.isFolder ?? false,
    };
  }

  return {
    name: initial.label,
    path: initial.href ?? "",
    icon: initial.icon,
    folderId: initial.parentId,
    order: initial.order,
    active: initial.enabled,
    visible: initial.enabled,
    isFolder: initial.href == null,
  };
}

export function MenuForm({ mode, initialMenu, prefill, folders }: { mode: "create" | "edit"; initialMenu?: MenuFormRecord; prefill?: Partial<MenuFormInput>; folders: FolderOption[] }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    watch,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MenuFormInput>({
    resolver: zodResolver(menuFormSchema),
    defaultValues: toDefaults(initialMenu, prefill),
  });

  const isFolder = Boolean(watch("isFolder"));

  async function onSubmit(values: MenuFormInput) {
    setFormError(null);

    const result = mode === "create" ? await createMenuAction(values) : await updateMenuAction(initialMenu!.id, values);

    if (!result.ok) {
      setFormError(result.formError ?? null);

      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, messages]) => {
          if (messages?.[0]) {
            setError(field as keyof MenuFormInput, {
              type: "server",
              message: messages[0],
            });
          }
        });
      }

      return;
    }

    router.push("/admin/menus");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {formError ? (
        <p className="text-destructive text-sm" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do menu</Label>
          <Input id="name" placeholder="Ex.: Dashboard" {...register("name")} />
          <p className="text-muted-foreground text-xs">Nome exibido na tabela e na navegação lateral.</p>
          {errors.name?.message ? <p className="text-destructive text-xs">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon">Ícone</Label>
          <Controller
            control={control}
            name="icon"
            render={({ field }) => (
              <div className="space-y-2">
                <IconPreview value={field.value} />
                <IconSelect value={field.value} onValueChange={field.onChange} />
              </div>
            )}
          />
          <p className="text-muted-foreground text-xs">Selecione um ícone visual para o item de menu.</p>
          {errors.icon?.message ? <p className="text-destructive text-xs">{errors.icon.message}</p> : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="path">Caminho</Label>
          <Input id="path" placeholder="Ex.: /dashboard" disabled={isFolder} {...register("path")} />
          <p className="text-muted-foreground text-xs">Obrigatório para menus clicáveis. Pastas não navegam.</p>
          {errors.path?.message ? <p className="text-destructive text-xs">{errors.path.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Ordem</Label>
          <Input id="order" type="number" placeholder="0" {...register("order", { valueAsNumber: true })} />
          {errors.order?.message ? <p className="text-destructive text-xs">{errors.order.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label>Pasta pai</Label>
          <Controller
            control={control}
            name="folderId"
            render={({ field }) => <FolderSelect folders={folders} value={field.value} onValueChange={(value) => field.onChange(value)} />}
          />
          {errors.folderId?.message ? <p className="text-destructive text-xs">{errors.folderId.message}</p> : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Árvore de pastas</Label>
          <Controller
            control={control}
            name="folderId"
            render={({ field }) => <FolderTree folders={folders} selectedId={field.value} onSelect={(id) => field.onChange(id)} />}
          />
        </div>

        <div className="flex items-center gap-2 rounded-md border p-3">
          <Controller
            control={control}
            name="isFolder"
            render={({ field }) => (
              <>
                <Checkbox checked={Boolean(field.value)} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                <div>
                  <Label>Cadastrar como pasta</Label>
                  <p className="text-muted-foreground text-xs">Pastas agrupam itens e não possuem navegação direta.</p>
                </div>
              </>
            )}
          />
        </div>

        <div className="flex items-center gap-2 rounded-md border p-3">
          <Controller
            control={control}
            name="active"
            render={({ field }) => (
              <>
                <Checkbox checked={Boolean(field.value)} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                <div>
                  <Label>Ativo</Label>
                  <p className="text-muted-foreground text-xs">Itens ativos ficam disponíveis na navegação.</p>
                </div>
              </>
            )}
          />
        </div>

        <div className="md:col-span-2 flex items-center gap-2 rounded-md border p-3">
          <Controller
            control={control}
            name="visible"
            render={({ field }) => (
              <>
                <Checkbox checked={Boolean(field.value)} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                <div>
                  <Label>Visível na sidebar</Label>
                  <p className="text-muted-foreground text-xs">Quando desmarcado, o item não aparece na navegação lateral.</p>
                </div>
              </>
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (mode === "create" ? "Criando..." : "Salvando...") : mode === "create" ? "Criar menu" : "Salvar alterações"}
        </Button>
        <Button variant="outline" asChild disabled={isSubmitting}>
          <Link href="/admin/menus">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}

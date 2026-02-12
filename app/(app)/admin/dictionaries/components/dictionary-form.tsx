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
import { Textarea } from "@/components/ui/textarea";

import { createDictionaryAction } from "../actions/create-dictionary";
import { updateDictionaryAction } from "../actions/update-dictionary";
import { dictionarySchema, type DictionaryFormInput } from "../schema/dictionary.schema";

type DictionaryRecord = {
  id: string;
  name: string;
  label: string;
  description: string | null;
  schema: "public";
  active: boolean;
};

function toDefaults(initial?: DictionaryRecord): DictionaryFormInput {
  if (!initial) {
    return {
      name: "",
      label: "",
      description: "",
      schema: "public",
      active: true,
    };
  }

  return {
    name: initial.name,
    label: initial.label,
    description: initial.description ?? "",
    schema: "public",
    active: initial.active,
  };
}

export function DictionaryForm({ mode, initial }: { mode: "create" | "edit"; initial?: DictionaryRecord }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DictionaryFormInput>({
    resolver: zodResolver(dictionarySchema),
    defaultValues: toDefaults(initial),
  });

  async function onSubmit(values: DictionaryFormInput) {
    setFormError(null);

    const result = mode === "create" ? await createDictionaryAction(values) : await updateDictionaryAction(initial!.id, values);

    if (!result.ok) {
      setFormError(result.formError ?? null);

      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof DictionaryFormInput, {
              type: "server",
              message: messages[0],
            });
          }
        }
      }

      return;
    }

    if (mode === "create") {
      const createdId = "id" in result ? result.id : undefined;
      router.push(createdId ? `/admin/dictionaries/${createdId}` : "/admin/dictionaries");
    } else {
      router.push(`/admin/dictionaries/${initial!.id}`);
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {formError ? <p className="text-destructive text-sm">{formError}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome técnico *</Label>
          <Input id="name" placeholder="Ex.: nome_da_tabela" {...register("name")} />
          <p className="text-muted-foreground text-xs">Use apenas minúsculas, números e underscore.</p>
          {errors.name?.message ? <p className="text-destructive text-xs">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="label">Label *</Label>
          <Input id="label" placeholder="Ex.: Clientes" {...register("label")} />
          <p className="text-muted-foreground text-xs">Este valor aparece no título da tabela e nas páginas de CRUD.</p>
          {errors.label?.message ? <p className="text-destructive text-xs">{errors.label.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="schema">Schema</Label>
          <Input id="schema" value="public" disabled title="Schema padrão da aplicação" readOnly />
          <p className="text-muted-foreground text-xs">Schema padrão da aplicação.</p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" placeholder="Descrição funcional do dicionário" {...register("description")} />
          {errors.description?.message ? <p className="text-destructive text-xs">{errors.description.message}</p> : null}
        </div>

        <div className="flex items-center gap-2 rounded-md border p-3 md:col-span-2">
          <Controller
            control={control}
            name="active"
            render={({ field }) => (
              <>
                <Checkbox checked={Boolean(field.value)} onCheckedChange={(value) => field.onChange(Boolean(value))} />
                <div>
                  <Label>Ativo</Label>
                  <p className="text-muted-foreground text-xs">Dicionários inativos ficam bloqueados para execução.</p>
                </div>
              </>
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (mode === "create" ? "Criando..." : "Salvando...") : mode === "create" ? "Criar dicionário" : "Salvar alterações"}
        </Button>
        <Button variant="outline" asChild>
          <Link href={mode === "create" ? "/admin/dictionaries" : `/admin/dictionaries/${initial?.id}`}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}

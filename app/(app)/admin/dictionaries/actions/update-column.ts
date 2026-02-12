"use server";

import { revalidatePath } from "next/cache";
import type { DictionaryColumnType } from "@/lib/generated/prisma/client";

import { prisma } from "@/lib/prisma";

import { columnSchema, type ColumnFormInput } from "../schema/column.schema";

function mapUiTypeToDb(type: ColumnFormInput["type"]): DictionaryColumnType {
  switch (type) {
    case "string":
      return "STRING";
    case "number":
      return "INT";
    case "boolean":
      return "BOOLEAN";
    case "date":
      return "DATE";
    case "datetime":
      return "DATETIME";
    case "text":
      return "TEXT";
    case "decimal":
      return "DECIMAL";
    case "uuid":
      return "UUID";
    case "reference":
      return "FK";
    case "select":
      return "SELECT";
  }
}

export async function updateColumnAction(id: string, input: ColumnFormInput) {
  const parsed = columnSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.dictionaryColumn.update({
      where: { id },
      data: {
        name: parsed.data.name,
        label: parsed.data.label,
        type: mapUiTypeToDb(parsed.data.type),
        required: !parsed.data.nullable,
        defaultValue: parsed.data.default || null,
        order: parsed.data.order,
        length: parsed.data.type === "string" ? (parsed.data.length ?? 255) : null,
        precision: parsed.data.type === "number" || parsed.data.type === "decimal" ? (parsed.data.precision ?? null) : null,
        scale: parsed.data.type === "decimal" ? (parsed.data.scale ?? null) : null,
        autoGenerate: parsed.data.type === "uuid" ? parsed.data.autoGenerate : false,
        fkTableId: parsed.data.type === "reference" ? (parsed.data.fkTableId ?? null) : null,
        fkColumnName: parsed.data.type === "reference" ? (parsed.data.fkColumnName || "id") : null,
        displayField: parsed.data.type === "reference" ? (parsed.data.displayField || "id") : null,
        optionsJson: parsed.data.type === "select" ? JSON.stringify(parsed.data.options) : null,
      },
    });

    try {
      revalidatePath(`/admin/dictionaries/${parsed.data.dictionaryId}/columns`);
    } catch (revalidateError) {
      console.warn("updateColumnAction revalidate", revalidateError);
    }
    return { ok: true };
  } catch (error) {
    console.error("updateColumnAction", error);
    return { ok: false, formError: "Não foi possível atualizar o rascunho da coluna." };
  }
}

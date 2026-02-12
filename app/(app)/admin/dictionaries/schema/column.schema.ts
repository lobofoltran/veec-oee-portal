import { z } from "zod";

import { isValidSnakeCaseIdentifier } from "@/lib/security/identifiers";

export const columnUiTypeSchema = z.enum([
  "string",
  "number",
  "boolean",
  "date",
  "datetime",
  "text",
  "decimal",
  "uuid",
  "reference",
  "select",
]);

const selectOptionSchema = z.object({
  value: z.string().trim().min(1, "Valor da opção é obrigatório."),
  label: z.string().trim().min(1, "Label da opção é obrigatório."),
});

export const columnSchema = z
  .object({
    dictionaryId: z.string().uuid(),
    name: z
      .string()
      .trim()
      .min(1, "Nome é obrigatório.")
      .refine(
        isValidSnakeCaseIdentifier,
        "Nome da coluna inválido. Use apenas letras minúsculas, números e underscore (ex.: nome_do_campo).",
      ),
    label: z.string().trim().min(1, "Label é obrigatório."),
    type: columnUiTypeSchema,
    nullable: z.coerce.boolean().default(true),
    default: z.string().trim().optional(),
    length: z.coerce.number().int().positive("Tamanho deve ser maior que zero.").optional(),
    precision: z.coerce.number().int().positive("Precisão deve ser maior que zero.").optional(),
    scale: z.coerce.number().int().min(0, "Escala deve ser zero ou maior.").optional(),
    order: z.coerce.number().int().min(1, "Ordem deve ser no mínimo 1.").default(1),
    autoGenerate: z.coerce.boolean().default(false),
    fkTableId: z.string().uuid().optional(),
    fkColumnName: z.string().trim().optional(),
    displayField: z.string().trim().optional(),
    options: z.array(selectOptionSchema).default([]),
  })
  .superRefine((values, ctx) => {
    if (values.type === "string" && !values.length) {
      ctx.addIssue({ code: "custom", path: ["length"], message: "Informe o tamanho para campos de texto curto." });
    }

    if ((values.type === "number" || values.type === "decimal") && !values.precision) {
      ctx.addIssue({ code: "custom", path: ["precision"], message: "Informe a precisão para campos numéricos." });
    }

    if (values.type === "decimal" && values.scale == null) {
      ctx.addIssue({ code: "custom", path: ["scale"], message: "Informe a escala para campos decimais." });
    }

    if (values.type === "reference" && !values.fkTableId) {
      ctx.addIssue({ code: "custom", path: ["fkTableId"], message: "Selecione a tabela de referência." });
    }

    if (values.type === "select" && values.options.length === 0) {
      ctx.addIssue({ code: "custom", path: ["options"], message: "Adicione ao menos uma opção para o campo select." });
    }
  });

export type ColumnFormInput = z.input<typeof columnSchema>;
export type ColumnFormValues = z.infer<typeof columnSchema>;

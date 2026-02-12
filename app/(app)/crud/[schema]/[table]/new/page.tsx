import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createRow, getReferenceOptionsByColumn } from "@/lib/dictionary/crud";
import { getTableMeta } from "@/lib/dictionary/loader";

import { CrudBackButton } from "../../../_components/crud-back-button";
import { CrudForm } from "../../../_components/crud-form";
import { requireAdminSession } from "../../../../admin/_lib/auth";

type Props = {
  params: Promise<{ schema: string; table: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CrudNewPage({ params, searchParams }: Props) {
  await requireAdminSession();
  const { schema, table } = await params;
  const qp = (await searchParams) ?? {};
  const returnTo = typeof qp.returnTo === "string" ? qp.returnTo : `/crud/${schema}/${table}`;

  const meta = await getTableMeta(schema, table);

  if (!meta) {
    redirect("/admin/dictionaries");
  }
  const tableMeta = meta;
  const selectOptions = await getReferenceOptionsByColumn(tableMeta);

  async function submit(formData: FormData) {
    "use server";

    const input: Record<string, unknown> = {};
    for (const column of tableMeta.columns) {
      if (column.name === "id") continue;
      if (column.type === "BOOLEAN") {
        input[column.name] = formData.get(column.name) === "on";
      } else {
        const value = formData.get(column.name);
        input[column.name] = typeof value === "string" && value.length > 0 ? value : null;
      }
    }

    await createRow(schema, table, input);
    redirect(returnTo);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <CrudBackButton href={returnTo} />

      <Card>
        <CardHeader>
          <CardTitle>Novo em {tableMeta.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={submit}>
            <CrudForm table={tableMeta} selectOptions={selectOptions} submitLabel="Salvar" />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

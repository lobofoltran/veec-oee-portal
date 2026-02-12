import { listRows, resolveReferenceLabels } from "@/lib/dictionary/crud";
import { prisma } from "@/lib/prisma";

import { CrudNewActions } from "../../_components/crud-new-actions";
import { CrudTable } from "../../_components/crud-table";
import { CrudSearch } from "../../_components/crud-search";
import { requireAdminSession } from "../../../admin/_lib/auth";

type Props = {
  params: Promise<{ schema: string; table: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}

export default async function CrudListPage({ params, searchParams }: Props) {
  await requireAdminSession();
  const { schema, table } = await params;
  const qp = (await searchParams) ?? {};

  const q = (first(qp.q) ?? "").trim();
  const page = parsePositiveInt(first(qp.page), 1);
  const pageSize = Math.min(parsePositiveInt(first(qp.pageSize) ?? first(qp.limit), 10), 100);

  const result = await listRows(schema, table, {
    page,
    pageSize,
    search: q || undefined,
  });
  const totalPages = Math.max(Math.ceil(result.total / result.pageSize), 1);
  const paramsForReturn = new URLSearchParams();
  if (q) paramsForReturn.set("q", q);
  if (result.page > 1) paramsForReturn.set("page", String(result.page));
  if (result.pageSize !== 10) paramsForReturn.set("pageSize", String(result.pageSize));
  const returnTo = paramsForReturn.toString() ? `/crud/${schema}/${table}?${paramsForReturn.toString()}` : `/crud/${schema}/${table}`;

  const href = `/crud/${schema}/${table}`;
  const hasMenu = Boolean(await prisma.menu.findFirst({ where: { href } }));
  const displayMaps = await resolveReferenceLabels(result.table, result.rows);
  const menuPrefill = new URLSearchParams({
    name: result.table.label,
    path: href,
    icon: "FileText",
    order: "0",
    active: "true",
    visible: "true",
    isFolder: "false",
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{result.table.label}</h1>
          <p className="text-muted-foreground text-sm">Gerencie os registros deste formulário dinâmico.</p>
        </div>
        <CrudNewActions
          newHref={`/crud/${schema}/${table}/new?returnTo=${encodeURIComponent(returnTo)}`}
          menuHref={`/admin/menus/new?${menuPrefill.toString()}`}
          dictionaryHref={`/admin/dictionaries/${result.table.id}`}
          hasMenu={hasMenu}
        />
      </div>

      <CrudSearch initialSearch={q} pageSize={result.pageSize} />

      <CrudTable
        schema={schema}
        table={table}
        rows={result.rows}
        tableMeta={result.table}
        displayMaps={displayMaps}
        page={result.page}
        pageSize={result.pageSize}
        total={result.total}
        totalPages={totalPages}
        returnTo={returnTo}
      />
    </div>
  );
}

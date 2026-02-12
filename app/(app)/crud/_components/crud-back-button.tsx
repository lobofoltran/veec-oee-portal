import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CrudBackButton({ href }: { href: string }) {
  return (
    <Button variant="outline" size="sm" asChild className="w-fit">
      <Link href={href}>← Voltar</Link>
    </Button>
  );
}

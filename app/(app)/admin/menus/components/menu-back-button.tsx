"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function MenuBackButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-fit"
      aria-label="Voltar para lista de menus"
      onClick={() => router.push("/admin/menus")}
    >
      <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
      Voltar
    </Button>
  );
}

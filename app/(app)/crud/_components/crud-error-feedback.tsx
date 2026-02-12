"use client";

import { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function CrudErrorFeedback({
  message,
  title = "Erro na operação",
}: {
  message: string;
  title?: string;
}) {
  const toasted = useRef(false);

  useEffect(() => {
    if (toasted.current) return;
    toast.error(title, { description: message });
    toasted.current = true;
  }, [message, title]);

  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

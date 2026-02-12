"use client"

import {
  useState,
  useTransition,
  type MouseEvent,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { deleteFactoryAction } from "../_lib/actions"

type DeleteFactoryDialogProps = {
  factoryId: string
  factoryName: string
  redirectTo?: string
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DeleteFactoryDialog({
  factoryId,
  factoryName,
  redirectTo,
  trigger,
  open,
  onOpenChange,
}: DeleteFactoryDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [internalOpen, setInternalOpen] = useState(false)

  const resolvedOpen = open ?? internalOpen
  const setResolvedOpen = onOpenChange ?? setInternalOpen

  function handleConfirm(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await deleteFactoryAction(factoryId)

      if (!result.ok) {
        setError(result.formError)
        return
      }

      setResolvedOpen(false)

      if (redirectTo) {
        router.push(redirectTo)
      }

      router.refresh()
    })
  }

  return (
    <AlertDialog open={resolvedOpen} onOpenChange={setResolvedOpen}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir fábrica</AlertDialogTitle>
          <AlertDialogDescription>
            Isso removerá permanentemente <strong>{factoryName}</strong>. Esta
            ação não pode ser desfeita.
          </AlertDialogDescription>
          {error ? (
            <AlertDialogDescription className="text-destructive">
              {error}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

"use client"

import { useState, useTransition, type MouseEvent, type ReactNode } from "react"
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

import { deleteUserAction } from "../_lib/actions"

type DeleteUserDialogProps = {
  userId: string
  userName: string
  redirectTo?: string
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DeleteUserDialog({
  userId,
  userName,
  redirectTo,
  trigger,
  open,
  onOpenChange,
}: DeleteUserDialogProps) {
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
      const result = await deleteUserAction(userId)

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
          <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
          <AlertDialogDescription>
            Isso removerá permanentemente <strong>{userName}</strong>. Esta ação
            não pode ser desfeita.
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

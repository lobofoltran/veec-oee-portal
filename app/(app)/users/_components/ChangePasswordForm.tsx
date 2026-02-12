"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { changeUserPasswordAction } from "../_lib/actions"
import { changePasswordSchema } from "../_lib/schema"

type ChangePasswordFormValues = {
  password: string
  confirmPassword: string
}

type ChangePasswordFormProps = {
  userId: string
  cancelHref: string
}

export function ChangePasswordForm({
  userId,
  cancelHref,
}: ChangePasswordFormProps) {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: ChangePasswordFormValues) {
    setFormError(null)

    const result = await changeUserPasswordAction(userId, values)

    if (!result.ok) {
      setFormError(result.formError ?? null)

      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (!messages?.length) {
            continue
          }

          setError(field as keyof ChangePasswordFormValues, {
            type: "server",
            message: messages[0],
          })
        }
      }

      return
    }

    router.push(cancelHref)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {formError ? (
        <p className="text-destructive text-sm" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password?.message ? (
            <p className="text-destructive text-xs">{errors.password.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword?.message ? (
            <p className="text-destructive text-xs">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Change password"}
        </Button>
        <Button variant="outline" asChild disabled={isSubmitting}>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
    </form>
  )
}

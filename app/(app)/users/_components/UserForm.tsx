"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { createUserAction, updateUserAction } from "../_lib/actions"
import { createUserFormSchema, updateUserFormSchema } from "../_lib/schema"
import type {
  CreateUserFormInput,
  UpdateUserFormInput,
  UserDetails,
} from "../_lib/types"

type UserFormMode = "create" | "edit"

type UserFormProps = {
  mode: UserFormMode
  initialUser?: UserDetails
}

function CreateUserForm() {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormInput>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "OPERATOR",
      isActive: true,
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: CreateUserFormInput) {
    setFormError(null)
    const result = await createUserAction(values)

    if (!result.ok) {
      setFormError(result.formError ?? null)

      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (!messages?.length) {
            continue
          }

          setError(field as keyof CreateUserFormInput, {
            type: "server",
            message: messages[0],
          })
        }
      }

      return
    }

    router.push(`/users/${result.id}`)
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
          <Label htmlFor="name">Name *</Label>
          <Input id="name" {...register("name")} name="name" />
          {errors.name?.message ? (
            <p className="text-destructive text-xs">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register("email")} name="email" />
          {errors.email?.message ? (
            <p className="text-destructive text-xs">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Role *</Label>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="MANAGER">MANAGER</SelectItem>
                  <SelectItem value="OPERATOR">OPERATOR</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.role?.message ? (
            <p className="text-destructive text-xs">{errors.role.message}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2 pt-7">
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <>
                <Checkbox
                  id="isActive"
                  checked={Boolean(field.value)}
                  onCheckedChange={(value) => field.onChange(Boolean(value))}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active
                </Label>
              </>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input id="password" type="password" {...register("password")} />
          {errors.password?.message ? (
            <p className="text-destructive text-xs">{errors.password.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password *</Label>
          <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
          {errors.confirmPassword?.message ? (
            <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
        <Button variant="outline" asChild disabled={isSubmitting}>
          <Link href="/users">Cancel</Link>
        </Button>
      </div>
    </form>
  )
}

function EditUserForm({ initialUser }: { initialUser: UserDetails }) {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserFormInput>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: {
      name: initialUser.name,
      email: initialUser.email,
      role: initialUser.role,
      isActive: initialUser.isActive,
    },
  })

  async function onSubmit(values: UpdateUserFormInput) {
    setFormError(null)
    const result = await updateUserAction(initialUser.id, values)

    if (!result.ok) {
      setFormError(result.formError ?? null)

      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (!messages?.length) {
            continue
          }

          setError(field as keyof UpdateUserFormInput, {
            type: "server",
            message: messages[0],
          })
        }
      }

      return
    }

    router.push(`/users/${result.id}`)
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
          <Label htmlFor="name">Name *</Label>
          <Input id="name" {...register("name")} name="name" />
          {errors.name?.message ? (
            <p className="text-destructive text-xs">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register("email")} name="email" />
          {errors.email?.message ? (
            <p className="text-destructive text-xs">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label>Role *</Label>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="MANAGER">MANAGER</SelectItem>
                  <SelectItem value="OPERATOR">OPERATOR</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.role?.message ? (
            <p className="text-destructive text-xs">{errors.role.message}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-2 pt-7">
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <>
                <Checkbox
                  id="isActive"
                  checked={Boolean(field.value)}
                  onCheckedChange={(value) => field.onChange(Boolean(value))}
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active
                </Label>
              </>
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Save changes"}
        </Button>
        <Button variant="outline" asChild disabled={isSubmitting}>
          <Link href={`/users/${initialUser.id}`}>Cancel</Link>
        </Button>
      </div>
    </form>
  )
}

export function UserForm({ mode, initialUser }: UserFormProps) {
  if (mode === "create") {
    return <CreateUserForm />
  }

  if (!initialUser) {
    return null
  }

  return <EditUserForm initialUser={initialUser} />
}

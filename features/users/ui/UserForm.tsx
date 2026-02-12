"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
  createUserSchema,
  type CreateUserInput,
} from "@/features/users/domain/schema"

type UserFormProps = {
  mode: "create" | "edit"
  onSubmit?: (data: CreateUserInput) => void | Promise<void>
}

export function UserForm({ mode, onSubmit }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "ADMIN",
      status: "ACTIVE",
    },
  })

  async function handleValidSubmit(data: CreateUserInput) {
    await onSubmit?.(data)
  }

  return (
    <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          {...register("name")}
          name="name"
          className="border-input w-full rounded-md border px-3 py-2"
        />
        {errors.name?.message ? (
          <p role="alert" className="text-destructive text-sm">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register("email")}
          name="email"
          className="border-input w-full rounded-md border px-3 py-2"
        />
        {errors.email?.message ? (
          <p role="alert" className="text-destructive text-sm">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-primary text-primary-foreground rounded-md px-4 py-2"
      >
        {isSubmitting ? "Saving..." : mode === "create" ? "Save" : "Update"}
      </button>
    </form>
  )
}

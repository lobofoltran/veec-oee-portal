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

import { createFactoryAction, updateFactoryAction } from "../_lib/actions"
import { factoryFormSchema } from "../_lib/schema"
import type { Factory, FactoryFormInput } from "../_lib/types"

type FactoryFormProps = {
  mode: "create" | "edit"
  initialFactory?: Factory
}

const emptyFactoryValues: FactoryFormInput = {
  code: "",
  name: "",
  legalName: "",
  document: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zip: "",
  isActive: true,
}

function getDefaultValues(factory?: Factory): FactoryFormInput {
  if (!factory) {
    return emptyFactoryValues
  }

  return {
    code: factory.code,
    name: factory.name,
    legalName: factory.legalName ?? "",
    document: factory.document ?? "",
    email: factory.email ?? "",
    phone: factory.phone ?? "",
    addressLine1: factory.addressLine1 ?? "",
    addressLine2: factory.addressLine2 ?? "",
    city: factory.city ?? "",
    state: factory.state ?? "",
    zip: factory.zip ?? "",
    isActive: factory.isActive,
  }
}

export function FactoryForm({ mode, initialFactory }: FactoryFormProps) {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FactoryFormInput>({
    resolver: zodResolver(factoryFormSchema),
    defaultValues: getDefaultValues(initialFactory),
  })

  async function onSubmit(values: FactoryFormInput) {
    setFormError(null)

    const result =
      mode === "create"
        ? await createFactoryAction(values)
        : await updateFactoryAction(initialFactory!.id, values)

    if (!result.ok) {
      setFormError(result.formError ?? null)

      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (!messages?.length) {
            continue
          }

          setError(field as keyof FactoryFormInput, {
            type: "server",
            message: messages[0],
          })
        }
      }

      return
    }

    if (mode === "create") {
      router.push(`/factories/${result.id}`)
    } else {
      router.push(`/factories/${initialFactory!.id}`)
    }

    router.refresh()
  }

  const cancelHref =
    mode === "create" ? "/factories" : `/factories/${initialFactory?.id}`

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {formError ? (
        <p className="text-destructive text-sm" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="code">Code *</Label>
          <Input id="code" placeholder="FAC-001" {...register("code")} />
          {errors.code?.message ? (
            <p className="text-destructive text-xs">{errors.code.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" placeholder="Main Plant" {...register("name")} />
          {errors.name?.message ? (
            <p className="text-destructive text-xs">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="legalName">Legal Name</Label>
          <Input
            id="legalName"
            placeholder="Main Plant Industrial Ltd."
            {...register("legalName")}
          />
          {errors.legalName?.message ? (
            <p className="text-destructive text-xs">{errors.legalName.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="document">Document</Label>
          <Input id="document" placeholder="00.000.000/0001-00" {...register("document")} />
          {errors.document?.message ? (
            <p className="text-destructive text-xs">{errors.document.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" placeholder="+1 (555) 000-0000" {...register("phone")} />
          {errors.phone?.message ? (
            <p className="text-destructive text-xs">{errors.phone.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="factory@example.com" {...register("email")} />
          {errors.email?.message ? (
            <p className="text-destructive text-xs">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="addressLine1">Address Line 1</Label>
          <Input id="addressLine1" {...register("addressLine1")} />
          {errors.addressLine1?.message ? (
            <p className="text-destructive text-xs">{errors.addressLine1.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="addressLine2">Address Line 2</Label>
          <Input id="addressLine2" {...register("addressLine2")} />
          {errors.addressLine2?.message ? (
            <p className="text-destructive text-xs">{errors.addressLine2.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} />
          {errors.city?.message ? (
            <p className="text-destructive text-xs">{errors.city.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" placeholder="CA" {...register("state")} />
          {errors.state?.message ? (
            <p className="text-destructive text-xs">{errors.state.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip">ZIP</Label>
          <Input id="zip" {...register("zip")} />
          {errors.zip?.message ? (
            <p className="text-destructive text-xs">{errors.zip.message}</p>
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
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Factory"
              : "Save Changes"}
        </Button>
        <Button variant="outline" asChild disabled={isSubmitting}>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      </div>
    </form>
  )
}

import { Skeleton } from "@/components/ui/skeleton"

export default function FactoriesLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-[420px] w-full rounded-xl" />
    </div>
  )
}

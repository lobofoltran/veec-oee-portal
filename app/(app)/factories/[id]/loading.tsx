import { Skeleton } from "@/components/ui/skeleton"

export default function FactoryDetailsLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <Skeleton className="h-8 w-28" />
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-52" />
      </div>
      <Skeleton className="h-[420px] w-full rounded-xl" />
    </div>
  )
}

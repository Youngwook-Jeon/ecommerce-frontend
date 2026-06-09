import Container from "@/components/global/Container";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
  return (
    <Container className="py-10">
      <Skeleton className="mb-6 h-5 w-64" />
      <div className="grid gap-8 lg:grid-cols-[minmax(320px,480px)_1fr]">
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square rounded-md" />
            ))}
          </div>
        </div>
        <div className="space-y-5">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-20 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-28" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-16 rounded-md" />
              <Skeleton className="h-9 w-16 rounded-md" />
              <Skeleton className="h-9 w-16 rounded-md" />
            </div>
            <Skeleton className="h-5 w-24" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-14 rounded-md" />
              <Skeleton className="h-9 w-14 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-11 w-36 rounded-md" />
        </div>
      </div>
    </Container>
  );
}

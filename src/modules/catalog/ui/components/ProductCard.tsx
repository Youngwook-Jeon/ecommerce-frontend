import Link from "next/link";

import type { PublicProductSummaryVm } from "@/common/schemas/publicProduct";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
interface ProductCardProps {
  product: PublicProductSummaryVm;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square w-full bg-muted">
          {product.mainImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.mainImageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <CardHeader className="space-y-1 p-4 pb-2">
          {product.brand ? (
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {product.brand}
            </p>
          ) : null}
          <CardTitle className="line-clamp-2 text-base font-medium leading-snug">
            {product.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-lg font-semibold">
            ${product.basePrice.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </CardContent>
        <CardFooter className="sr-only">View {product.name}</CardFooter>
      </Link>
    </Card>
  );
}

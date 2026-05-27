import type { PublicProductSummaryVm } from "@/common/schemas/publicProduct";
import EmptyList from "@/components/global/EmptyList";

import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: PublicProductSummaryVm[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyList heading="No products found." />;
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

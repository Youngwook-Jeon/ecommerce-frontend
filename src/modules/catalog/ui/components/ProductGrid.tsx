import type { PublicProductSummaryVm } from "@/common/schemas/publicProduct";
import EmptyList from "@/components/global/EmptyList";

import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: PublicProductSummaryVm[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyList heading="이 카테고리에 표시할 상품이 없습니다." />;
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

"use client";

import { useRouter } from "next/navigation";

import type { PublicProductSort } from "@/common/schemas/publicProduct";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  categoryProductsPath,
  type PlpSearchParams,
} from "@/modules/catalog/lib/plpSearchParams";

const SORT_OPTIONS: { value: PublicProductSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Lowest price" },
  { value: "price_desc", label: "Highest price" },
  { value: "relevance", label: "Relevance" },
];

interface ProductSortSelectProps {
  categoryId: number;
  plpParams: PlpSearchParams;
}

export function ProductSortSelect({
  categoryId,
  plpParams,
}: ProductSortSelectProps) {
  const router = useRouter();

  const options =
    plpParams.q != null
      ? SORT_OPTIONS
      : SORT_OPTIONS.filter((option) => option.value !== "relevance");

  const onSortChange = (sort: PublicProductSort) => {
    router.push(
      categoryProductsPath(categoryId, {
        ...plpParams,
        sort,
        page: 0,
      })
    );
  };

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="product-sort" className="text-sm text-muted-foreground">
        Sort by
      </Label>
      <Select value={plpParams.sort} onValueChange={onSortChange}>
        <SelectTrigger id="product-sort" className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

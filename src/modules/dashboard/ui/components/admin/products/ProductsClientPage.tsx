"use client";

import { PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AdminProductDtoVm, AdminProductPageVm } from "@/services/productService";
import { columns } from "./columns";
import { ProductDataTable } from "./ProductDataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateProductForm } from "./CreateProductForm";
import { UpdateProductForm } from "./UpdateProductForm";
import { DeleteProductDialog } from "./DeleteProductDialog";
import { UpdateProductStatusDialog } from "./UpdateProductStatusDialog";
import { ProductOptionManagerDialog } from "./ProductOptionManagerDialog";

interface ProductsClientPageProps {
  initialPage: AdminProductPageVm;
}

export const ProductsClientPage = ({ initialPage }: ProductsClientPageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [search, setSearch] = useState<string>(searchParams.get("keyword") ?? "");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [isOptionManagerOpen, setIsOptionManagerOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AdminProductDtoVm | null>(null);

  const selectedProductId = selectedProduct?.id ?? null;

  const products: AdminProductDtoVm[] = initialPage.content;

  const tableColumns = useMemo(
    () =>
      columns({
        onEdit: (product) => {
          setSelectedProduct(product);
          setIsUpdateFormOpen(true);
        },
        onDelete: (product) => {
          setSelectedProduct(product);
          setIsDeleteDialogOpen(true);
        },
        onUpdateStatus: (product) => {
          setSelectedProduct(product);
          setIsUpdateStatusOpen(true);
        },
        onManageOptions: (product) => {
          setSelectedProduct(product);
          setIsOptionManagerOpen(true);
        },
      }),
    []
  );

  const buildQuery = (overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(overrides).forEach(([key, value]) => {
      if (value === undefined || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const href = buildQuery({
      page: 1,
      keyword: search.trim() || undefined,
    });
    router.push(href);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 0 || nextPage >= initialPage.totalPages) return;
    const href = buildQuery({
      page: nextPage + 1,
    });
    router.push(href);
  };

  const currentPage = initialPage.page;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="flex w-full max-w-md gap-2">
          <Input
            placeholder="Search products by name, brand, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        <div className="flex justify-end">
          <Button onClick={() => setIsCreateFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Product
          </Button>
        </div>
      </div>

      <ProductDataTable columns={tableColumns} data={products} />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Page <span className="font-medium">{currentPage + 1}</span> of{" "}
          <span className="font-medium">{initialPage.totalPages}</span> (
          {initialPage.totalElements} products)
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 0}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= initialPage.totalPages - 1}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <CreateProductForm
        isOpen={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
      />

      <UpdateProductForm
        isOpen={isUpdateFormOpen}
        onClose={() => {
          setIsUpdateFormOpen(false);
          setSelectedProduct(null);
        }}
        productId={selectedProductId}
      />

      <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />

      <UpdateProductStatusDialog
        isOpen={isUpdateStatusOpen}
        onClose={() => {
          setIsUpdateStatusOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />

      <ProductOptionManagerDialog
        isOpen={isOptionManagerOpen}
        onClose={() => {
          setIsOptionManagerOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </div>
  );
};


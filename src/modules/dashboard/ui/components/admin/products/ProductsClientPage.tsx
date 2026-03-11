"use client";

import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AdminProductDtoVm } from "@/services/productService";
import { columns } from "./columns";
import { ProductDataTable } from "./ProductDataTable";
import { Button } from "@/components/ui/button";

interface ProductsClientPageProps {
  initialData: AdminProductDtoVm[];
}

export const ProductsClientPage = ({ initialData }: ProductsClientPageProps) => {
  const [products] = useState<AdminProductDtoVm[]>(initialData);

  const tableColumns = useMemo(
    () =>
      columns({
        onEdit: (product) => {
          // TODO: Open edit drawer/modal
          console.log("Edit product clicked:", product);
        },
        onDelete: (product) => {
          // TODO: Open delete confirmation dialog
          console.log("Delete product clicked:", product);
        },
      }),
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/admin/products/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Product
          </Link>
        </Button>
      </div>

      <ProductDataTable columns={tableColumns} data={products} />
    </div>
  );
};


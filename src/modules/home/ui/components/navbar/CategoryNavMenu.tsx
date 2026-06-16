"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Menu, X } from "lucide-react";

import { STOREFRONT_NAV_CATEGORY_MAX_DEPTH } from "@/common/constants/storefrontCategory";
import type { CategoryDtoVm } from "@/common/schemas/category";
import { shouldShowNavSeeMoreLink } from "@/modules/catalog/lib/categoryTreeUtils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** Depth of grandchild links inside the right-hand subcategory panel. */
const NAV_GRANDCHILD_DEPTH = STOREFRONT_NAV_CATEGORY_MAX_DEPTH;

interface CategoryNavMenuProps {
  categories: CategoryDtoVm[];
}

function SeeMoreInCategoryLink({
  category,
  onNavigate,
}: {
  category: CategoryDtoVm;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={`/categories/${category.id}`}
      onClick={onNavigate}
      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
    >
      See more in {category.name}
      <ChevronRight className="h-3 w-3" aria-hidden />
    </Link>
  );
}

function SubcategoryPanel({
  category,
  onNavigate,
}: {
  category: CategoryDtoVm;
  onNavigate: () => void;
}) {
  if (category.children.length === 0) {
    return (
      <div className="flex h-full flex-col justify-center p-6">
        <p className="text-sm text-muted-foreground">
          Browse products in this category.
        </p>
        <Button asChild className="mt-4 w-fit">
          <Link href={`/categories/${category.id}`} onClick={onNavigate}>
            Shop {category.name}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <Link
          href={`/categories/${category.id}`}
          onClick={onNavigate}
          className="mb-6 inline-flex items-center gap-1 text-lg font-semibold hover:underline"
        >
          {category.name}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {category.children.map((child) => (
            <div key={child.id}>
              <Link
                href={`/categories/${child.id}`}
                onClick={onNavigate}
                className="font-medium hover:underline"
              >
                {child.name}
              </Link>
              {child.children.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {child.children.map((grandchild) => (
                    <li key={grandchild.id}>
                      <Link
                        href={`/categories/${grandchild.id}`}
                        onClick={onNavigate}
                        className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                      >
                        {grandchild.name}
                      </Link>
                      {shouldShowNavSeeMoreLink(
                        grandchild,
                        NAV_GRANDCHILD_DEPTH
                      ) ? (
                        <div className="mt-1">
                          <SeeMoreInCategoryLink
                            category={grandchild}
                            onNavigate={onNavigate}
                          />
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}

function MobileCategoryList({
  categories,
  onNavigate,
}: {
  categories: CategoryDtoVm[];
  onNavigate: () => void;
}) {
  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        <Accordion type="multiple" className="w-full">
          {categories.map((category) => (
            <AccordionItem key={category.id} value={String(category.id)}>
              <AccordionTrigger className="py-3 hover:no-underline">
                <Link
                  href={`/categories/${category.id}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onNavigate();
                  }}
                  className="text-left font-medium hover:underline"
                >
                  {category.name}
                </Link>
              </AccordionTrigger>
              {category.children.length > 0 ? (
                <AccordionContent>
                  <ul className="space-y-2 border-l pl-4">
                    {category.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={`/categories/${child.id}`}
                          onClick={onNavigate}
                          className="text-sm font-medium hover:underline"
                        >
                          {child.name}
                        </Link>
                        {child.children.length > 0 ? (
                          <ul className="mt-1 space-y-1 pl-3">
                            {child.children.map((grandchild) => (
                              <li key={grandchild.id}>
                                <Link
                                  href={`/categories/${grandchild.id}`}
                                  onClick={onNavigate}
                                  className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                                >
                                  {grandchild.name}
                                </Link>
                                {shouldShowNavSeeMoreLink(
                                  grandchild,
                                  NAV_GRANDCHILD_DEPTH
                                ) ? (
                                  <div className="mt-1">
                                    <SeeMoreInCategoryLink
                                      category={grandchild}
                                      onNavigate={onNavigate}
                                    />
                                  </div>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              ) : null}
            </AccordionItem>
          ))}
        </Accordion>

        <Link
          href="/categories"
          onClick={onNavigate}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          See all categories
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </ScrollArea>
  );
}

export function CategoryNavMenu({ categories }: CategoryNavMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeRootId, setActiveRootId] = useState<number | null>(
    categories[0]?.id ?? null
  );

  const activeRoot =
    categories.find((category) => category.id === activeRootId) ?? null;

  const close = () => setOpen(false);

  useEffect(() => {
    if (open && categories.length > 0 && activeRootId === null) {
      setActiveRootId(categories[0].id);
    }
  }, [open, categories, activeRootId]);

  if (categories.length === 0) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" className="shrink-0">
          <Menu aria-hidden />
          <span className="hidden sm:inline">All Categories</span>
          <span className="sm:hidden">Categories</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        aria-describedby={undefined}
        className="flex h-full w-full max-w-4xl flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl [&>button]:hidden"
      >
        <SheetHeader className="flex flex-row items-center justify-between space-y-0 border-b px-4 py-3">
          <SheetTitle className="text-base">Shop by Category</SheetTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={close}
            aria-label="Close"
          >
            <X aria-hidden />
          </Button>
        </SheetHeader>

        <div className="flex min-h-0 flex-1">
          <aside className="hidden w-64 shrink-0 border-r bg-muted/30 md:block">
            <ScrollArea className="h-full">
              <ul className="py-2">
                {categories.map((category) => {
                  const isActive = category.id === activeRootId;
                  const hasChildren = category.children.length > 0;

                  return (
                    <li key={category.id}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors",
                          isActive
                            ? "bg-background font-medium text-foreground"
                            : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                        )}
                        onMouseEnter={() => setActiveRootId(category.id)}
                        onFocus={() => setActiveRootId(category.id)}
                        onClick={() => {
                          if (!hasChildren) {
                            close();
                            router.push(`/categories/${category.id}`);
                          } else {
                            setActiveRootId(category.id);
                          }
                        }}
                      >
                        <span>{category.name}</span>
                        {hasChildren ? (
                          <ChevronRight
                            className="h-4 w-4 shrink-0"
                            aria-hidden
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="border-t px-4 py-3">
                <Link
                  href="/categories"
                  onClick={close}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  See all categories
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </ScrollArea>
          </aside>

          <div className="hidden min-w-0 flex-1 md:block">
            {activeRoot ? (
              <SubcategoryPanel category={activeRoot} onNavigate={close} />
            ) : null}
          </div>

          <div className="min-w-0 flex-1 md:hidden">
            <MobileCategoryList categories={categories} onNavigate={close} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

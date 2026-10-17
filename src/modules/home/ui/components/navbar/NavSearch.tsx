"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { normalizeSearchTerm } from "@/modules/catalog/lib/plpSearchParams";

export default function NavSearch() {
  const router = useRouter();
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = normalizeSearchTerm(String(new FormData(event.currentTarget).get("q") ?? ""));
    if (q) router.push(`/search?${new URLSearchParams({ q })}`);
  };
  return (
    <form action="/search" role="search" onSubmit={submit} className="flex w-full max-w-sm items-center gap-2">
      <Input type="search" name="q" aria-label="Search products" placeholder="Search products..." className="dark:bg-muted" />
      <Button type="submit" variant="outline" size="icon" aria-label="Search">
        <Search className="size-4" />
      </Button>
    </form>
  );
}

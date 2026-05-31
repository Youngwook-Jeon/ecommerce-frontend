"use client";

import type { PublicProductTermsFacetValueVm } from "@/common/schemas/publicProduct";
import { Button } from "@/components/ui/button";

export function termsFacetDisplayLabel(term: PublicProductTermsFacetValueVm): string {
  return term.label ?? term.value;
}

interface TermsFacetSectionProps {
  title: string;
  terms: PublicProductTermsFacetValueVm[];
  onToggle: (value: string, selected: boolean) => void;
  onClearSelected?: () => void;
  /** When set, controls clear-button visibility instead of `term.selected`. */
  hasActiveSelection?: boolean;
  emptyMessage?: string;
  clearButtonLabel?: string;
}

export function TermsFacetSection({
  title,
  terms,
  onToggle,
  onClearSelected,
  hasActiveSelection,
  emptyMessage = "No options (0)",
  clearButtonLabel = "Clear selection",
}: TermsFacetSectionProps) {
  const hasSelection =
    hasActiveSelection ?? terms.some((term) => term.selected);

  return (
    <section>
      <h3 className="mb-3 text-sm font-medium">
        {title}
        <span className="ml-1 text-xs text-muted-foreground">({terms.length})</span>
      </h3>
      <div className="mb-3 space-y-1">
        {terms.map((term) => (
          <button
            key={term.value}
            type="button"
            onClick={() => onToggle(term.value, term.selected)}
            className="flex w-full items-center justify-between rounded px-1.5 py-1 text-left text-sm hover:bg-muted"
          >
            <span className={term.selected ? "font-semibold" : "font-normal"}>
              {termsFacetDisplayLabel(term)}
            </span>
            <span className="text-xs text-muted-foreground">{term.count}</span>
          </button>
        ))}
        {terms.length === 0 ? (
          <p className="rounded px-1.5 py-1 text-xs text-muted-foreground">
            {emptyMessage}
          </p>
        ) : null}
      </div>
      {hasSelection && onClearSelected ? (
        <Button type="button" size="sm" variant="outline" onClick={onClearSelected}>
          {clearButtonLabel}
        </Button>
      ) : null}
    </section>
  );
}

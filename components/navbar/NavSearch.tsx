"use client";

import { Input } from "../ui/input";

export default function NavSearch() {
  return (
    <Input
      type="search"
      placeholder="search product..."
      className="max-w-xs dark:bg-muted"
      onChange={() => {}}
      value="iPhone"
    />
  );
}

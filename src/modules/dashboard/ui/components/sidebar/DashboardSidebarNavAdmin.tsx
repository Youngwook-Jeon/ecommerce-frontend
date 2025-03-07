"use client";

import Link from "next/link";
import { FolderPlusIcon, LayoutDashboardIcon, PackageIcon } from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard/admin",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Categories",
    url: "/dashboard/admin/categories",
    icon: FolderPlusIcon,
  },
  {
    title: "Products",
    url: "/dashboard/admin/products",
    icon: PackageIcon,
  },
];

export const DashboardSidebarNavAdmin = () => {
  const pathname = usePathname();

  return (
    <nav className="relative grow">
      <Command className="rounded-lg">
        <CommandInput placeholder="Search..." />
        <CommandList className="py-2">
          <CommandEmpty>No links found.</CommandEmpty>
          <CommandGroup>
            {items.map((item, index) => (
              <CommandItem
                key={index}
                className={cn("w-full h-12 cursor-pointer mt-1", {
                  "bg-accent text-accent-foreground": item.url === pathname,
                })}
              >
                <Link
                  href={item.url}
                  className="flex items-center gap-2 hover:bg-transparent rounded-lg transition-all w-full"
                >
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </nav>
  );
};

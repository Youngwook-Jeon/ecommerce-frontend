import { BadgeProps } from "@/components/ui/badge";

export function getOptionStatusBadgeVariant(status: string): BadgeProps["variant"] {
  switch (status) {
    case "ACTIVE":
      return "default";
    case "INACTIVE":
      return "secondary";
    case "DELETED":
      return "destructive";
    default:
      return "outline";
  }
}


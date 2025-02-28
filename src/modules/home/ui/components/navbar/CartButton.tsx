import Link from "next/link";
import { LuShoppingCart } from "react-icons/lu";

import { Button } from "@/components/ui/button";

export default async function CartButton() {
  return (
    <Button
      asChild
      variant="outline"
      size="icon"
      className="flex justify-center items-center relative"
    >
      <Link href="/cart">
        <LuShoppingCart />
        <span className="absolute -top-3 -right-3 bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
          8
        </span>
      </Link>
    </Button>
  );
}

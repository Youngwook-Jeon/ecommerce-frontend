"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { links } from "@/lib/links";
import { AuthUserInfoVm } from "@/common/types/auth";
import { useToast } from "@/hooks/use-toast";

export default function AuthInfoLinks({
  children,
  csrfToken,
  authUserInfo,
}: {
  children: React.ReactNode;
  csrfToken: string;
  authUserInfo: AuthUserInfoVm;
}) {
  const [isLogouting, setIsLogouting] = useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    setIsLogouting(true);
    try {
      const response = await fetch("/logout", {
        method: "POST",
        headers: {
          "X-XSRF-TOKEN": csrfToken,
        },
        credentials: "include",
      });
      if (response.status >= 400) {
        console.log(response);
        throw new Error("Logout failed");
      }

      const location = response.headers.get("Location");
      if (location) {
        toast({
          description: "You are successfully logged out.",
          duration: 2000,
        });

        // Delaying the toast
        await new Promise((resolve) => {
          const minDisplayTime = 1500;
          setTimeout(() => {
            resolve(true);
          }, minDisplayTime);
        });

        window.location.href = location;
      }
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was a problem to log out.",
      });
    }
    setIsLogouting(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="start" sideOffset={10}>
        {authUserInfo.isAuthenticated ? (
          <>
            {links.map((link) => {
              return (
                <DropdownMenuItem key={link.href}>
                  <Link href={link.href} className="capitalize w-full">
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              <button onClick={() => handleLogout()} disabled={isLogouting}>
                Logout
              </button>
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem>
            <Link href="/oauth2/authorization/edge-service-keycloak">Login</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

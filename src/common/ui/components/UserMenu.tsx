"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDownIcon, LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AuthUserInfoVm } from "@/common/schemas/auth";
import { links } from "@/common/constants/links";
import { ADMIN } from "@/common/constants";

interface UserMenuProps {
  authUserInfo: AuthUserInfoVm;
  isFromDashboard?: boolean;
  isSeller?: boolean;
}

export const UserMenu = ({
  authUserInfo,
  isFromDashboard,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isSeller,
}: UserMenuProps) => {
  const [isLogouting, setIsLogouting] = useState(false);
  const { toast } = useToast();

  const handleLogout = async () => {
    setIsLogouting(true);
    try {
      const response = await fetch("/logout", {
        method: "POST",
        headers: {
          // "X-XSRF-TOKEN": csrfToken,
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
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex gap-4 max-w-[100px]">
          <ChevronDownIcon className="w-6 h-6" />
        </Button>
      </DropdownMenuTrigger>
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
            {!isFromDashboard && authUserInfo.roles.includes(ADMIN) && (
              <DropdownMenuItem>
                <Link href="/dashboard/admin" className="capitalize w-full">
                  my dashboard
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => handleLogout()}
              disabled={isLogouting}
            >
              <LogOut />
              Logout
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem>
            <Link href="/oauth2/authorization/edge-service-keycloak">
              Login
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

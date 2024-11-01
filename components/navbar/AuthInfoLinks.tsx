/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { links } from "@/lib/links";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { AuthUserInfoVm } from "@/lib/types";

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
      // TODO: toast success message
      const location = response.headers.get("Location");
      if (location) window.location.href = location;
    } catch (error) {
      // TODO: toast error message
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
            <Link href="/oauth2/authorization/keycloak">Login</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { useEffect, useState } from "react";

import {
  bootstrapGatewaySession,
  getUnauthenticatedUser,
} from "@/common/lib/gatewaySession";
import type { AuthUserInfoVm } from "@/common/schemas/auth";
import type { CategoryDtoVm } from "@/common/schemas/category";
import { GuestCartMergeRunner } from "@/modules/cart/ui/components/GuestCartMergeRunner";
import HomeNavbar from "@/modules/home/ui/components/navbar/HomeNavbar";

interface HomeAuthShellProps {
  categories: CategoryDtoVm[];
  children: React.ReactNode;
}

export function HomeAuthShell({ categories, children }: HomeAuthShellProps) {
  const [authUserInfo, setAuthUserInfo] = useState<AuthUserInfoVm>(
    getUnauthenticatedUser()
  );

  useEffect(() => {
    void bootstrapGatewaySession()
      .then(setAuthUserInfo)
      .catch((error) => {
        console.error("Error fetching auth user info:", error);
      });
  }, []);

  return (
    <>
      {authUserInfo.isAuthenticated ? <GuestCartMergeRunner /> : null}
      <HomeNavbar authUserInfo={authUserInfo} categories={categories} />
      {children}
    </>
  );
}

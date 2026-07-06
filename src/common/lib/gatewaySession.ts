"use client";

import { AuthUserInfoSchema, type AuthUserInfoVm } from "@/common/schemas/auth";

const UNAUTHENTICATED_USER: AuthUserInfoVm = {
  isAuthenticated: false,
  username: null,
  firstName: null,
  lastName: null,
  roles: [],
};

let gatewayBootstrapPromise: Promise<AuthUserInfoVm> | null = null;

/**
 * Browser → gateway direct call.
 * Sets SESSION / XSRF cookies on localhost:9000 and returns auth state.
 */
export function bootstrapGatewaySession(): Promise<AuthUserInfoVm> {
  if (gatewayBootstrapPromise) {
    return gatewayBootstrapPromise;
  }

  gatewayBootstrapPromise = fetch("/authentication", {
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to bootstrap gateway session: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const parsed = AuthUserInfoSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error("Invalid auth response while bootstrapping gateway session");
      }

      return parsed.data;
    })
    .catch((error) => {
      gatewayBootstrapPromise = null;
      throw error;
    });

  return gatewayBootstrapPromise;
}

export function getUnauthenticatedUser(): AuthUserInfoVm {
  return UNAUTHENTICATED_USER;
}

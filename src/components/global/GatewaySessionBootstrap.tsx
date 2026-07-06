"use client";

import { useEffect } from "react";

import { bootstrapGatewaySession } from "@/common/lib/gatewaySession";

export function GatewaySessionBootstrap() {
  useEffect(() => {
    void bootstrapGatewaySession().catch((error) => {
      console.error("Failed to bootstrap gateway session:", error);
    });
  }, []);

  return null;
}

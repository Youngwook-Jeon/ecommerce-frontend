"use client";

import { Toaster } from "@/components/ui/toaster";
import ThemeProvider from "@/components/global/ThemeProvider";
import { GatewaySessionBootstrap } from "@/components/global/GatewaySessionBootstrap";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GatewaySessionBootstrap />
      <Toaster />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </>
  );
}

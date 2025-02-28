"use client";

import { Toaster } from "@/components/ui/toaster";
import ThemeProvider from "./ThemeProvider";

export default function HomeProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
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

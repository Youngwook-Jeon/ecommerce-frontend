import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";

import "./globals.css";

export const metadata: Metadata = {
  title: "ecomart",
  description: "Ecommerce store",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="w-full text-darkText">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

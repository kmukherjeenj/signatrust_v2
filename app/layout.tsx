import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./global.css";
import Providers from "./providers";

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SignaTrust - Secure Document Signing",
  description:
    "SignaTrust delivers secure, compliant digital signatures at a fraction of the cost of traditional solutions.",
  keywords:
    "document signing, electronic signatures, e-sign, secure signatures, digital documents",
  authors: [{ name: "SignaTrust Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/Providers";
import { Toaster } from "sonner";
import { siteMetadata } from "@/lib/metadata";
import { BRAND_NAME } from "@/config/brand";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = siteMetadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={3000}
            toastOptions={{
              style: {
                fontFamily: 'Inter, sans-serif',
              },
            }}
          />
        </SessionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter as FontSans, JetBrains_Mono as FontMono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import StickySocials from "@/components/sticky-socials"; // Import StickySocials

const geistSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});
const geistMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});


export const metadata: Metadata = {
  title: "Grace Hospital",
  description: "Comprehensive healthcare services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning={true}>
        <StickySocials />
        {children}
        <Toaster /> {/* Add Toaster component */}
      </body>
    </html>
  );
}

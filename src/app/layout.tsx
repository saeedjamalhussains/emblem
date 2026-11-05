import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SITE } from "@/config/site";
import "./globals.css";

// Free stand-in for the kit's Styrene A: a geometric sans used at regular weight.
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: SITE.name,
  description: SITE.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Header />
        <main className="mx-auto max-w-[1400px] px-4 pb-24 sm:px-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

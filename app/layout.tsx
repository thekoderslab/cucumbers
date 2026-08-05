import type { Metadata, Viewport } from "next";
import { Bungee, Fredoka } from "next/font/google";
import "./globals.css";

// Display face for the wordmark and headlines — blocky, signage-like,
// carries the "Hood" energy.
const bungee = Bungee({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

// Rounded, friendly body face (variable weight, so no `weight` needed).
const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cucumber Hood",
  description:
    "1,111 unique cucumbers coming to Robinhood Chain. Cool cucumbers. Chill cucumbers. Just cucumbers.",
};

export const viewport: Viewport = {
  themeColor: "#CCFF00",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bungee.variable} ${fredoka.variable}`}>
      <body>{children}</body>
    </html>
  );
}

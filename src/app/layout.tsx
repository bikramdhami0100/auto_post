import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notoDevanagari } from "@/lib/fonts";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoPost Nepal — Daily Social Media Content Automation",
  description:
    "Fully automated system that generates motivational, philosophical, and language-learning content and posts to Facebook and TikTok daily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <head>
        <meta name="tiktok-developers-site-verification" content="jZPvNIQ6DOgf1vc4qwSKTYIzOD2FdQzS" />
        <meta name="tiktok-developers-site-verification" content="XqVUeq6ouuh0RVFBPimubXNpZToAe1Xu" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

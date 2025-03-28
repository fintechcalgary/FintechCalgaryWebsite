"use client";

import { SessionProvider } from "next-auth/react";
import "./globals.css";

import Head from "next/head";
import { DM_Sans } from "next/font/google";

// Add multiple weights for Kanit if you need more flexibility
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
}); // Adjust weights as needed

export default function RootLayout({ children }) {
  return (
    <SessionProvider>
      <html lang="en">
        <Head>
          <title>FinTech Calgary</title>
          <meta name="description" content="Calgary's FinTech Community" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preconnect" href="https://res.cloudinary.com" />
          <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        </Head>
        <body className={`${dmSans.className} bg-background text-foreground`}>
          {children}
        </body>
      </html>
    </SessionProvider>
  );
}

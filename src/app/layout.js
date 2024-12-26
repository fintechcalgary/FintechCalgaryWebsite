"use client";

import { SessionProvider } from "next-auth/react";
import "./globals.css";

import Head from "next/head";
import { Work_Sans } from "next/font/google";

// Add multiple weights for Kanit if you need more flexibility
const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
}); // Adjust weights as needed

export default function RootLayout({ children }) {
  return (
    <SessionProvider>
      <html lang="en">
        <Head>
          <title>Your Page Title</title>
          <meta name="description" content="Your page description" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <body className={`${workSans.className} bg-background text-foreground`}>
          {children}
        </body>
      </html>
    </SessionProvider>
  );
}

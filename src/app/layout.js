import "./globals.css";
import { DM_Sans } from "next/font/google";
import GradientCircles from "@/components/GradientCircles";

// Add multiple weights for DM Sans
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  metadataBase: new URL("https://fintechcalgary.ca"),
  title: {
    default: "FinTech Calgary",
    template: "%s | FinTech Calgary",
  },
  description: "Calgary's Premier FinTech Community",
  keywords: ["fintech", "calgary", "technology", "finance", "community"],
  authors: [{ name: "FinTech Calgary" }],
  creator: "FinTech Calgary",
  publisher: "FinTech Calgary",
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: "https://fintechcalgary.ca",
    siteName: "FinTech Calgary",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FinTech Calgary",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@fintechcalgary",
    creator: "@fintechcalgary",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Create a client component wrapper for SessionProvider
import ClientSessionProvider from "@/components/ClientSessionProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} bg-background text-foreground`}>
        <GradientCircles />
        <ClientSessionProvider>{children}</ClientSessionProvider>
      </body>
    </html>
  );
}

import "./globals.css";
import { DM_Sans } from "next/font/google";
import ClientSessionProvider from "@/components/ClientSessionProvider";
import { SettingsProvider } from "@/contexts/SettingsContext";

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${dmSans.className} bg-background text-foreground min-h-screen bg-cover bg-top bg-no-repeat relative`}
        style={{
          backgroundImage: "url(/bg-image.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "top center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none min-h-full"></div>
        {/* Main content wrapper */}
        <div className="relative z-10 min-h-screen">
          <SettingsProvider>
            <ClientSessionProvider>{children}</ClientSessionProvider>
          </SettingsProvider>
        </div>
      </body>
    </html>
  );
}

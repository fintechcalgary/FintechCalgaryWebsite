import "./globals.css";
import {
  Plus_Jakarta_Sans,
  Space_Grotesk,
  Syne,
  JetBrains_Mono,
} from "next/font/google";
import ClientSessionProvider from "@/components/providers/ClientSessionProvider";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { Analytics } from "@vercel/analytics/next";

/* Slim geometric UI — body, nav, buttons */
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  display: "swap",
});

/* Modern tech display — section titles & headlines */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

/* Distinctive brand moments — hero & wordmarks */
const syne = Syne({
  subsets: ["latin"],
  variable: "--font-brand",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

/* Technical accents — labels, issue numbers, code-like UI */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
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
    <html
      lang="en"
      className={`${plusJakarta.variable} ${spaceGrotesk.variable} ${syne.variable} ${jetbrainsMono.variable}`}
    >
      <body
        className={`${plusJakarta.className} bg-background text-foreground min-h-screen bg-cover bg-top bg-no-repeat relative font-sans antialiased`}
        style={{
          backgroundImage: "url(/bg-image.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "top center",
        }}
      >
        <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none min-h-full"></div>
        {/* Main content wrapper */}
        <div className="relative z-10 min-h-screen">
          <SettingsProvider>
            <ClientSessionProvider>{children}</ClientSessionProvider>
          </SettingsProvider>
        </div>
        <Analytics />
      </body>
    </html>
  );
}

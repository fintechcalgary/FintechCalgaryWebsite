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

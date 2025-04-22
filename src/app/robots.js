export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/login/", "/info/"],
    },
    sitemap: "https://fintechcalgary.ca/sitemap.xml",
  };
}

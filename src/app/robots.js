export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/login/", "/info/", "/converge-test"],
    },
    sitemap: "https://fintechcalgary.ca/sitemap.xml",
  };
}

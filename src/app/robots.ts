import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: ["/api/", "/activities", "/activities/", "/activities/*"],
        allow: [
          "/_next/static/",
          "/images/",
          "/favicon.ico",
          "/sitemap.xml",
          "/robots.txt",
          "/",
        ],
      },
      {
        userAgent: "Googlebot",
        disallow: ["/api/", "/activities", "/activities/", "/activities/*"],
        allow: [
          "/_next/static/",
          "/images/",
          "/favicon.ico",
          "/sitemap.xml",
          "/robots.txt",
        ],
      },
      {
        userAgent: ["Applebot", "Bingbot"],
        disallow: ["/api/", "/activities", "/activities/", "/activities/*"],
        allow: [
          "/_next/static/",
          "/images/",
          "/favicon.ico",
          "/sitemap.xml",
          "/robots.txt",
        ],
      },
    ],
    sitemap: "https://fitnessoverlays.com/sitemap.xml",
    host: "https://fitnessoverlays.com",
  };
}

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
          "/activities/demo",
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
          "/activities/demo",
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
          "/activities/demo",
        ],
      },
    ],
    sitemap: "https://fitnessoverlays.com/sitemap.xml",
    host: "https://fitnessoverlays.com",
  };
}

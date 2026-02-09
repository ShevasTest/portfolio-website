import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants";
import { ALL_INDEXABLE_ROUTES } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return ALL_INDEXABLE_ROUTES.map((path) => {
    const isHome = path === "/";

    return {
      url: new URL(path, SITE.url).toString(),
      lastModified: now,
      changeFrequency: isHome ? "weekly" : "monthly",
      priority: isHome ? 1 : 0.8,
    };
  });
}

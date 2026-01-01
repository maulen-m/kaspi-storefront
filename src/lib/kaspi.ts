import { siteConfig } from "./site";
import { getProductBySlug } from "./products";

export const resolveKaspiUrl = (slug: string) => {
  if (!slug || slug === "store") {
    return siteConfig.kaspiStoreUrl;
  }

  const product = getProductBySlug(slug);
  return product?.kaspi_url ?? siteConfig.kaspiStoreUrl;
};

import products from "../data/products.json";

export type Product = {
  id: string;
  slug: string;
  title_ru: string;
  category: string;
  price_kzt?: number;
  images: string[];
  bullets_ru: string[];
  sizes: string[];
  kaspi_url: string;
};

export const allProducts = products as Product[];

export const categories = ["Все", "Топы", "Низ", "Комплекты", "Аксессуары"] as const;

export const getProductBySlug = (slug: string) =>
  allProducts.find((product) => product.slug === slug) ?? null;

export const getFeaturedProducts = (limit = 4) => allProducts.slice(0, limit);

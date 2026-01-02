import { defineCollection, z } from "astro:content";

const landers = defineCollection({
  type: "data",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    kicker: z.string().optional(),
    headline: z.string(),
    subhead: z.string().optional(),
    primary_cta: z.object({
      label: z.string(),
      kaspi_slug: z.string(),
    }),
    secondary_cta: z
      .object({
        label: z.string(),
        href: z.string(),
      })
      .optional(),
    highlights: z
      .array(
        z.object({
          title: z.string(),
          text: z.string(),
        })
      )
      .optional(),
    featured_products: z.array(z.string()).optional(),
    utm: z
      .object({
        utm_source: z.string().optional(),
        utm_medium: z.string().optional(),
        utm_campaign: z.string().optional(),
        utm_content: z.string().optional(),
        utm_term: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = { landers };

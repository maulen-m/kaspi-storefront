import { defineCollection, z } from "astro:content";

const landerSchema = z
  .object({
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
    hero_product_slug: z.string(),
    hero_image: z
      .string()
      .refine((value) => value.startsWith("/assets/img/"), "hero_image must be under /assets/img/"),
    scarcity_text: z.string(),
    countdown_mode: z.enum(["fixed", "evergreen"]),
    countdown_end_iso: z.string().optional(),
    countdown_hours: z.number().positive().optional(),
    inventory_left: z.number().int().positive().optional(),
    utm: z
      .object({
        utm_source: z.string().optional(),
        utm_medium: z.string().optional(),
        utm_campaign: z.string().optional(),
        utm_content: z.string().optional(),
        utm_term: z.string().optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.countdown_mode === "fixed" && !data.countdown_end_iso) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "countdown_end_iso is required when countdown_mode is fixed",
        path: ["countdown_end_iso"],
      });
    }
    if (data.countdown_mode === "evergreen" && data.countdown_hours == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "countdown_hours is required when countdown_mode is evergreen",
        path: ["countdown_hours"],
      });
    }
  });

const landers = defineCollection({
  type: "data",
  schema: landerSchema,
});

export const collections = { landers };

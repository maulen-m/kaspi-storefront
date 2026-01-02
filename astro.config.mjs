import { defineConfig, passthroughImageService } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "hybrid",
  adapter: cloudflare({ mode: "directory" }),
  image: {
    service: passthroughImageService(),
  },
});

import { defineConfig, passthroughImageService } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

const devHost = process.env.ASTRO_DEV_HOST ?? "127.0.0.1";
const devPortRaw = process.env.ASTRO_DEV_PORT ?? process.env.PORT;
const devPort = devPortRaw ? Number(devPortRaw) : undefined;

export default defineConfig({
  output: "hybrid",
  adapter: cloudflare({ mode: "directory", imageService: "passthrough" }),
  server: {
    host: devHost,
    port: Number.isFinite(devPort) ? devPort : undefined,
  },
  image: {
    service: passthroughImageService(),
  },
});

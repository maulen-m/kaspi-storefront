import type { APIRoute } from "astro";
import crypto from "node:crypto";
import { buildAttributionSnapshot, logClickOut } from "../../../lib/attribution";
import { resolveKaspiUrl } from "../../../lib/kaspi";

const createClickId = () => {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return crypto.randomBytes(16).toString("hex");
};

export const GET: APIRoute = async ({ params, request }) => {
  const slug = params.slug ?? "";
  const targetUrl = resolveKaspiUrl(slug);

  const attribution = buildAttributionSnapshot(request);
  const ofCid = attribution.of_cid ?? createClickId();

  const payload = {
    type: "kaspi_click",
    slug,
    target_url: targetUrl,
    of_cid: ofCid,
    ts: new Date().toISOString(),
    ...attribution,
  };

  await logClickOut(payload);

  return new Response(null, {
    status: 302,
    headers: {
      Location: targetUrl,
      "Cache-Control": "no-store",
    },
  });
};

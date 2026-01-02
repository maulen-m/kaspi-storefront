import type { APIRoute } from "astro";
import { buildAttributionSnapshot } from "../../../lib/attribution";
import { resolveKaspiUrl } from "../../../lib/kaspi";

export const prerender = false;

const createClickId = () => {
  const cryptoObj = globalThis.crypto as { randomUUID?: () => string } | undefined;
  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getDeviceClass = (userAgent: string) => {
  const ua = userAgent.toLowerCase();
  if (!ua) return "unknown";
  if (ua.includes("tablet") || ua.includes("ipad")) return "tablet";
  if (ua.includes("mobi") || ua.includes("android")) return "mobile";
  return "desktop";
};

export const GET: APIRoute = async ({ params, request, locals }) => {
  const slug = params.slug ?? "";
  const targetUrl = resolveKaspiUrl(slug);

  const attribution = buildAttributionSnapshot(request);
  const ofCid = attribution.of_cid ?? createClickId();
  const deviceClass = getDeviceClass(attribution.user_agent ?? "");

  const safe = { ...attribution };
  delete safe.user_agent;
  delete safe.ip;
  const blobs = [
    "kaspi_click",
    slug,
    safe.utm_campaign ?? "",
    safe.utm_source ?? "",
    safe.utm_medium ?? "",
    safe.utm_content ?? "",
    safe.utm_term ?? "",
    safe.fbclid ?? "",
    safe.ttclid ?? "",
    safe.gclid ?? "",
    safe.landing_url ?? "",
    safe.referrer ?? "",
    deviceClass,
  ];

  const env = (locals as { runtime?: { env?: Record<string, unknown> } })?.runtime?.env ?? {};
  const clicklog = env.CLICKLOG as { writeDataPoint?: (point: unknown) => void } | undefined;

  if (clicklog?.writeDataPoint) {
    try {
      clicklog.writeDataPoint({
        blobs,
        doubles: [1],
        indexes: [ofCid],
      });
    } catch {
      // avoid breaking redirect on logging failure
    }
  } else {
    console.info(
      "[kaspi]",
      JSON.stringify({
        type: "kaspi_click",
        slug,
        target_url: targetUrl,
        of_cid: ofCid,
        device_class: deviceClass,
        ...safe,
        ts: new Date().toISOString(),
      })
    );
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: targetUrl,
      "Cache-Control": "no-store",
    },
  });
};

const ATTR_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "fbclid",
  "ttclid",
  "gclid",
  "of_cid",
] as const;

export type AttributionSnapshot = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fbclid?: string;
  ttclid?: string;
  gclid?: string;
  of_cid?: string;
  landing_url?: string;
  referrer?: string;
  user_agent?: string;
  ip?: string;
};

const parseCookies = (cookieHeader: string | null) => {
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) return acc;
    acc[rawKey] = rest.join("=");
    return acc;
  }, {});
};

const readUtmCookie = (request: Request) => {
  const cookies = parseCookies(request.headers.get("cookie"));
  const raw = cookies.of_utm;
  const data: Record<string, string> = {};
  if (!raw) {
    if (cookies.of_cid) {
      data.of_cid = decodeURIComponent(cookies.of_cid);
    }
    return data;
  }
  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded) as Record<string, string>;
    if (cookies.of_cid && !parsed.of_cid) {
      parsed.of_cid = decodeURIComponent(cookies.of_cid);
    }
    return parsed;
  } catch {
    if (cookies.of_cid) {
      data.of_cid = decodeURIComponent(cookies.of_cid);
    }
    return data;
  }
};

export const buildAttributionSnapshot = (request: Request): AttributionSnapshot => {
  const url = new URL(request.url);
  const cookieData = readUtmCookie(request);
  const merged: AttributionSnapshot = { ...cookieData };

  ATTR_KEYS.forEach((key) => {
    const value = url.searchParams.get(key);
    if (value) merged[key] = value;
  });

  merged.landing_url = merged.landing_url ?? url.href;
  merged.referrer =
    merged.referrer ?? request.headers.get("referer") ?? request.headers.get("referrer") ?? "";
  merged.user_agent = request.headers.get("user-agent") ?? "";
  merged.ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "";

  return merged;
};

import dns from "node:dns";

// Patch localhost resolution in sandboxed test runs where DNS is unavailable.
const originalLookup = dns.lookup.bind(dns);
const originalPromisesLookup = dns.promises.lookup.bind(dns.promises);

const resolveLocalhost = (options?: dns.LookupOptions | number) => {
  const family =
    typeof options === "number"
      ? options
      : typeof options === "object" && options?.family
        ? options.family
        : 4;
  const address = family === 6 ? "::1" : "127.0.0.1";
  return { address, family };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(dns.lookup as any) = (hostname: string, options?: any, callback?: any) => {
  let opts = options;
  let cb = callback;

  if (typeof opts === "function") {
    cb = opts;
    opts = undefined;
  }

  if (hostname === "localhost") {
    const { address, family } = resolveLocalhost(opts);
    process.nextTick(cb, null, address, family);
    return;
  }

  return originalLookup(hostname, opts, cb);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(dns.promises.lookup as any) = async (hostname: string, options?: any) => {
  if (hostname === "localhost") {
    const { address, family } = resolveLocalhost(options);
    if (typeof options === "object" && options?.all) {
      return [{ address, family }];
    }
    return { address, family };
  }

  return originalPromisesLookup(hostname, options);
};

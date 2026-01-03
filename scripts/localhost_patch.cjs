const dns = require("node:dns");

const originalLookup = dns.lookup.bind(dns);
const originalPromisesLookup = dns.promises.lookup.bind(dns.promises);

const resolveLocalhost = (options) => {
  const family =
    typeof options === "number"
      ? options
      : options && typeof options === "object" && options.family
        ? options.family
        : 4;
  const address = family === 6 ? "::1" : "127.0.0.1";
  return { address, family };
};

dns.lookup = (hostname, options, callback) => {
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

dns.promises.lookup = async (hostname, options) => {
  if (hostname === "localhost") {
    const { address, family } = resolveLocalhost(options);
    if (options && typeof options === "object" && options.all) {
      return [{ address, family }];
    }
    return { address, family };
  }

  return originalPromisesLookup(hostname, options);
};

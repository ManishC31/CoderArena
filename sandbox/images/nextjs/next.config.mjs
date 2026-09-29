// Used when a playground has no Next.js config of its own (entrypoint.sh copies it in).
// Same settings as the template's next.config.ts; see there.
export default {
  basePath: process.env.PREVIEW_BASE_PATH,
  experimental: {
    reactDebugChannel: false,
  },
};

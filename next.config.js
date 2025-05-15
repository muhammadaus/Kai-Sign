/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  rewrites: async () => {
    return [
      {
        source: "/api/py/:path*",
        destination: "https://kai-sign-production.up.railway.app/api/py/:path*",
      },
      {
        source: "/api/py/generateERC7730",
        destination: "https://kai-sign-production.up.railway.app/api/py/generateERC7730",
      },
      {
        source: "/docs",
        destination: "https://kai-sign-production.up.railway.app/api/py/docs",
      },
      {
        source: "/openapi.json",
        destination: "https://kai-sign-production.up.railway.app/api/py/openapi.json",
      },
      {
        source: "/api/trpc/:path*",
        destination: "/api/trpc/:path*",
      },
    ];
  },
};

export default config;

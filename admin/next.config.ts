import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@nabs/sdk",
    "@packages/design-tokens",
    "@packages/shared-types",
    "@packages/constants",
  ],
};

export default nextConfig;

import type { NextConfig } from "next";

const basePath =
  process.env.GITHUB_PAGES === "true" ? "/battle_visualizer" : "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;

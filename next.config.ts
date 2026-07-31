import type { NextConfig } from "next";
import { BASE_PATH } from "./config/base-path";

const nextConfig: NextConfig = {
  // Mount under the branded subpath so an external reverse proxy can forward
  // /ai-adoption-workshop-kit/* without rewriting application URLs.
  basePath: BASE_PATH,
};

export default nextConfig;

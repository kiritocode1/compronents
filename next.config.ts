import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Multiple lockfiles exist above this project; pin the root so Turbopack
  // and process.cwd() resolve against this app (registry file reads depend
  // on it).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep these un-bundled so their runtime `typeof window` checks see the
  // real Node.js global object instead of a statically-inlined `undefined`.
  serverExternalPackages: ["jsdom", "@tiptap/core", "@tiptap/starter-kit"],
};

export default nextConfig;

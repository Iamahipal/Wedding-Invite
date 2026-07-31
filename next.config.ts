import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    // TypeScript 7 (the native Go compiler) no longer exposes the JS compiler
    // API that Next's built-in type check reaches for. This routes the check
    // through the `tsc` CLI instead. Remove it if you pin back to TypeScript 6.
    useTypeScriptCli: true,
  },

  // three.js ships untranspiled ESM examples; Next handles this natively but
  // being explicit keeps the drei/postprocessing chain happy across versions.
  transpilePackages: ['three'],

  // ─────────────────────────────────────────────────────────────────────────
  // Deploying to GitHub Pages / any static host instead of Vercel?
  // Uncomment the two lines below. You lose next/image optimisation and the
  // generated OG card (opengraph-image.tsx) becomes a build-time static PNG.
  // ─────────────────────────────────────────────────────────────────────────
  // output: 'export',
  // images: { unoptimized: true },
}

export default nextConfig

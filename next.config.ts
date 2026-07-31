import type { NextConfig } from 'next'

/**
 * Two deployment shapes, selected by environment variables so that
 * `npm run dev` is never affected:
 *
 *   Default (dev, Vercel, custom domain)
 *     Server build at the domain root. next/image optimisation on.
 *
 *   GitHub Pages  —  NEXT_OUTPUT=export  NEXT_PUBLIC_BASE_PATH=/Wedding-Invite
 *     Fully static export served from a sub-path. Pages has no image
 *     optimiser, so images must be unoptimised.
 *
 * Both are set by .github/workflows/deploy.yml; locally neither is, so you
 * always develop against `/`.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const isStaticExport = process.env.NEXT_OUTPUT === 'export'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // three.js ships untranspiled ESM examples; Next handles this natively but
  // being explicit keeps the drei/postprocessing chain happy across versions.
  transpilePackages: ['three'],

  experimental: {
    // TypeScript 7 (the native Go compiler) no longer exposes the JS compiler
    // API that Next's built-in type check reaches for. This routes the check
    // through the `tsc` CLI instead. Remove it if you pin back to TypeScript 6.
    useTypeScriptCli: true,
  },

  ...(isStaticExport && {
    output: 'export',
    images: { unoptimized: true },
    // Pages resolves `/Wedding-Invite/` to `index.html` far more reliably
    // with directory-style URLs.
    trailingSlash: true,
  }),

  ...(basePath && { basePath, assetPrefix: basePath }),
}

export default nextConfig

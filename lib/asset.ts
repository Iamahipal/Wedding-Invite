/**
 * Resolve a path in /public against the deployment's base path.
 *
 * On GitHub Pages this site is served from a sub-path
 * (`/Wedding-Invite/`), not the domain root. Next rewrites URLs for
 * `next/link` automatically, but not for a plain string handed to anything
 * else:
 *
 *   • `useTexture()` in the 3D photo corridor
 *   • the <audio> src
 *   • `next/image` — yes, really. It applies the base path normally, but NOT
 *     under `images.unoptimized`, which a static host requires. That one is
 *     easy to assume works and doesn't; it was caught by serving the export
 *     at the sub-path and watching for 404s, not by reading the docs.
 *
 * Anything reaching the network outside Next's own routing must come through
 * `asset()`, or it will 404 in production while working perfectly on
 * localhost — the classic sub-path deployment bug.
 *
 * `NEXT_PUBLIC_BASE_PATH` is empty locally and during a root deployment
 * (Vercel, a custom domain), so this is a no-op everywhere else.
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

export function asset(path: string): string {
  if (!BASE_PATH) return path
  // Leave absolute URLs and data URIs alone.
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path
  return `${BASE_PATH}${path.startsWith('/') ? '' : '/'}${path}`
}

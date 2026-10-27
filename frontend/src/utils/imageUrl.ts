export const FALLBACK_PERFUME_IMAGE = '/images/hero-perfume.jpg';

/**
 * Normalizes an image path to work across:
 * 1. Localhost development (root path '/')
 * 2. GitHub Pages repository subpaths (e.g. '/VibePerfume/')
 * 3. Vercel deployment (root path '/')
 */
export function getAssetUrl(path?: string | null): string {
  if (!path) return FALLBACK_PERFUME_IMAGE;
  
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Detect GitHub Pages repo subpath in the browser
  if (typeof window !== 'undefined' && window.location) {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.length > 0 && segments[0].toLowerCase() === 'vibeperfume') {
      return `/${segments[0]}/${cleanPath}`;
    }
  }

  // Check if Vite base is configured with a specific subpath
  const base = import.meta.env?.BASE_URL;
  if (base && base !== './' && base !== '.') {
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    return `${cleanBase}${cleanPath}`;
  }

  return `/${cleanPath}`;
}

/**
 * Image fallback handler for broken or 404 image sources
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const target = e.currentTarget;
  if (target.src !== FALLBACK_PERFUME_IMAGE) {
    target.src = FALLBACK_PERFUME_IMAGE;
  }
}

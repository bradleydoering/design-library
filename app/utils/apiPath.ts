// Simple basePath detection based on hostname and environment
function getBasePath(): string {
  // Only use basePath on localhost or when explicitly set via environment variable
  if (typeof window !== 'undefined') {
    // Client-side: Only use basePath on localhost
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isLocalhost ? '/packages' : '';
  }
  
  // Server-side: Only use basePath if explicitly set
  return process.env.NEXT_PUBLIC_USE_BASE_PATH === 'true' ? '/packages' : '';
}

const BASE_PATH = getBasePath();

/**
 * Utility function to get the correct API path considering basePath configuration
 * Next.js basePath doesn't automatically apply to API routes in client-side fetch calls
 */
export function getApiPath(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If no basePath, return path as-is
  if (!BASE_PATH) {
    return `/${cleanPath}`;
  }
  
  return `${BASE_PATH}/${cleanPath}`;
}

/**
 * Utility function for internal route navigation paths
 * These are handled automatically by Next.js router but included for consistency
 */
export function getRoutePath(path: string): string {
  // Next.js router handles basePath automatically for internal navigation
  return path;
}

/**
 * Utility function to get the correct static asset path considering basePath configuration
 * Next.js basePath doesn't automatically apply to static assets in client-side code
 */
export function getAssetPath(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // If no basePath, return path as-is
  if (!BASE_PATH) {
    return `/${cleanPath}`;
  }
  
  return `${BASE_PATH}/${cleanPath}`;
}
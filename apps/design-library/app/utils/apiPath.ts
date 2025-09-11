// Return empty basePath for local development
function getBasePath(): string {
  return '';
}

/**
 * Utility function to get the correct API path considering basePath configuration
 * Next.js basePath doesn't automatically apply to API routes in client-side fetch calls
 */
export function getApiPath(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Get basePath at runtime
  const basePath = getBasePath();
  
  // If no basePath, return path as-is
  if (!basePath) {
    return `/${cleanPath}`;
  }
  
  return `${basePath}/${cleanPath}`;
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
  
  // Get basePath at runtime
  const basePath = getBasePath();
  
  // If no basePath, return path as-is
  if (!basePath) {
    return `/${cleanPath}`;
  }
  
  return `${basePath}/${cleanPath}`;
}
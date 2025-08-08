/**
 * CloudFlare Worker for CloudRenovation.ca Traffic Routing
 * 
 * Complete worker code that should be deployed to CloudFlare
 * 
 * Implementation Date: August 2025
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const search = url.search;

    // Route: API calls → Design Library webapp (MUST come first - more specific)
    if (pathname.startsWith('/api/')) {
      return fetch(`https://design-library-two.vercel.app${pathname}${search}`, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: 'follow'
      });
    }

    // Route: Package pages → Design Library webapp  
    if (pathname.startsWith('/packages')) {
      return fetch(`https://design-library-two.vercel.app${pathname}${search}`, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: 'follow'
      });
    }

    // Route: Everything else → Static website (default)
    // This should proxy to your static website deployment
    // Replace 'YOUR_STATIC_SITE_URL' with your actual static site URL
    return fetch(request);
  }
};

/**
 * Key Benefits:
 * 1. SEO-friendly: All content under single domain
 * 2. User Experience: Seamless navigation between static site and webapp
 * 3. Deployment Flexibility: Independent deployments for different parts
 * 4. Performance: Static site optimized separately from dynamic webapp
 * 
 * Architecture:
 * - Static Website: Main marketing/info pages at cloudrenovation.ca
 * - Design Library Webapp: Package customization at cloudrenovation.ca/packages
 * - API Endpoints: Backend services at cloudrenovation.ca/api/*
 * - Database: Supabase for universal bathroom configurations
 * - Admin Panel: Configuration management at /admin
 * 
 * Critical Routes (ORDER MATTERS - more specific first):
 * 1. /api/* → Design Library (for database calls, admin functions)
 * 2. /packages/* → Design Library (for package pages)
 * 3. /* → Static Website (for marketing pages)
 * 
 * Common Issues Fixed:
 * - 500 errors on API calls due to missing /api/ routing
 * - Product images not loading due to failed database calls
 * - Universal toggles failing due to API proxy issues
 */
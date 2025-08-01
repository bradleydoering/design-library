import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');
  
  if (!imageUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    // Try multiple approaches for R2 URLs
    let response: Response | undefined;
    
    if (imageUrl.includes('r2.cloudflarestorage.com')) {
      // Try different approaches for R2 URLs
      const attempts = [
        // Attempt 1: Try with public access headers
        () => fetch(imageUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NextJS-ImageProxy/1.0)',
            'Accept': 'image/*,*/*;q=0.8',
            'Cache-Control': 'no-cache',
          },
        }),
        
        // Attempt 2: Try with different URL format (add public parameter)
        () => fetch(imageUrl + '?public=true', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NextJS-ImageProxy/1.0)',
          },
        }),
        
        // Attempt 3: Try with minimal headers
        () => fetch(imageUrl, {
          method: 'GET',
        }),
      ];
      
      // Try each approach
      for (const attempt of attempts) {
        try {
          response = await attempt();
          if (response.ok) break;
        } catch (e) {
          console.log('R2 access attempt failed:', e instanceof Error ? e.message : String(e));
        }
      }
    } else {
      // Regular fetch for non-R2 URLs
      response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NextJS-ImageProxy/1.0)',
        },
      });
    }

    if (!response || !response.ok) {
      throw new Error(`HTTP ${response?.status || 'Unknown error'}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    
    // Extract package info from URL for better placeholder
    const urlMatch = imageUrl.match(/package-renders\/([^?]+)/);
    const imageId = urlMatch ? urlMatch[1] : 'unknown';
    
    // Return a rich placeholder SVG with package-specific styling
    const placeholderSvg = `
      <svg width="300" height="250" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0f172a;stop-opacity:0.1" />
            <stop offset="100%" style="stop-color:#334155;stop-opacity:0.2" />
          </linearGradient>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#bg)"/>
        
        <!-- Frame -->
        <rect x="15" y="15" width="270" height="220" fill="url(#accent)" stroke="#cbd5e1" stroke-width="2" rx="12"/>
        
        <!-- Bathroom illustration -->
        <g transform="translate(150, 100)">
          <!-- Bathtub -->
          <ellipse cx="-30" cy="15" rx="35" ry="12" fill="#64748b" opacity="0.3"/>
          <rect x="-40" y="5" width="80" height="20" rx="10" fill="#94a3b8" opacity="0.5"/>
          
          <!-- Vanity -->
          <rect x="10" y="-5" width="30" height="25" rx="4" fill="#64748b" opacity="0.3"/>
          <circle cx="25" cy="-15" r="8" fill="#94a3b8" opacity="0.4"/>
          
          <!-- Mirror -->
          <rect x="15" y="-35" width="20" height="15" rx="2" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1" opacity="0.6"/>
          
          <!-- Tiles pattern -->
          <g opacity="0.2">
            <line x1="-50" y1="-40" x2="50" y2="-40" stroke="#64748b" stroke-width="0.5"/>
            <line x1="-50" y1="-30" x2="50" y2="-30" stroke="#64748b" stroke-width="0.5"/>
            <line x1="-50" y1="-20" x2="50" y2="-20" stroke="#64748b" stroke-width="0.5"/>
          </g>
        </g>
        
        <!-- Package info -->
        <text x="150" y="180" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="#0f172a">
          Bathroom Package
        </text>
        <text x="150" y="200" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#64748b">
          Premium Design Collection
        </text>
        <text x="150" y="220" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="9" fill="#94a3b8">
          ID: ${imageId.substring(0, 8)}...
        </text>
      </svg>
    `;

    return new NextResponse(placeholderSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=60',
      },
    });
  }
}
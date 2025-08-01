import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ params: string[] }> }
) {
  const params = await context.params;
  const [width = '300', height = '250'] = params.params;
  const searchParams = request.nextUrl.searchParams;
  const text = searchParams.get('text') || 'Bathroom Package';
  
  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect x="10" y="10" width="${parseInt(width) - 20}" height="${parseInt(height) - 20}" fill="#e5e7eb" stroke="#d1d5db" stroke-width="2" rx="8"/>
      <text x="50%" y="45%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
        ${text}
      </text>
      <text x="50%" y="60%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af">
        Image Loading...
      </text>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=0',
    },
  });
}
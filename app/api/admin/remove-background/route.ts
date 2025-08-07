import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image_file') as File;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Get remove.bg API key from environment variables
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Remove.bg API key not configured' }, { status: 500 });
    }

    // Prepare form data for remove.bg API
    const removeBgFormData = new FormData();
    removeBgFormData.append('image_file', imageFile);
    removeBgFormData.append('size', 'auto');
    
    // Call remove.bg API
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: removeBgFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Remove.bg API error:', errorText);
      
      // Parse remove.bg error response
      let errorMessage = 'Background removal failed';
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.errors && errorJson.errors.length > 0) {
          errorMessage = errorJson.errors[0].title || errorMessage;
        }
      } catch {
        // Use default error message if parsing fails
      }
      
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const processedImageBuffer = await response.arrayBuffer();
    
    // Return the processed image
    return new NextResponse(processedImageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': processedImageBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Background removal error:', error);
    return NextResponse.json(
      { error: 'Internal server error during background removal' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const sku = formData.get('sku') as string;
    const imageNumber = formData.get('imageNumber') as string;

    if (!imageFile || !sku) {
      return NextResponse.json({ error: 'Image file and SKU are required' }, { status: 400 });
    }

    // Validate required environment variables
    const {
      CLOUDFLARE_R2_ACCOUNT_ID,
      CLOUDFLARE_R2_ACCESS_KEY_ID,
      CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      CLOUDFLARE_R2_BUCKET_NAME,
      CLOUDFLARE_R2_PUBLIC_URL
    } = process.env;

    if (!CLOUDFLARE_R2_ACCOUNT_ID || !CLOUDFLARE_R2_ACCESS_KEY_ID || 
        !CLOUDFLARE_R2_SECRET_ACCESS_KEY || !CLOUDFLARE_R2_BUCKET_NAME) {
      return NextResponse.json({ error: 'CloudFlare R2 configuration missing' }, { status: 500 });
    }

    // Initialize S3 client for CloudFlare R2
    const r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      },
    });

    // Convert file to buffer
    const imageBuffer = await imageFile.arrayBuffer();
    
    // Generate filename with proper extension and image numbering
    let fileName: string;
    const imageNum = imageNumber ? parseInt(imageNumber, 10) : null;
    
    if (imageNum) {
      fileName = `products/${sku.toLowerCase()}_${imageNum}.png`;
    } else {
      fileName = `products/${sku.toLowerCase()}.png`;
    }
    
    // Upload to R2
    const uploadCommand = new PutObjectCommand({
      Bucket: CLOUDFLARE_R2_BUCKET_NAME,
      Key: fileName,
      Body: new Uint8Array(imageBuffer),
      ContentType: 'image/png',
      CacheControl: 'public, max-age=31536000', // Cache for 1 year
      Metadata: {
        sku: sku,
        imageNumber: imageNumber || 'main',
        uploadedAt: new Date().toISOString(),
        processedBy: 'image-processor'
      }
    });

    await r2Client.send(uploadCommand);

    // Construct public URL using your custom domain structure
    const publicUrl = `https://products.cloudrenos.com/${fileName}`;

    return NextResponse.json({ 
      success: true,
      url: publicUrl,
      fileName: fileName,
      sku: sku
    });

  } catch (error) {
    console.error('R2 upload error:', error);
    
    let errorMessage = 'Failed to upload to CloudFlare R2';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
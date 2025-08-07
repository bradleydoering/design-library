import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { sku, imageUrl, imageNumber } = await request.json();

    if (!sku || !imageUrl) {
      return NextResponse.json({ error: 'SKU and image URL are required' }, { status: 400 });
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Search for the product in the products table
    const { data: productData, error: searchError } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku.trim())
      .limit(1);

    if (searchError) {
      console.error('Error searching products table:', searchError);
      return NextResponse.json({ 
        error: `Database error: ${searchError.message}` 
      }, { status: 500 });
    }

    if (!productData || productData.length === 0) {
      return NextResponse.json({ 
        error: `Product with SKU "${sku}" not found in products table` 
      }, { status: 404 });
    }

    const foundRecord = productData[0];

    // Determine the image column based on imageNumber
    let updateColumn = null;
    
    if (imageNumber) {
      // Map asterisk numbers to specific columns
      const columnMap: { [key: number]: string } = {
        1: 'image_01',
        2: 'image_02', 
        3: 'image_03',
        4: 'image_03' // Cap at image_03 if someone uses *4
      };
      updateColumn = columnMap[imageNumber];
    } else {
      // No specific image number - find next available slot starting with image_main
      if (!foundRecord.image_main) {
        updateColumn = 'image_main';
      } else if (!foundRecord.image_01) {
        updateColumn = 'image_01';
      } else if (!foundRecord.image_02) {
        updateColumn = 'image_02';
      } else if (!foundRecord.image_03) {
        updateColumn = 'image_03';
      } else {
        // All slots are filled, replace image_main
        updateColumn = 'image_main';
      }
    }

    // Update the record with the new image URL in the chosen slot
    const { data: updateData, error: updateError } = await supabase
      .from('products')
      .update({ 
        [updateColumn]: imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('sku', foundRecord.sku)
      .select();

    if (updateError) {
      console.error('Database update error:', updateError);
      return NextResponse.json({ 
        error: `Failed to update image URL: ${updateError.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      table: 'products',
      sku: foundRecord.sku,
      imageUrl: imageUrl,
      imageColumn: updateColumn,
      updatedRecord: updateData?.[0]
    });

  } catch (error) {
    console.error('Database update error:', error);
    
    let errorMessage = 'Failed to update database';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch packages from Supabase
    const { data: packages, error } = await supabase
      .from('packages')
      .select('id, name, description, category, image_main')
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch packages: ${error.message}`)
    }

    // Transform to match expected format
    const transformedPackages = packages?.map(pkg => ({
      ID: pkg.id,
      NAME: pkg.name,
      DESCRIPTION: pkg.description,
      CATEGORY: pkg.category,
      IMAGE_MAIN: pkg.image_main,
    })) || []

    return NextResponse.json({ packages: transformedPackages })
  } catch (error) {
    console.error('Failed to fetch packages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    )
  }
}

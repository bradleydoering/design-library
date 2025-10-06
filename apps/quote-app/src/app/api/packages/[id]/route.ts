import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { fetchPackageConfiguration } from '@/lib/package-fetcher'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const packageId = params.id

    if (!packageId) {
      return NextResponse.json(
        { error: 'Package ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch package metadata
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single()

    if (packageError || !packageData) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    // Fetch complete package configuration with all products
    const packageConfig = await fetchPackageConfiguration(packageId)

    // Extract image URLs from package data
    const images = [
      packageData.image_main,
      packageData.image_01,
      packageData.image_02,
      packageData.image_03,
    ].filter(Boolean) // Remove null/undefined images

    // Return complete package details
    return NextResponse.json({
      id: packageConfig.id,
      name: packageConfig.name,
      description: packageConfig.description,
      category: packageConfig.category,
      images: images,
      products: packageConfig.products,
    })

  } catch (error) {
    console.error('Package fetch error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch package details',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

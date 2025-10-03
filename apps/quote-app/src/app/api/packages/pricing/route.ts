import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { fetchPackageConfiguration } from '@/lib/package-fetcher'

interface PricingBreakdown {
  tiles: {
    floorTile?: { sku: string; sqft: number; pricePerSqft: number; total: number }
    wallTile?: { sku: string; sqft: number; pricePerSqft: number; total: number }
    showerFloorTile?: { sku: string; sqft: number; pricePerSqft: number; total: number }
    accentTile?: { sku: string; sqft: number; pricePerSqft: number; total: number }
  }
  fixtures: {
    [key: string]: { sku: string; price: number }
  }
}

// Calculate estimated pricing for custom design packages
function calculateCustomPackagePricing(
  packageConfig: any,
  dimensions: {
    floorSqft: number
    wetWallSqft?: number
    dryWallSqft?: number
    showerFloorSqft?: number
    accentTileSqft?: number
    bathroomType?: string
  }
) {
  // Determine pricing tier based on package category
  const isMidRange = packageConfig.name.includes('Mid-Range')
  const isHighEnd = packageConfig.name.includes('High-End')

  // Base fixture pricing
  const fixtureBase = isMidRange ? 8000 : 12000

  // Add $2,000 for tub and shower combo
  const isTubAndShower = dimensions.bathroomType === 'tub_and_shower'
  const tubShowerAdder = isTubAndShower ? 2000 : 0

  const subtotal = fixtureBase + tubShowerAdder

  return NextResponse.json({
    packageId: packageConfig.id,
    packageName: packageConfig.name,
    subtotal: Math.round(subtotal),
    total: Math.round(subtotal),
    isEstimate: true,
    breakdown: {
      fixtures: {
        estimated: fixtureBase,
        note: 'Estimated materials package cost',
      },
      ...(tubShowerAdder > 0 && {
        tubShowerCombo: {
          estimated: tubShowerAdder,
          note: 'Additional cost for tub and shower combination',
        },
      }),
    },
    calculatedAt: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      packageId,
      floorSqft,
      wetWallSqft,
      dryWallSqft,
      showerFloorSqft,
      accentTileSqft,
      bathroomType,
    } = body

    // Validate required inputs
    if (!packageId || !floorSqft) {
      return NextResponse.json(
        { error: 'Missing required fields: packageId, floorSqft' },
        { status: 400 }
      )
    }

    // Fetch package configuration with products
    const packageConfig = await fetchPackageConfiguration(packageId)

    // Check if this is a custom design package (no products)
    const hasProducts = Object.values(packageConfig.products).some(p => p !== undefined && p !== null)

    if (!hasProducts) {
      // This is a custom design package - return estimated pricing
      return calculateCustomPackagePricing(packageConfig, {
        floorSqft,
        wetWallSqft,
        dryWallSqft,
        showerFloorSqft,
        accentTileSqft,
        bathroomType,
      })
    }

    const supabase = await createClient()

    // Calculate pricing using actual square footages from quote
    let subtotal = 0
    const breakdown: PricingBreakdown = {
      tiles: {},
      fixtures: {}
    }

    // Floor tile pricing (use actual floor sqft from quote)
    if (packageConfig.products.floorTile) {
      const product = packageConfig.products.floorTile
      const sqft = parseFloat(floorSqft)
      const pricePerSqft = product.price_retail || 0
      const total = sqft * pricePerSqft

      subtotal += total
      breakdown.tiles.floorTile = {
        sku: product.sku,
        sqft,
        pricePerSqft,
        total
      }
    }

    // Wall tile pricing (use actual wet wall sqft from quote)
    if (packageConfig.products.wallTile) {
      const product = packageConfig.products.wallTile
      const wetSqft = wetWallSqft ? parseFloat(wetWallSqft) : 0
      const drySqft = dryWallSqft ? parseFloat(dryWallSqft) : 0
      const totalSqft = wetSqft + drySqft

      if (totalSqft > 0) {
        const pricePerSqft = product.price_retail || 0
        const total = totalSqft * pricePerSqft

        subtotal += total
        breakdown.tiles.wallTile = {
          sku: product.sku,
          sqft: totalSqft,
          pricePerSqft,
          total
        }
      }
    }

    // Shower floor tile - use actual input from quote flow
    // Defaults to 0 if not provided (bathtub or powder room)
    if (packageConfig.products.showerFloorTile) {
      const product = packageConfig.products.showerFloorTile
      const sqft = showerFloorSqft ? parseFloat(showerFloorSqft) : 0

      if (sqft > 0) {
        const pricePerSqft = product.price_retail || 0
        const total = sqft * pricePerSqft

        subtotal += total
        breakdown.tiles.showerFloorTile = {
          sku: product.sku,
          sqft,
          pricePerSqft,
          total
        }
      }
    }

    // Accent tile - use actual input from quote flow
    // Defaults to 0 if user chose not to add accent feature
    if (packageConfig.products.accentTile) {
      const product = packageConfig.products.accentTile
      const sqft = accentTileSqft ? parseFloat(accentTileSqft) : 0

      if (sqft > 0) {
        const pricePerSqft = product.price_retail || 0
        const total = sqft * pricePerSqft

        subtotal += total
        breakdown.tiles.accentTile = {
          sku: product.sku,
          sqft,
          pricePerSqft,
          total
        }
      }
    }

    // Fixed-price fixtures
    const fixtures = ['vanity', 'tub', 'toilet', 'shower', 'faucet', 'mirror', 'lighting'] as const

    for (const fixture of fixtures) {
      const product = packageConfig.products[fixture]
      if (product) {
        const price = product.price_retail || 0
        subtotal += price
        breakdown.fixtures[fixture] = {
          sku: product.sku,
          price
        }
      }
    }

    // Return pricing result
    return NextResponse.json({
      packageId,
      packageName: packageConfig.name,
      subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimals
      total: Math.round(subtotal * 100) / 100,
      breakdown,
      calculatedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Package pricing calculation error:', error)

    // Fail loud - return error details
    return NextResponse.json(
      {
        error: 'Failed to calculate package pricing',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: 'Please check that the package exists and all required materials are in the database',
      },
      { status: 500 }
    )
  }
}

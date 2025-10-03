import { createClient } from '@/utils/supabase/server'

export interface PackageConfiguration {
  id: string
  name: string
  description: string
  category: string
  products: {
    floorTile?: any
    wallTile?: any
    showerFloorTile?: any
    accentTile?: any
    vanity?: any
    tub?: any
    toilet?: any
    shower?: any
    faucet?: any
    mirror?: any
    lighting?: any
  }
}

/**
 * Fetches a package configuration with all associated products
 * Uses the package_products junction table
 */
export async function fetchPackageConfiguration(packageId: string): Promise<PackageConfiguration> {
  const supabase = await createClient()

  // Fetch package metadata
  const { data: packageData, error: packageError } = await supabase
    .from('packages')
    .select('*')
    .eq('id', packageId)
    .single()

  if (packageError) {
    throw new Error(`Failed to fetch package ${packageId}: ${packageError.message}`)
  }

  if (!packageData) {
    throw new Error(`Package ${packageId} not found`)
  }

  // Fetch all products associated with this package via junction table
  const { data: packageProducts, error: productsError } = await supabase
    .from('package_products')
    .select(`
      product_type,
      products (
        id,
        sku,
        name,
        category,
        price,
        price_sqf,
        cost,
        cost_sqf
      )
    `)
    .eq('package_id', packageId)

  if (productsError) {
    throw new Error(`Failed to fetch products for package ${packageId}: ${productsError.message}`)
  }

  // Map products by type
  const productsByType: any = {}

  if (packageProducts) {
    for (const item of packageProducts) {
      const productType = item.product_type
      const products = item.products

      // Handle both single product and array of products
      const product = Array.isArray(products) ? products[0] : products

      if (product) {
        // Map to our interface with price_retail using the 'price' column
        productsByType[productType] = {
          sku: product.sku,
          name: product.name,
          category: product.category,
          price_retail: product.price_sqf || product.price || 0,
          price_cost: product.cost_sqf || product.cost || 0,
        }
      }
    }
  }

  // Build package configuration
  const configuration: PackageConfiguration = {
    id: packageData.id,
    name: packageData.name,
    description: packageData.description || '',
    category: packageData.category || '',
    products: {
      floorTile: productsByType['floorTile'],
      wallTile: productsByType['wallTile'],
      showerFloorTile: productsByType['showerFloorTile'],
      accentTile: productsByType['accentTile'],
      vanity: productsByType['vanity'],
      tub: productsByType['tub'],
      toilet: productsByType['toilet'],
      shower: productsByType['shower'],
      faucet: productsByType['faucet'],
      mirror: productsByType['mirror'],
      lighting: productsByType['lighting'],
    },
  }

  return configuration
}

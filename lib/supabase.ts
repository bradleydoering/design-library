import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Product {
  id: string
  sku: string
  name: string
  brand: string
  category: string
  material?: string
  finish?: string
  color_ta?: string
  size?: string
  description?: string
  url?: string
  image_main?: string
  image_01?: string
  image_02?: string
  image_03?: string
  cost_sqf?: number
  price_sqf?: number
  cost?: number
  price?: number
  wall: boolean
  floor: boolean
  shower_floor: boolean
  accent: boolean
  created_at: string
  updated_at: string
}

export interface Package {
  id: string
  name: string
  category: 'modern' | 'contemporary' | 'traditional' | 'luxury'
  description?: string
  vision?: string
  image_main?: string
  image_01?: string
  image_02?: string
  image_03?: string
  wall_tile_multiplier: number
  created_at: string
  updated_at: string
}

export interface PackageUniversalToggles {
  id: string
  package_id: string
  bathroom_type: 'Bathtub' | 'Walk-in Shower' | 'Tub & Shower' | 'Sink & Toilet'
  wall_tile_coverage: 'None' | 'Half way up' | 'Floor to ceiling'
  bathroom_size: 'small' | 'normal' | 'large'
  floor_tile_included: boolean
  wall_tile_included: boolean
  shower_floor_tile_included: boolean
  accent_tile_included: boolean
  vanity_included: boolean
  tub_included: boolean
  tub_filler_included: boolean
  toilet_included: boolean
  shower_included: boolean
  faucet_included: boolean
  glazing_included: boolean
  mirror_included: boolean
  towel_bar_included: boolean
  toilet_paper_holder_included: boolean
  hook_included: boolean
  lighting_included: boolean
  created_at: string
}

export interface PackageProduct {
  id: string
  package_id: string
  product_id: string
  product_type: string
  created_at: string
}

export interface BrandLogo {
  id: string
  brand: string
  logo_url: string
  created_at: string
}

export interface Color {
  id: string
  code: string
  name: string
  hex_value: string
  created_at: string
}

// API Functions
export const MaterialsAPI = {
  /**
   * Get all products by category
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('name')

    if (error) {
      console.error(`Error fetching ${category}:`, error)
      return []
    }

    return data || []
  },

  /**
   * Get all products organized by category (matches current JSON structure)
   */
  async getAllProducts(): Promise<Record<string, Product[]>> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('category, name')

    if (error) {
      console.error('Error fetching products:', error)
      return {}
    }

    // Group by category
    const productsByCategory: Record<string, Product[]> = {}
    data?.forEach(product => {
      if (!productsByCategory[product.category]) {
        productsByCategory[product.category] = []
      }
      productsByCategory[product.category].push(product)
    })

    return productsByCategory
  },

  /**
   * Get product by SKU
   */
  async getProductBySku(sku: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .single()

    if (error) {
      console.error(`Error fetching product ${sku}:`, error)
      return null
    }

    return data
  },

  /**
   * Search products by name, brand, or SKU
   */
  async searchProducts(query: string, category?: string): Promise<Product[]> {
    let queryBuilder = supabase
      .from('products')
      .select('*')

    if (category) {
      queryBuilder = queryBuilder.eq('category', category)
    }

    const { data, error } = await queryBuilder
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%,sku.ilike.%${query}%`)
      .order('name')

    if (error) {
      console.error('Error searching products:', error)
      return []
    }

    return data || []
  }
}

export const PackagesAPI = {
  /**
   * Get all packages with their details and products
   */
  async getAllPackages(): Promise<any[]> {
    const { data, error } = await supabase
      .from('package_details')
      .select(`
        *,
        package_products (
          product_type,
          products (*)
        )
      `)
      .order('name')

    if (error) {
      console.error('Error fetching packages:', error)
      return []
    }

    // Transform to match current app structure
    return data?.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      category: pkg.category,
      description: pkg.description,
      vision: pkg.vision,
      image: pkg.image_main,
      additionalImages: [pkg.image_01, pkg.image_02, pkg.image_03].filter(Boolean),
      items: pkg.package_products?.reduce((acc: any, pp: any) => {
        const productType = pp.product_type
        if (pp.products) {
          acc[productType] = pp.products.sku
        }
        return acc
      }, {}),
      UNIVERSAL_TOGGLES: {
        bathroomType: pkg.bathroom_type,
        wallTileCoverage: pkg.wall_tile_coverage,
        bathroomSize: pkg.bathroom_size,
        includedItems: {
          floorTile: pkg.floor_tile_included,
          wallTile: pkg.wall_tile_included,
          showerFloorTile: pkg.shower_floor_tile_included,
          accentTile: pkg.accent_tile_included,
          vanity: pkg.vanity_included,
          tub: pkg.tub_included,
          tubFiller: pkg.tub_filler_included,
          toilet: pkg.toilet_included,
          shower: pkg.shower_included,
          faucet: pkg.faucet_included,
          glazing: pkg.glazing_included,
          mirror: pkg.mirror_included,
          towelBar: pkg.towel_bar_included,
          toiletPaperHolder: pkg.toilet_paper_holder_included,
          hook: pkg.hook_included,
          lighting: pkg.lighting_included
        }
      }
    })) || []
  },

  /**
   * Get package by ID
   */
  async getPackageById(id: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('package_details')
      .select(`
        *,
        package_products (
          product_type,
          products (*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error(`Error fetching package ${id}:`, error)
      return null
    }

    // Transform to match current app structure
    return {
      id: data.id,
      name: data.name,
      category: data.category,
      description: data.description,
      vision: data.vision,
      image: data.image_main,
      additionalImages: [data.image_01, data.image_02, data.image_03].filter(Boolean),
      items: data.package_products?.reduce((acc: any, pp: any) => {
        const productType = pp.product_type
        if (pp.products) {
          acc[productType] = pp.products.sku
        }
        return acc
      }, {}),
      UNIVERSAL_TOGGLES: {
        bathroomType: data.bathroom_type,
        wallTileCoverage: data.wall_tile_coverage,
        bathroomSize: data.bathroom_size,
        includedItems: {
          floorTile: data.floor_tile_included,
          wallTile: data.wall_tile_included,
          showerFloorTile: data.shower_floor_tile_included,
          accentTile: data.accent_tile_included,
          vanity: data.vanity_included,
          tub: data.tub_included,
          tubFiller: data.tub_filler_included,
          toilet: data.toilet_included,
          shower: data.shower_included,
          faucet: data.faucet_included,
          glazing: data.glazing_included,
          mirror: data.mirror_included,
          towelBar: data.towel_bar_included,
          toiletPaperHolder: data.toilet_paper_holder_included,
          hook: data.hook_included,
          lighting: data.lighting_included
        }
      }
    }
  },

  /**
   * Create new package
   */
  async createPackage(packageData: any): Promise<string | null> {
    const { data, error } = await supabase
      .from('packages')
      .insert({
        name: packageData.name,
        category: packageData.category.toLowerCase(),
        description: packageData.description,
        vision: packageData.vision,
        image_main: packageData.images?.main,
        image_01: packageData.images?.additional?.[0],
        image_02: packageData.images?.additional?.[1],
        image_03: packageData.images?.additional?.[2]
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating package:', error)
      return null
    }

    return data.id
  },

  /**
   * Update package
   */
  async updatePackage(id: string, packageData: any): Promise<boolean> {
    const { error } = await supabase
      .from('packages')
      .update({
        name: packageData.name,
        category: packageData.category.toLowerCase(),
        description: packageData.description,
        vision: packageData.vision,
        image_main: packageData.image_main,
        image_01: packageData.image_01,
        image_02: packageData.image_02,
        image_03: packageData.image_03
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating package:', error)
      return false
    }

    return true
  }
}

export const BrandLogosAPI = {
  async getAllLogos(): Promise<Record<string, string>> {
    const { data, error } = await supabase
      .from('brand_logos')
      .select('*')

    if (error) {
      console.error('Error fetching brand logos:', error)
      return {}
    }

    const logos: Record<string, string> = {}
    data?.forEach(logo => {
      logos[logo.brand] = logo.logo_url
    })

    return logos
  }
}

export const ColorsAPI = {
  async getAllColors(): Promise<Record<string, { name: string; hex: string }>> {
    const { data, error } = await supabase
      .from('colors')
      .select('*')

    if (error) {
      console.error('Error fetching colors:', error)
      return {}
    }

    const colors: Record<string, { name: string; hex: string }> = {}
    data?.forEach(color => {
      colors[`COLOR_${color.code}`] = {
        name: color.name,
        hex: color.hex_value
      }
    })

    return colors
  }
}
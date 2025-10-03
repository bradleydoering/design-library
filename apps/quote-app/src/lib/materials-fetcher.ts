import { createClient } from '@/utils/supabase/server'
import type { MaterialsDatabase } from '@cloudreno/design-pricing'

export interface Product {
  id: string
  sku: string
  name: string
  category: string
  price_cost: number
  price_retail: number
  unit_of_measure: string
  created_at: string
  updated_at: string
}

/**
 * Fetches all products from Supabase and groups them by category
 * for use with the design-pricing-sdk
 */
export async function fetchMaterialsDatabase(): Promise<MaterialsDatabase> {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('category', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch materials database: ${error.message}`)
  }

  if (!products || products.length === 0) {
    throw new Error('No products found in materials database')
  }

  // Group products by category
  const materialsDatabase: MaterialsDatabase = {}

  for (const product of products) {
    const category = product.category

    if (!materialsDatabase[category]) {
      materialsDatabase[category] = []
    }

    materialsDatabase[category].push({
      sku: product.sku,
      name: product.name,
      price_cost: product.price_cost,
      price_retail: product.price_retail,
      unit_of_measure: product.unit_of_measure,
    })
  }

  return materialsDatabase
}

/**
 * Fetches a single product by SKU
 */
export async function fetchProductBySku(sku: string): Promise<Product | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('sku', sku)
    .single()

  if (error) {
    console.error(`Failed to fetch product ${sku}:`, error)
    return null
  }

  return data
}

/**
 * Fetches multiple products by SKUs
 */
export async function fetchProductsBySkus(skus: string[]): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .in('sku', skus)

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`)
  }

  return data || []
}

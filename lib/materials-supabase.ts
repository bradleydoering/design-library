/**
 * Materials API using Supabase
 * This replaces the existing materials.ts file
 */

import { MaterialsAPI, PackagesAPI, BrandLogosAPI, ColorsAPI } from './supabase'

export async function getMaterials() {
  try {
    console.log('Loading materials from Supabase...')
    
    // Fetch all data in parallel
    const [
      products,
      packages,
      logos,
      colors
    ] = await Promise.all([
      MaterialsAPI.getAllProducts(),
      PackagesAPI.getAllPackages(),
      BrandLogosAPI.getAllLogos(),
      ColorsAPI.getAllColors()
    ])

    console.log('Supabase data loaded successfully:', {
      productCategories: Object.keys(products).length,
      packages: packages.length,
      logos: Object.keys(logos).length,
      colors: Object.keys(colors).length
    })

    // Return data in the same format as the original JSON structure
    const result = {
      packages,
      logos: Object.entries(logos).map(([brand, logo]) => ({
        BRAND: brand,
        LOGO: logo
      })),
      colors: Object.entries(colors).map(([code, color]) => ({
        CODE: code.replace('COLOR_', ''),
        NAME: color.name,
        HEX: color.hex
      })),
      ...products // Spread all product categories (tiles, vanities, etc.)
    }

    return result
  } catch (error) {
    console.error('Error loading materials from Supabase:', error)
    
    // Fallback to JSON file if Supabase fails
    console.log('Falling back to JSON file...')
    return await import('../data.json').then(data => data.default)
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: string) {
  try {
    return await MaterialsAPI.getProductsByCategory(category)
  } catch (error) {
    console.error(`Error fetching ${category} from Supabase:`, error)
    return []
  }
}

/**
 * Search products
 */
export async function searchProducts(query: string, category?: string) {
  try {
    return await MaterialsAPI.searchProducts(query, category)
  } catch (error) {
    console.error('Error searching products in Supabase:', error)
    return []
  }
}

/**
 * Get package by ID
 */
export async function getPackageById(id: string) {
  try {
    return await PackagesAPI.getPackageById(id)
  } catch (error) {
    console.error(`Error fetching package ${id} from Supabase:`, error)
    return null
  }
}

/**
 * Create new package
 */
export async function createPackage(packageData: any) {
  try {
    return await PackagesAPI.createPackage(packageData)
  } catch (error) {
    console.error('Error creating package in Supabase:', error)
    return null
  }
}

/**
 * Update existing package
 */
export async function updatePackage(id: string, packageData: any) {
  try {
    return await PackagesAPI.updatePackage(id, packageData)
  } catch (error) {
    console.error('Error updating package in Supabase:', error)
    return false
  }
}
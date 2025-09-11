import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface PriceFormula {
  basePrice: number;
  sizeMulitpliers: {
    small: number;
    medium: number;
    large: number;
  };
  laborCost: number;
  markupPercentage: number;
}

export async function POST(request: NextRequest) {
  try {
    const { packageName, priceFormula }: { packageName: string; priceFormula: PriceFormula } = await request.json();

    if (!packageName || !priceFormula) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Read the current data.json file
    const dataPath = path.join(process.cwd(), 'data.json');
    
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({ error: 'Data file not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(fileContent);

    // Find and update the package
    const packageIndex = data.packages.findIndex((pkg: any) => pkg.NAME === packageName);
    
    if (packageIndex === -1) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    // Update the package with the new price formula
    data.packages[packageIndex].PRICE_FORMULA = priceFormula;
    
    // Also update calculated prices for quick access
    data.packages[packageIndex].PRICE_SMALL = Math.round(calculatePrice(priceFormula, 'small'));
    data.packages[packageIndex].PRICE_MEDIUM = Math.round(calculatePrice(priceFormula, 'medium'));
    data.packages[packageIndex].PRICE_LARGE = Math.round(calculatePrice(priceFormula, 'large'));

    // Write back to file
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    return NextResponse.json({ 
      success: true, 
      message: 'Price formula updated successfully',
      updatedPackage: data.packages[packageIndex]
    });

  } catch (error) {
    console.error('Error updating price:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculatePrice(formula: PriceFormula, size: 'small' | 'medium' | 'large'): number {
  const { basePrice, sizeMulitpliers, laborCost, markupPercentage } = formula;
  const sizedPrice = basePrice * sizeMulitpliers[size];
  const totalBeforeMarkup = sizedPrice + laborCost;
  return totalBeforeMarkup * (1 + markupPercentage / 100);
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
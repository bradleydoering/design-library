-- CloudReno Supabase Database Schema
-- This schema supports bathroom packages and all product categories

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data integrity
CREATE TYPE bathroom_type AS ENUM ('Bathtub', 'Walk-in Shower', 'Tub & Shower', 'Sink & Toilet');
CREATE TYPE bathroom_size AS ENUM ('small', 'normal', 'large');
CREATE TYPE wall_tile_coverage AS ENUM ('None', 'Half way up', 'Floor to ceiling');
CREATE TYPE package_category AS ENUM ('Modern', 'Contemporary', 'Traditional', 'Luxury');

-- Products table (all product types)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(50) NOT NULL, -- tiles, vanities, etc.
    material VARCHAR(100),
    finish VARCHAR(100),
    color_ta VARCHAR(100),
    size VARCHAR(50),
    description TEXT,
    url TEXT,
    image_main TEXT,
    image_01 TEXT,
    image_02 TEXT,
    image_03 TEXT,
    cost_sqf DECIMAL(10,2),
    price_sqf DECIMAL(10,2),
    cost DECIMAL(10,2),
    price DECIMAL(10,2),
    -- Tile-specific fields
    wall BOOLEAN DEFAULT false,
    floor BOOLEAN DEFAULT false,
    shower_floor BOOLEAN DEFAULT false,
    accent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packages table
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category package_category NOT NULL,
    description TEXT,
    vision TEXT,
    image_main TEXT,
    image_01 TEXT,
    image_02 TEXT,
    image_03 TEXT,
    wall_tile_multiplier DECIMAL(3,2) DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package universal toggles
CREATE TABLE package_universal_toggles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    bathroom_type bathroom_type NOT NULL,
    wall_tile_coverage wall_tile_coverage NOT NULL,
    bathroom_size bathroom_size NOT NULL,
    floor_tile_included BOOLEAN DEFAULT true,
    wall_tile_included BOOLEAN DEFAULT true,
    shower_floor_tile_included BOOLEAN DEFAULT true,
    accent_tile_included BOOLEAN DEFAULT true,
    vanity_included BOOLEAN DEFAULT true,
    tub_included BOOLEAN DEFAULT true,
    tub_filler_included BOOLEAN DEFAULT true,
    toilet_included BOOLEAN DEFAULT true,
    shower_included BOOLEAN DEFAULT true,
    faucet_included BOOLEAN DEFAULT true,
    glazing_included BOOLEAN DEFAULT true,
    mirror_included BOOLEAN DEFAULT true,
    towel_bar_included BOOLEAN DEFAULT true,
    toilet_paper_holder_included BOOLEAN DEFAULT true,
    hook_included BOOLEAN DEFAULT true,
    lighting_included BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package products junction table
CREATE TABLE package_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    product_type VARCHAR(50) NOT NULL, -- floor_tile, wall_tile, vanity, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(package_id, product_type)
);

-- Brand logos table
CREATE TABLE brand_logos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Color reference table
CREATE TABLE colors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    hex_value VARCHAR(7) NOT NULL, -- #FFFFFF format
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_packages_category ON packages(category);
CREATE INDEX idx_package_products_package_id ON package_products(package_id);
CREATE INDEX idx_package_products_product_id ON package_products(product_id);
CREATE INDEX idx_package_products_type ON package_products(product_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies if needed
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_universal_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_logos ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed for your auth requirements)
CREATE POLICY "Public read access for products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read access for packages" ON packages FOR SELECT USING (true);
CREATE POLICY "Public read access for package_products" ON package_products FOR SELECT USING (true);
CREATE POLICY "Public read access for package_universal_toggles" ON package_universal_toggles FOR SELECT USING (true);
CREATE POLICY "Public read access for brand_logos" ON brand_logos FOR SELECT USING (true);
CREATE POLICY "Public read access for colors" ON colors FOR SELECT USING (true);

-- Views for easier querying
CREATE VIEW package_details AS
SELECT 
    p.*,
    put.bathroom_type,
    put.wall_tile_coverage,
    put.bathroom_size,
    put.floor_tile_included,
    put.wall_tile_included,
    put.shower_floor_tile_included,
    put.accent_tile_included,
    put.vanity_included,
    put.tub_included,
    put.tub_filler_included,
    put.toilet_included,
    put.shower_included,
    put.faucet_included,
    put.glazing_included,
    put.mirror_included,
    put.towel_bar_included,
    put.toilet_paper_holder_included,
    put.hook_included,
    put.lighting_included
FROM packages p
LEFT JOIN package_universal_toggles put ON p.id = put.package_id;

CREATE VIEW package_with_products AS
SELECT 
    p.*,
    pp.product_type,
    pr.sku as product_sku,
    pr.name as product_name,
    pr.brand as product_brand,
    pr.price,
    pr.price_sqf,
    pr.image_main as product_image
FROM packages p
LEFT JOIN package_products pp ON p.id = pp.package_id
LEFT JOIN products pr ON pp.product_id = pr.id;
-- Create table for universal bathroom configurations
CREATE TABLE IF NOT EXISTS universal_bath_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    config JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_config CHECK (id = 1)
);

-- Create an index on the updated_at column for performance
CREATE INDEX IF NOT EXISTS idx_universal_bath_config_updated_at ON universal_bath_config(updated_at);

-- Insert default configuration if none exists
INSERT INTO universal_bath_config (id, config) 
VALUES (1, '{
  "bathroomTypes": [
    {
      "id": "bathtub",
      "name": "Bathtub",
      "includedItems": {
        "floorTile": true,
        "wallTile": true,
        "showerFloorTile": true,
        "accentTile": true,
        "vanity": true,
        "tub": true,
        "tubFiller": true,
        "toilet": true,
        "shower": true,
        "faucet": true,
        "glazing": true,
        "mirror": true,
        "towelBar": true,
        "toiletPaperHolder": true,
        "hook": true,
        "lighting": true
      }
    },
    {
      "id": "walk-in-shower",
      "name": "Walk-in Shower",
      "includedItems": {
        "floorTile": true,
        "wallTile": true,
        "showerFloorTile": true,
        "accentTile": true,
        "vanity": true,
        "tub": false,
        "tubFiller": false,
        "toilet": true,
        "shower": true,
        "faucet": true,
        "glazing": true,
        "mirror": true,
        "towelBar": true,
        "toiletPaperHolder": true,
        "hook": true,
        "lighting": true
      }
    },
    {
      "id": "tub-and-shower",
      "name": "Tub & Shower",
      "includedItems": {
        "floorTile": true,
        "wallTile": true,
        "showerFloorTile": true,
        "accentTile": true,
        "vanity": true,
        "tub": true,
        "tubFiller": true,
        "toilet": true,
        "shower": true,
        "faucet": true,
        "glazing": true,
        "mirror": true,
        "towelBar": true,
        "toiletPaperHolder": true,
        "hook": true,
        "lighting": true
      }
    },
    {
      "id": "sink-and-toilet",
      "name": "Sink & Toilet",
      "includedItems": {
        "floorTile": true,
        "wallTile": false,
        "showerFloorTile": false,
        "accentTile": false,
        "vanity": true,
        "tub": false,
        "tubFiller": false,
        "toilet": true,
        "shower": false,
        "faucet": true,
        "glazing": false,
        "mirror": true,
        "towelBar": true,
        "toiletPaperHolder": true,
        "hook": true,
        "lighting": true
      }
    }
  ],
  "squareFootageConfig": {
    "small": {
      "floorTile": 40,
      "wallTile": {
        "Bathtub": { "none": 20, "halfwayUp": 55, "floorToCeiling": 110 },
        "Walk-in Shower": { "none": 30, "halfwayUp": 65, "floorToCeiling": 120 },
        "Tub & Shower": { "none": 40, "halfwayUp": 75, "floorToCeiling": 130 },
        "Sink & Toilet": { "none": 0, "halfwayUp": 30, "floorToCeiling": 85 }
      },
      "showerFloorTile": 9,
      "accentTile": 15
    },
    "normal": {
      "floorTile": 60,
      "wallTile": {
        "Bathtub": { "none": 25, "halfwayUp": 60, "floorToCeiling": 115 },
        "Walk-in Shower": { "none": 30, "halfwayUp": 65, "floorToCeiling": 120 },
        "Tub & Shower": { "none": 40, "halfwayUp": 75, "floorToCeiling": 130 },
        "Sink & Toilet": { "none": 0, "halfwayUp": 30, "floorToCeiling": 85 }
      },
      "showerFloorTile": 9,
      "accentTile": 20
    },
    "large": {
      "floorTile": 80,
      "wallTile": {
        "Bathtub": { "none": 30, "halfwayUp": 70, "floorToCeiling": 130 },
        "Walk-in Shower": { "none": 35, "halfwayUp": 80, "floorToCeiling": 150 },
        "Tub & Shower": { "none": 45, "halfwayUp": 90, "floorToCeiling": 160 },
        "Sink & Toilet": { "none": 0, "halfwayUp": 40, "floorToCeiling": 100 }
      },
      "showerFloorTile": 9,
      "accentTile": 25
    }
  },
  "wallTileCoverages": [
    { "id": "none", "name": "None", "multiplier": 0, "description": "No wall tiles in dry areas" },
    { "id": "half-way", "name": "Half way up", "multiplier": 0.5, "description": "Wall tiles up to 4 feet high" },
    { "id": "floor-to-ceiling", "name": "Floor to ceiling", "multiplier": 1.0, "description": "Wall tiles from floor to ceiling" }
  ],
  "defaultSettings": {
    "bathroomType": "tub-and-shower",
    "wallTileCoverage": "floor-to-ceiling",
    "bathroomSize": "normal"
  }
}'::jsonb)
ON CONFLICT (id) DO NOTHING;
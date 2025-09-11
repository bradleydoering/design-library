# CloudReno Bathroom Pricing — V1 (Installed Rates)

**Status:** Build now  
**Owner:** Brad / CloudReno  
**Author:** Tano  
**Non-Goals (defer to V2):** material-driven tile surcharges, floating vanity adder, glass type pricing.

> CSV seeds to include under `/seeds/pricing/` in your repo:
> - `rate_card_installed.csv`
> - `rate_surcharges.csv` *(kept for V2; unused in V1)*
> - `rate_project_multipliers.csv`
> - `quote_form_pricing_map.csv`

---

## 1) Purpose

Create a **rate-sheet portal** contractors can edit, and a **calculator** that converts a short site-visit form into a price using **installed sell rates** (labour + standard materials baked in). The sheet remains simple to maintain and deterministic to compute.

- Keep rates in one editable table (**Installed Rates**).
- Keep a tiny **Project Multipliers** table (contingency, PM fee, condo factor, pre-1980 factor).
- **Do not** ask about tile complexity, glass type, or vanity mount in V1.
- V2 will read package metadata and apply surcharges automatically.

---

## 2) Inputs (V1 Quote Form)

### Minimal fields
```json
{
  "bathroom_type": "walk_in | tub_shower | tub_only | powder",
  "building_type": "house | condo",
  "year_built": "pre_1980 | post_1980 | unknown",
  "floor_sqft": 0,
  "wet_wall_sqft": 0,
  "tile_other_walls": "none | half | full",
  "electrical_items": 0,

  "vanity_width_in": 0,        // only to decide if vanity present (>0 ⇒ add 1 unit)
  "plumbing_has_sink": true,   // defaults true unless powder or custom
  "plumbing_has_toilet": true, // defaults true unless shower-only room
  "plumbing_relocations": 0,   // count of drain relocations (each +2 points)
  "electrical_relocations": 0  // count (each +2 items)
}
```

### Counting rules (hard-coded)
- **Plumbing points**:  
  `3` for shower pan/tub set **+** `1` per sink/faucet **+** `1` per shower set **+** `1` per toilet **+** `2 * plumbing_relocations`.
- **Electrical items**:  
  `electrical_items + 2 * electrical_relocations`. *(Heated floors, glass, etc. are deferred to V2.)*
- **Mutual exclusivity / guards**:
  - **Kerdi OR RedGard** (Kerdi is default in V1).
  - If `tile_other_walls != none` → Painting stays **optional**; default **0** unless we add a separate paint sqft field later.
  - If `bathroom_type = walk_in` → add **RECESS** (subfloor recess).  
    If a curb is desired in V1, contractor toggles **CRB** in the portal when quoting.

---

## 3) Pricing Data (seeded from CSVs)

### Installed Rates (editable)
- Columns: `line_code, line_name, unit[unit|sqft|item|point], base_price, price_per_unit, notes`
- Examples:
  - `DEM` Demolition (unit): base `1107.00`
  - `PLM` Plumbing points (point): per `307.50`
  - `ELE` Electrical items (item): per `184.50`
  - `SUB-GRB` Backerboard wet areas (sqft): base `184.50`, per `3.69`
  - `WPF-KER` Waterproofing Kerdi (sqft): base `246.00`, per `4.92`
  - `TILE-WET` Tile setting — wet walls (sqft): base `369.00`, per `12.30`
  - `TILE-DRY` Tile setting — dry walls (sqft): per `12.30`
  - `TILE-FLR` Tile setting — floor (sqft): base `123.00`, per `12.30`
  - `PAINT` Painting (sqft): base `246.00`, per `3.69`
  - `VAN` Vanity install (unit): base `264.45`
  - `GLASS` Shower glass install (unit): base `492.00` *(unused in V1 unless manually added)*
  - `NICHE`, `CRB`, `BENCH`, `RECESS`, `DUMP`, `POPC`, `ASB-T`, `BASE`, `HARD`, `WALL-REM` …

> Numbers mirror your current **customer sell** math. Contractors edit **base_price** and **price_per_unit** directly.

### Project Multipliers
- Columns: `code, name, basis[percent_of_labour|percent_of_sell], default_percent`
- Seeds:
  - `CONTINGENCY` … `2.0`
  - `PM-FEE` … `0.0`
  - `CONDO-FCTR` … `0.0`
  - `OLDHOME-ASB` … `0.0`

### Surcharges (kept for V2; unused in V1)
- Columns: `code, name, unit[sqft|unit], adder_amount`
- Example codes: `SUR-MAT-GLASS`, `SUR-LARGE`, `SUR-SMALL`, `SUR-PAT-OFF`, `SUR-PAT-HERR`, `SUR-PAT-HEX`, `CRB-M`, `NICHE-LG`.

**Required Codes (V1 fail‑loud check):**  
`DEM, PLM, ELE, SUB-GRB, WPF-KER, TILE-WET, TILE-DRY, TILE-FLR, DUMP, VAN, RECESS, NICHE, CRB, BENCH, PAINT, DRY, POPC, ASB-T, BASE, HARD, WALL-REM`

---

## 4) Data Model (Supabase)

```sql
-- enums
create type unit_kind as enum ('unit','sqft','item','point');
create type basis_kind as enum ('percent_of_labour','percent_of_sell');

-- pricing tables
create table rate_lines (
  line_code text primary key,
  line_name text not null,
  unit unit_kind not null,
  base_price numeric not null default 0,
  price_per_unit numeric not null default 0,
  notes text,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table project_multipliers (
  code text primary key,
  name text not null,
  basis basis_kind not null,
  default_percent numeric not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

-- kept for V2 (not used in V1 compute)
create table rate_surcharges (
  code text primary key,
  name text not null,
  unit unit_kind not null,
  adder_amount numeric not null,
  active boolean not null default true
);

-- quotes
create table quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_id uuid,
  bathroom_type text not null,
  building_type text not null,
  year_built text not null,
  floor_sqft numeric not null default 0,
  wet_wall_sqft numeric not null default 0,
  tile_other_walls text not null default 'none',
  electrical_items int not null default 0,
  electrical_relocations int not null default 0,
  plumbing_relocations int not null default 0,
  vanity_width_in int not null default 0,
  raw_answers jsonb not null default '{}'::jsonb
);

create table quote_line_items (
  id bigserial primary key,
  quote_id uuid references quotes(id) on delete cascade,
  line_code text references rate_lines(line_code),
  quantity numeric not null default 0,
  unit_price numeric not null default 0,     -- resolved from rate_lines
  base_applied boolean not null default false,
  extended numeric not null default 0,       -- (base if applied) + quantity*unit_price
  source text not null default 'auto'        -- 'auto' | 'manual'
);

create table quote_totals (
  quote_id uuid primary key references quotes(id) on delete cascade,
  labour_subtotal numeric not null default 0,
  contingency numeric not null default 0,
  pm_fee numeric not null default 0,
  condo_uplift numeric not null default 0,
  oldhome_uplift numeric not null default 0,
  grand_total numeric not null default 0,
  meta jsonb not null default '{}'::jsonb
);
```
**Seeds:** load the three CSVs into `rate_lines`, `project_multipliers`, `rate_surcharges`.

---

## 5) Calculation

### Mapping logic (V1)
```
Always add: DEM (1 unit)
PLM points = 3 (pan/tub) + sink?1:0 + shower set?1:0 + toilet?1:0 + 2*plumbing_relocations
ELE items  = electrical_items + 2*electrical_relocations

Add by areas:
- floor_sqft > 0 → TILE-FLR (qty=floor_sqft), DUMP (qty=floor_sqft)
- wet_wall_sqft > 0 → SUB-GRB (qty=wet_wall_sqft), WPF-KER (qty=wet_wall_sqft), TILE-WET (qty=wet_wall_sqft)

Other walls:
- if tile_other_walls = 'half' or 'full' → TILE-DRY with provided sqft (V1: default 0 unless you add a field)
- else Painting stays 0 unless a paint sqft field is added.

Features:
- vanity_width_in > 0 → VAN (1 unit)
- bathroom_type = 'walk_in' → RECESS (1 unit)
- Optional toggles the estimator can add manually: NICHE, BENCH, CRB, GLASS, etc.
```

### Totals
```
line_total = base_price(if not already applied for this line) + (price_per_unit * quantity)
labour_subtotal = Σ line_totals
contingency     = labour_subtotal * CONTINGENCY%
pm_fee          = (labour_subtotal + contingency) * PM-FEE%
condo_uplift    = labour_subtotal * CONDO-FCTR%   (if building_type='condo')
oldhome_uplift  = labour_subtotal * OLDHOME-ASB%  (if year_built='pre_1980')
grand_total     = labour_subtotal + contingency + pm_fee + condo_uplift + oldhome_uplift
```

### Example (from current questionnaire; assumptions noted)
```
Inputs:
- bathroom_type: walk_in
- building_type: house
- year_built: pre_1980 (testing is a separate manual add in V1)
- floor_sqft: 60
- wet_wall_sqft: 120
- tile_other_walls: none
- electrical_items: 4
- relocations: 0
- vanity_width_in: 36

Derived:
- PLM points = 3 (pan) + 1 (sink) + 1 (shower set) + 1 (toilet) = 6
- ELE items  = 4

Line totals (installed sell):
- TILE-FLR: 123 + 12.30*60 = 861.00
- TILE-WET: 369 + 12.30*120 = 1,845.00
- SUB-GRB: 184.50 + 3.69*120 = 627.30
- WPF-KER: 246 + 4.92*120  = 836.40
- DUMP: 184.50 + 3.69*60   = 405.90
- DEM: 1,107.00
- ELE: 184.50*4            = 738.00
- VAN: 264.45
- PLM: 307.50*6            = 1,845.00

Labour subtotal = **8,530.05**  
CONTINGENCY 2%  = **170.60**  
Grand total (no PM fee/condo/oldhome uplifts) = **8,700.65**
```

---

## 6) Services / Functions

### TypeScript types
```ts
type UnitKind = 'unit' | 'sqft' | 'item' | 'point';
type BasisKind = 'percent_of_labour' | 'percent_of_sell';

interface RateLine { line_code:string; unit:UnitKind; base_price:number; price_per_unit:number; }
interface Multiplier { code:string; basis:BasisKind; default_percent:number; }

interface QuoteInput {
  bathroom_type:'walk_in'|'tub_shower'|'tub_only'|'powder';
  building_type:'house'|'condo';
  year_built:'pre_1980'|'post_1980'|'unknown';
  floor_sqft:number; wet_wall_sqft:number; tile_other_walls:'none'|'half'|'full';
  electrical_items:number; electrical_relocations:number; plumbing_relocations:number;
  vanity_width_in:number; plumbing_has_sink:boolean; plumbing_has_toilet:boolean;
}

interface LineItemOut { line_code:string; quantity:number; unit_price:number; base_applied:boolean; extended:number; }
interface QuoteTotals { labour_subtotal:number; contingency:number; pm_fee:number; condo_uplift:number; oldhome_uplift:number; grand_total:number; }
```

### Core functions
```ts
// 1) Map form to line items (quantities only)
function mapInputsToQuantities(input: QuoteInput): Record<string, number> { /* rules above */ }

// 2) Resolve prices and compute extendeds
function priceLineItems(qtys: Record<string, number>, rates: Record<string, RateLine>): LineItemOut[] { /* apply base once per code; qty drives per_unit */ }

// 3) Totals
function computeTotals(lines: LineItemOut[], multipliers: Record<string, Multiplier>, ctx: {building_type:string, year_built:string}): QuoteTotals { /* formula above */ }
```

### Supabase RPC (optional)
- `rpc_compute_quote(quote_id uuid)`:
  - Loads `quotes`, `rate_lines`, `project_multipliers`
  - Calls rules in SQL/PLpgSQL or via Edge Function
  - Writes `quote_line_items` & `quote_totals`
- Trigger: `AFTER INSERT OR UPDATE ON quotes` → recompute.

---

## 7) Rate-Sheet Portal (Contractor UX)

- **Installed Rates grid** (main editor): `line_code | line_name | unit | base_price | price_per_unit | notes`
- **Project Multipliers**: simple inputs for `%` values.
- Preview panel with a **sample quote** that updates as they type.
- Export/Import CSV.

> Fail loud: if a required line_code is missing or inactive, show a blocking error and log to Sentry.

---

## 8) Version 2 Notes (Materials-driven pricing)

- Add metadata to **Design Packages**:
  ```ts
  interface PackageLabourMeta {
    tile_material: 'standard'|'marble_glass';
    tile_size: '<6'|'6to24'|'>24';
    tile_pattern: 'straight'|'offset'|'herringbone'|'hex_subway';
    vanity_mount: 'floating'|'fixed';
    glass_type: 'panel'|'hinged'|'slider'|'custom';
  }
  ```
- New table: `package_labour_modifiers(package_id uuid, code text, unit 'sqft'|'unit', amount numeric)`  
  Examples: `SUR-LARGE 6.00/sqft`, `CRB-M 180/unit`, `VAN-FLOAT 260/unit`.
- The calculator applies modifiers to **affected tile lines** or **unit adders** based on the chosen package—no extra questions for the customer.

---

## 9) QA / Test Vectors

1) **Walk-in, house, pre-1980; floor=60, wet=120; tile other walls=none; ELE=4; no relocations; vanity=36"**  
   - Expected: labour_subtotal **8,530.05**; contingency **170.60**; grand_total **8,700.65**.
2) **Tub+Shower, condo; floor=35, wet=70; ELE=2; vanity=30";** condo factor 5%**  
   - Verify condo uplift only touches labour_subtotal.
3) **Powder (no shower), floor=30, wet=0; ELE=1; vanity=30";**  
   - No WPF/SUB-GRB/TILE-WET; allow TILE-FLR/PAINT.

---

## 10) Security / Ops

- Auth: contractors must log in to edit rates (RLS on `rate_lines`, `project_multipliers`).
- Everything audited: `updated_by`, `updated_at` columns.
- Metrics: store compute time & version hash of rates used per quote.
- Errors: throw & surface a visible banner; do **not** silently estimate.

---

**Changelog**
- Regenerated: tightened required-codes checklist and added audit columns to schema.

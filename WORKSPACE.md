# Cloud Renovation - Monorepo Structure

This repository contains multiple applications and packages organized as npm workspaces.

## 📁 Structure

```
design-library/                    # Monorepo root
├── apps/
│   ├── design-library/            # Original design library app
│   │   ├── app/                   # Next.js app directory
│   │   ├── lib/                   # Utility functions & pricing engine
│   │   ├── components/            # React components
│   │   ├── public/                # Static assets
│   │   ├── scripts/               # Build & migration scripts
│   │   └── package.json           # Dependencies & scripts
│   └── quote-app/                 # New customer quote portal
│       ├── app/                   # Next.js app directory  
│       ├── components/            # React components
│       ├── lib/                   # Auth & utility functions
│       ├── supabase/              # Database migrations
│       └── package.json           # Dependencies & scripts
├── packages/
│   └── design-pricing-sdk/        # Extracted pricing SDK
│       ├── src/                   # TypeScript source
│       ├── dist/                  # Compiled JavaScript
│       └── package.json           # Package configuration
└── package.json                   # Workspace configuration
```

## 🚀 Development Commands

### Start All Applications
```bash
npm run dev:all          # Start all apps in development mode
```

### Individual Applications  
```bash
npm run dev              # Start design library (localhost:3001)
npm run dev:quote        # Start quote app (localhost:6969)
```

### Build & Lint
```bash
npm run build            # Build all workspaces
npm run lint             # Lint all workspaces
```

### Package Management
```bash
npm install              # Install dependencies for all workspaces
npm run clean            # Remove all node_modules
```

## 📦 Workspaces

### `apps/design-library/`
- **Purpose**: Original bathroom design configurator and pricing tool
- **URL**: http://localhost:3001
- **Database**: Existing Supabase project (unchanged)
- **Status**: Production system (no changes to runtime)

### `apps/quote-app/`  
- **Purpose**: Secure customer quote portal with contractor dashboard
- **URL**: http://localhost:6969
- **Database**: Separate Supabase project with RLS policies
- **Status**: New development, isolated from production

### `packages/design-pricing-sdk/`
- **Purpose**: Shared pricing calculation engine
- **Used by**: Quote app (read-only access to design library pricing)
- **Status**: Extract of design library pricing logic

## 🔐 Independence & Isolation

- **Separate deployments** - Each app deploys independently
- **Separate databases** - Quote app uses its own Supabase project
- **Separate dependencies** - Each workspace manages its own packages
- **Zero impact** - Quote app development doesn't affect design library production

## 📋 Next Steps

1. **Set up quote app Supabase project**
2. **Configure environment variables**
3. **Build contractor dashboard**
4. **Integrate payment processing**
5. **Deploy quote app to production**
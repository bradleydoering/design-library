# Cloud Renovation - Monorepo

This repository contains multiple applications for Cloud Renovation's design and quoting systems.

## 🏗️ Applications

### Design Library (Production)
- **Purpose**: Bathroom design configurator and pricing tool
- **Location**: `apps/design-library/`
- **URL**: http://localhost:3001
- **Status**: Production system, unchanged

### Quote App (Development)  
- **Purpose**: Secure customer quote portal
- **Location**: `apps/quote-app/`
- **URL**: http://localhost:3333
- **Status**: New development, isolated from production

## 🚀 Quick Start

```bash
# Install all dependencies
npm install

# Start design library (production)
npm run dev

# Start quote app (development)  
npm run dev:quote

# Start both applications
npm run dev:all
```

## 📚 Documentation

- **[WORKSPACE.md](./WORKSPACE.md)** - Complete monorepo structure and commands
- **[README-QUOTE-APP.md](./README-QUOTE-APP.md)** - Quote app setup and architecture
- **[quote_app_technical_spec.md](./quote_app_technical_spec.md)** - Technical specification

## 🔐 Security & Isolation

The quote app is completely isolated from the design library:
- ✅ Separate deployments
- ✅ Separate databases  
- ✅ Independent development
- ✅ Zero production impact

## 📦 Packages

- **`@cloudreno/design-pricing`** - Shared pricing calculation SDK

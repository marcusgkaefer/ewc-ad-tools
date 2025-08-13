# Implementation Guide - Step by Step

## Quick Start Setup

### 1. Install Development Dependencies

```bash
# Install Husky and quality tools
npm install --save-dev husky lint-staged @commitlint/cli @commitlint/config-conventional
npm install --save-dev prettier eslint-plugin-jsx-a11y eslint-plugin-import
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install --save-dev depcheck ts-unused-exports jscpd
npm install --save-dev msw @testing-library/jest-dom @testing-library/user-event
npm install --save-dev playwright @playwright/test

# State management
npm install zustand

# Additional utilities
npm install clsx tailwind-merge zod react-hook-form @hookform/resolvers
```

### 2. Initialize Git Hooks

```bash
# Initialize Husky
npx husky install
npm pkg set scripts.prepare="husky install"

# Create pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"

# Create pre-push hook  
npx husky add .husky/pre-push "npm run type-check && npm run test:run"

# Create commit-msg hook
npx husky add .husky/commit-msg "npx commitlint --edit \$1"
```

### 3. Configuration Files

#### `.lintstagedrc.json`
```json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{js,jsx,ts,tsx,json,css,md}": [
    "prettier --write"
  ]
}
```

#### `commitlint.config.js`
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'test',
        'chore',
        'perf',
        'ci',
        'build',
        'revert'
      ]
    ]
  }
}
```

#### `.prettierrc.json`
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### 4. Enhanced Package.json Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "analyze:unused": "ts-unused-exports tsconfig.json",
    "analyze:deps": "depcheck",
    "analyze:duplicates": "jscpd src/",
    "quality:check": "npm run lint && npm run type-check && npm run test:run && npm run format:check",
    "migrate-locations": "tsx scripts/migrate-locations.ts",
    "populate-configs": "tsx scripts/populate-location-configs.ts"
  }
}
```

## Phase-by-Phase Implementation

### Phase 1: Foundation Setup (Day 1-2)

#### Priority Actions
1. ✅ **Set up quality gates** (Agent 4)
   ```bash
   npm run quality:check  # Should pass before starting
   ```

2. 🔄 **Create basic store structure** (Agent 2)
   ```bash
   mkdir -p src/stores src/hooks src/schemas
   # Create placeholder files with TypeScript interfaces
   ```

3. 🔄 **Set up testing infrastructure** (Agent 3)
   ```bash
   mkdir -p src/test/{utils,mocks,fixtures} tests/e2e
   # Configure MSW and testing utilities
   ```

### Phase 2: Component Decomposition (Day 3-7)

#### App.tsx Breakdown (Agent 1)
```bash
# Create step components
mkdir -p src/components/{steps,layout,shared}

# Extract each step systematically:
# 1. LocationSelectionStep.tsx  
# 2. CampaignSettingsStep.tsx
# 3. AdConfigurationStep.tsx
# 4. ReviewStep.tsx
# 5. ResultsStep.tsx
```

#### Key Extraction Pattern:
```typescript
// Before: Inline step in App.tsx
{currentStep === 1 && (
  <motion.div>
    {/* 200+ lines of JSX */}
  </motion.div>
)}

// After: Clean component usage
{currentStep === 1 && (
  <LocationSelectionStep 
    locations={locations}
    onLocationSelect={handleLocationSelect}
    onNext={() => setCurrentStep(2)}
  />
)}
```

### Phase 3: State Management (Day 8-10)

#### Store Implementation (Agent 2)
```typescript
// useCampaignStore.ts
import { create } from 'zustand'

interface CampaignState {
  campaigns: Campaign[]
  currentCampaign: CampaignConfiguration | null
  isLoading: boolean
  // ... rest of state and actions
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  // Implementation
}))
```

### Phase 4: Testing Implementation (Day 11-14)

#### Test Strategy (Agent 3)
```bash
# Test each new component as it's created
# Pattern: Create component -> Write tests -> Verify coverage

npm run test:coverage  # Target: 90%+ coverage
```

### Phase 5: Cleanup & Optimization (Day 15-21)

#### Dead Code Elimination (Agent 5)
```bash
# Analyze and remove unused code
npm run analyze:unused
npm run analyze:deps  
npm run analyze:duplicates

# Remove identified unused files/dependencies
```

## Success Validation

### Daily Quality Checks
```bash
# Run this command daily to ensure quality
npm run quality:check
```

### Milestone Checkpoints

#### Week 1 Checkpoint
- [ ] Git hooks active and blocking bad commits
- [ ] Basic component structure in place
- [ ] Store infrastructure created
- [ ] Testing framework operational

#### Week 2 Checkpoint  
- [ ] App.tsx decomposed into steps
- [ ] SimplifiedCampaignCreator.tsx refactored
- [ ] Major modals broken down
- [ ] Test coverage > 70%

#### Week 3 Checkpoint
- [ ] All components < 300 lines
- [ ] Consistent state management
- [ ] API service layer unified
- [ ] Test coverage > 85%

#### Final Checkpoint
- [ ] Test coverage > 90%
- [ ] Bundle size reduced 20%+
- [ ] All quality gates passing
- [ ] Performance benchmarks met

## Troubleshooting

### Common Issues

#### Git Hook Failures
```bash
# If pre-commit fails:
npm run lint:fix
npm run format
git add .
git commit -m "fix: resolve linting issues"
```

#### Test Failures
```bash
# Debug failing tests:
npm run test:ui  # Visual test runner
# Fix issues, then commit
```

#### TypeScript Errors
```bash
# Check types without emitting:
npm run type-check
# Fix issues in identified files
```

## Monitoring Progress

### Metrics Dashboard
Track these metrics daily:
- Lines of code per component (target: < 300)
- Test coverage percentage (target: > 90%)
- Bundle size in MB (track reduction)
- ESLint warnings count (target: 0)
- TypeScript errors count (target: 0)

### Tools for Monitoring
```bash
# Generate metrics report
npm run analyze:deps && npm run analyze:unused && npm run test:coverage
```

This implementation guide provides a concrete roadmap for executing the refactoring plan systematically and with measurable progress indicators.

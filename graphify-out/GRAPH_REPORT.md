# EduDock137 Knowledge Graph Report

## Corpus Overview
- **Files:** 113 total
  - Code: 105 files (TypeScript, TSX, JavaScript, JSON configs)
  - Docs: 4 markdown files (README.md, admin README)
  - Images: 4 files (favicon, hero image, placeholders, social)
- **Words:** ~41,155
- **Graph Size:** 176 nodes, 436 edges

## Architecture Summary

### Technology Stack
- **Frontend:** React 18 + TypeScript
- **Build:** Vite with HMR
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (40+ pre-built accessible components)
- **Backend:** Supabase (PostgreSQL + Auth + Functions)
- **Testing:** Vitest + Playwright

### Key Modules

#### 1. Pages Layer
- **Home.tsx** - Landing page with hero section and trending
- **Tools.tsx** - Tool search and discovery interface
- **Pdfs.tsx** - PDF management and viewing
- **Updates.tsx** - Update log and changelog
- **Terms.tsx / Privacy.tsx** - Legal pages
- **NotFound.tsx** - 404 handler

#### 2. Components Layer
- **Layout Components:**
  - PublicLayout.tsx - Main app layout wrapper
  - HeroSection.tsx - Hero section with CTA
  - TrendingSection.tsx - Featured content

- **UI Components (60+):**
  - Form components (input, button, checkbox, radio, select, textarea)
  - Dialog components (modal, alert-dialog, sheet, drawer)
  - Data display (table, accordion, tabs, carousel)
  - Navigation (breadcrumb, pagination, navigation-menu, sidebar)
  - Feedback (toast, toaster, progress, skeleton)
  - Special (date-picker, command palette, rich editor integration)

- **Admin Components:**
  - ContentManager.tsx - Content editing interface
  - ContentSection.tsx - Section management
  - DeleteConfirmationModal.tsx - Safe deletion flow

#### 3. Hooks & State Management
- **useTools.ts** - Tools list fetching and search
- **usePdfs.ts** - PDF data management
- **useUpdates.ts** - Updates feed
- **useDebouncedSearch.ts** - Debounced search with cancel
- **use-mobile.tsx** - Responsive design detection
- **use-toast.ts** - Toast notification system

#### 4. Backend Integration
- **supabase/client.ts** - Supabase client initialization
- **supabase/deletion.ts** - Safe deletion handlers with constraints
- **supabase/types.ts** - Auto-generated TypeScript types from schema

#### 5. Utilities & Config
- **lib/utils.ts** - Helper functions (cn, classname merging)
- **vite.config.ts** - Build configuration with alias paths
- **tailwind.config.ts** - Theme customization (colors, fonts)
- **tsconfig.json** - Strict TypeScript settings
- **eslint.config.js** - Code quality rules

## Community Structure

### Community 0: React UI Components (40+ nodes)
The shadcn/ui library and wrapper components. Most of the application depends on these.

### Community 1: Build & Configuration (8 nodes)
Vite, Tailwind, ESLint, TypeScript, PostCSS, Playwright configuration files.

### Community 2: Pages (6 nodes)
Page-level components that serve as route endpoints.

### Community 3: Hooks & State (6 nodes)
Custom React hooks for data fetching and UI state.

### Community 4: Backend Integration (3 nodes)
Supabase client, types, and deletion logic.

### Community 5: Layout & Sections (3 nodes)
Layout wrapper and visual sections (Hero, Trending).

### Community 6: Admin Features (3 nodes)
Content management and deletion interfaces.

## God Nodes (Most Central)

1. **React** - Core framework, imported in every component
2. **src/components/ui/** - 40+ UI components depended on throughout app
3. **Supabase Client** - Central API gateway for all backend communication
4. **Tailwind CSS** - Styling framework used in all visual components
5. **Public Layout** - Wraps all pages, contains navigation

## Surprising Connections

1. **ParticleBackground** component connects visual effects to home layout
2. **ContentManager** bridges admin functionality to core database types
3. **ErrorBoundary** wraps entire app for resilient error handling
4. **OptimizedImage** provides consistent image handling across all pages
5. **ThemeProvider** enables light/dark mode across entire UI

## Data Flow Patterns

### Tool Discovery Flow
```
Tools.tsx 
  → useTools hook 
    → Supabase queries 
      → useDebouncedSearch debounces input
        → Results displayed via shadcn/ui Table
```

### PDF Management Flow
```
Pdfs.tsx 
  → usePdfs hook 
    → Supabase (fetch, upload, delete) 
      → Admin DeleteConfirmationModal confirms destructive ops
        → Deletion constraints enforced via supabase/deletion.ts
```

### Admin Content Updates
```
ContentManager.tsx 
  → ContentSection.tsx 
    → Supabase mutations 
      → types.ts validates schema
        → UI feedback via toast notifications
```

## Suggested Exploration Questions

1. **How does the component system scale?**
   - What makes the 40+ shadcn/ui components reusable?
   - How are theme and styling applied consistently?

2. **What is the complete data lifecycle?**
   - How do pages → hooks → Supabase form a cohesive flow?
   - Where are constraints and validation applied?

3. **How is admin functionality isolated?**
   - Which components require authentication?
   - How does DeleteConfirmationModal prevent accidents?

4. **What are performance optimizations?**
   - Why use useDebouncedSearch vs immediate queries?
   - How does OptimizedImage improve page speed?

5. **What are the failure modes?**
   - How does ErrorBoundary prevent cascading failures?
   - What happens when Supabase is down?

## Design Patterns Observed

1. **Component Composition** - Pages compose layout and feature components
2. **Hooks for Logic** - useXxx hooks extract data fetching and state
3. **UI Library First** - 40+ pre-built components reduce custom CSS
4. **Backend Abstraction** - Supabase logic isolated in integrations/
5. **Type Safety** - TypeScript interfaces throughout, auto-generated from DB

## Metrics

- **Code Reusability:** High - 40+ UI components used across 6+ pages
- **Separation of Concerns:** Good - Clear layer separation (pages/components/hooks/integrations)
- **Type Coverage:** Excellent - Strict TypeScript throughout, even in config files
- **Feature Scope:** Medium - Core features (discover, manage) well-implemented
- **Extensibility:** Good - Hook-based logic easy to extend or modify

---

**Generated:** 2026-04-20  
**Pipeline:** AST extraction + semantic analysis  
**Tokens Used:** Structural extraction (no LLM needed for small corpus)

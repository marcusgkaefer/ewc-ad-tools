# Waxcenter Ad Tools - Design System v2.0

## Overview

The Waxcenter Ad Tools Design System delivers a sophisticated, premium user experience inspired by European Wax Center's elegant branding. This design system combines refined aesthetics with intuitive functionality, creating a streamlined workflow that embodies luxury, professionalism, and efficiency.

## Design Philosophy

### Core Principles

1. **Luxurious Simplicity**: Clean, sophisticated interfaces that embody premium service quality
2. **Efficient Workflows**: Streamlined processes that respect user time and expertise
3. **Brand Cohesion**: Consistent with Waxcenter.com's elegant red and white aesthetic
4. **Professional Excellence**: Every element designed for professional marketing teams
5. **Responsive Elegance**: Flawless experience across all devices
6. **Performance-First**: Smooth interactions with purposeful animations

### Visual Language

- **Elegant Minimalism**: Clean lines with purposeful negative space
- **Sophisticated Color Palette**: Waxcenter red as primary with elegant supporting colors
- **Purposeful Micro-interactions**: Smooth animations that enhance usability
- **Premium Typography**: Professional hierarchy with excellent readability
- **Refined Spacing**: Generous, consistent spacing that breathes luxury

## Color Palette

### Primary Colors (Waxcenter Red)
```tailwind
wax-red-50        /* #fef2f2 - Light red backgrounds */
wax-red-100       /* #fee2e2 - Subtle red highlights */
wax-red-200       /* #fecaca - Soft red accents */
wax-red-300       /* #fca5a5 - Interactive elements */
wax-red-400       /* #f87171 - Hover states */
wax-red-500       /* #ef4444 - Main brand color */
wax-red-600       /* #dc2626 - Primary brand color */
wax-red-700       /* #b91c1c - Active states */
wax-red-800       /* #991b1b - Dark elements */
wax-red-900       /* #7f1d1d - High contrast text */
```

### Secondary Colors (Elegant Whites)
```tailwind
wax-white-50      /* #ffffff - Pure white */
wax-white-100     /* #fefefe - Off white */
wax-white-200     /* #fafafa - Light gray */
wax-white-300     /* #f4f4f4 - Subtle borders */
wax-white-400     /* #e5e5e5 - Disabled states */
wax-white-500     /* #d4d4d4 - Mid-tone gray */
wax-white-600     /* #a3a3a3 - Secondary text */
wax-white-700     /* #737373 - Primary text */
wax-white-800     /* #525252 - Dark text */
wax-white-900     /* #404040 - High contrast */
```

### Supporting Colors (Professional Grays)
```tailwind
wax-gray-50       /* #f9fafb - Light backgrounds */
wax-gray-100      /* #f3f4f6 - Card backgrounds */
wax-gray-200      /* #e5e7eb - Borders */
wax-gray-300      /* #d1d5db - Interactive elements */
wax-gray-400      /* #9ca3af - Placeholder text */
wax-gray-500      /* #6b7280 - Secondary text */
wax-gray-600      /* #4b5563 - Primary text */
wax-gray-700      /* #374151 - Headings */
wax-gray-800      /* #1f2937 - Dark elements */
wax-gray-900      /* #111827 - Maximum contrast */
```

### Accent Colors (Luxury Gold)
```tailwind
wax-gold-50       /* #fffbeb - Light gold backgrounds */
wax-gold-100      /* #fef3c7 - Gold highlights */
wax-gold-200      /* #fde68a - Warm accents */
wax-gold-300      /* #fcd34d - Interactive warmth */
wax-gold-400      /* #fbbf24 - Hover warmth */
wax-gold-500      /* #f59e0b - Warm gold accent */
wax-gold-600      /* #d97706 - Active warmth */
wax-gold-700      /* #b45309 - Text on light backgrounds */
wax-gold-800      /* #92400e - Dark mode accents */
wax-gold-900      /* #78350f - High contrast accent */
```

### Semantic Colors
```tailwind
wax-success       /* #10b981 - Success states */
wax-warning       /* #f59e0b - Warning states */
wax-error         /* #ef4444 - Error states */
wax-info          /* #3b82f6 - Information states */
```

## Custom Gradients

### Background Gradients
```tailwind
bg-wax-gradient   /* Elegant red to gold gradient */
bg-wax-subtle     /* Subtle white to gray gradient */
bg-wax-elegant    /* Premium white to red gradient */
```

### Implementation
```css
.bg-wax-gradient {
  background: linear-gradient(135deg, #dc2626 0%, #f59e0b 100%);
}

.bg-wax-subtle {
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
}

.bg-wax-elegant {
  background: linear-gradient(135deg, #ffffff 0%, #fef2f2 50%, #f9fafb 100%);
}
```

## Typography

### Font Families
- **Primary**: Inter (modern, clean, professional) - `font-sans`
- **Monospace**: JetBrains Mono (code and technical content) - `font-mono`

### Font Weights
- **Light**: `font-light` (Large displays only)
- **Regular**: `font-normal` (Body text)
- **Medium**: `font-medium` (Emphasized text)
- **Semi-bold**: `font-semibold` (Subheadings)
- **Bold**: `font-bold` (Headings)
- **Extra-bold**: `font-extrabold` (Hero titles)

### Type Scale
- **Hero Title**: `text-4xl lg:text-6xl font-extrabold text-wax-red-600`
- **Page Title**: `text-3xl font-bold text-wax-gray-800`
- **Section Title**: `text-2xl font-semibold text-wax-gray-700`
- **Card Title**: `text-xl font-semibold text-wax-gray-700`
- **Subheading**: `text-lg font-medium text-wax-gray-600`
- **Body**: `text-base font-normal text-wax-gray-600`
- **Caption**: `text-sm font-medium text-wax-gray-500`
- **Small**: `text-xs font-medium text-wax-gray-400`

## Spacing System

### Consistent Spacing
```tailwind
p-2       /* 8px padding */
p-3       /* 12px padding */
p-4       /* 16px padding */
p-6       /* 24px padding */
p-8       /* 32px padding */
p-12      /* 48px padding */

m-2       /* 8px margin */
m-3       /* 12px margin */
m-4       /* 16px margin */
m-6       /* 24px margin */
m-8       /* 32px margin */
m-12      /* 48px margin */

gap-4     /* 16px grid/flex gap */
gap-6     /* 24px grid/flex gap */
gap-8     /* 32px grid/flex gap */
```

### Application Guidelines
- **Component padding**: `p-4` to `p-6`
- **Section spacing**: `mb-6` to `mb-8`
- **Page margins**: `px-6` to `px-8`
- **Grid gaps**: `gap-4` to `gap-6`

## Border Radius

```tailwind
rounded-lg        /* 8px - Standard elements */
rounded-xl        /* 12px - Cards and forms */
rounded-2xl       /* 16px - Large containers */
rounded-3xl       /* 24px - Hero elements */
rounded-full      /* Pills and avatars */
```

## Shadow System

### Custom Wax Shadows
```tailwind
shadow-wax-sm     /* Subtle separation */
shadow-wax-md     /* Form elements */
shadow-wax-lg     /* Interactive cards */
shadow-wax-xl     /* Floating elements */
shadow-wax-2xl    /* Modal overlays */
shadow-wax-inner  /* Inset shadows */
```

### Implementation
```css
.shadow-wax-sm { box-shadow: 0 1px 2px 0 rgba(220, 38, 38, 0.05); }
.shadow-wax-md { box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.1), 0 2px 4px -1px rgba(220, 38, 38, 0.06); }
.shadow-wax-lg { box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.1), 0 4px 6px -2px rgba(220, 38, 38, 0.05); }
.shadow-wax-xl { box-shadow: 0 20px 25px -5px rgba(220, 38, 38, 0.1), 0 10px 10px -5px rgba(220, 38, 38, 0.04); }
.shadow-wax-2xl { box-shadow: 0 25px 50px -12px rgba(220, 38, 38, 0.25); }
.shadow-wax-inner { box-shadow: inset 0 2px 4px 0 rgba(220, 38, 38, 0.06); }
```

## Component System

### Button Components

#### Primary Button
```tailwind
<button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-wax-red-600 text-white font-semibold rounded-xl shadow-wax-md transition-all duration-300 hover:bg-wax-red-700 hover:-translate-y-0.5 hover:shadow-wax-lg focus:outline-none focus:ring-2 focus:ring-wax-red-500 focus:ring-offset-2">
```

#### Secondary Button
```tailwind
<button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-wax-red-600 font-semibold rounded-xl border-2 border-wax-red-200 shadow-wax-sm transition-all duration-300 hover:border-wax-red-300 hover:bg-wax-red-50 hover:-translate-y-0.5 hover:shadow-wax-md focus:outline-none focus:ring-2 focus:ring-wax-red-500 focus:ring-offset-2">
```

#### Tertiary Button
```tailwind
<button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-wax-gray-600 font-medium rounded-lg transition-all duration-200 hover:text-wax-red-600 hover:bg-wax-red-50 focus:outline-none focus:ring-2 focus:ring-wax-red-500 focus:ring-offset-2">
```

### Form Elements

#### Input Fields
```tailwind
<input className="w-full px-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-white transition-all duration-200 focus:border-wax-red-500 focus:ring-2 focus:ring-wax-red-100 focus:outline-none hover:border-wax-gray-300">
```

#### Labels
```tailwind
<label className="block font-medium text-wax-gray-700 mb-2 text-sm">
```

#### Search Inputs
```tailwind
<div className="relative">
  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-wax-gray-400" />
  <input className="w-full pl-10 pr-4 py-3 border-2 border-wax-gray-200 rounded-xl text-base bg-white transition-all duration-200 focus:border-wax-red-500 focus:ring-2 focus:ring-wax-red-100 focus:outline-none">
</div>
```

### Card Components

#### Standard Card
```tailwind
<div className="bg-white rounded-xl border border-wax-gray-200 shadow-wax-sm transition-all duration-200 hover:shadow-wax-md">
```

#### Interactive Card
```tailwind
<div className="bg-white rounded-xl border border-wax-gray-200 shadow-wax-sm transition-all duration-200 hover:shadow-wax-md hover:-translate-y-0.5 cursor-pointer">
```

#### Selected Card
```tailwind
<div className="bg-wax-red-50 rounded-xl border-2 border-wax-red-300 shadow-wax-md transition-all duration-200">
```

### List Components

#### Flat List Item
```tailwind
<div className="flex items-center justify-between py-3 px-4 border-b border-wax-gray-100 transition-all duration-200 hover:bg-wax-gray-50 cursor-pointer">
  <div className="flex items-center gap-3">
    <div className="w-5 h-5 rounded border-2 border-wax-gray-300 transition-all duration-200 flex items-center justify-center data-[selected=true]:border-wax-red-500 data-[selected=true]:bg-wax-red-500">
      <!-- Checkmark when selected -->
    </div>
    <div className="font-medium text-wax-gray-800">Item Name</div>
  </div>
  <div className="text-wax-gray-500 text-sm flex items-center gap-2">
    <span>Details</span>
  </div>
</div>
```

### Modal Components

#### Modal Container
```tailwind
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
  <div className="bg-white rounded-2xl shadow-wax-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
```

#### Modal Header
```tailwind
<div className="px-6 py-4 border-b border-wax-gray-200 flex items-center justify-between">
  <h3 className="text-xl font-semibold text-wax-gray-800">Modal Title</h3>
  <button className="text-wax-gray-400 hover:text-wax-gray-600 transition-colors">
    <XMarkIcon className="w-6 h-6" />
  </button>
</div>
```

### Collapsible Sections

#### Section Container
```tailwind
<div className="bg-white rounded-xl border border-wax-gray-200 shadow-wax-sm">
  <div className="px-6 py-4 border-b border-wax-gray-100 flex items-center justify-between cursor-pointer transition-all duration-200 hover:bg-wax-gray-50">
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-wax-red-600" />
      <h3 className="text-lg font-semibold text-wax-gray-800">Section Title</h3>
    </div>
    <ChevronDownIcon className="w-5 h-5 text-wax-gray-400 transition-transform duration-200 data-[open=true]:rotate-180" />
  </div>
  <div className="px-6 py-4 data-[open=false]:hidden">
    <!-- Section content -->
  </div>
</div>
```

## Animation System

### Custom Wax Animations
```tailwind
animate-wax-pulse     /* Gentle pulsing effect */
animate-wax-bounce    /* Subtle bounce */
animate-wax-fade-in   /* Smooth fade in */
animate-wax-slide-up  /* Elegant slide up */
```

### Implementation
```css
@keyframes wax-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

@keyframes wax-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@keyframes wax-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes wax-slide-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Micro-interactions
```tailwind
/* Standard hover effects */
hover:-translate-y-0.5 hover:shadow-wax-md

/* Focus states */
focus:ring-2 focus:ring-wax-red-500 focus:ring-offset-2

/* State transitions */
transition-all duration-200 ease-out
```

## Layout System

### Page Container
```tailwind
<div className="min-h-screen bg-wax-elegant">
```

### Content Wrapper
```tailwind
<div className="max-w-7xl mx-auto px-6 py-8">
```

### Grid System
```tailwind
<!-- Two-column layout -->
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

<!-- Three-column layout -->
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- Responsive grid -->
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```

## Status Indicators

### Success State
```tailwind
<div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
  <CheckCircleIcon className="w-4 h-4" />
  Complete
</div>
```

### Warning State
```tailwind
<div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
  <ExclamationTriangleIcon className="w-4 h-4" />
  Warning
</div>
```

### Error State
```tailwind
<div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
  <XCircleIcon className="w-4 h-4" />
  Error
</div>
```

## Toolbar/Header Components

### Action Toolbar
```tailwind
<div className="bg-white border-b border-wax-gray-200 px-6 py-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <!-- Left actions -->
    </div>
    <div className="flex items-center gap-3">
      <!-- Right actions -->
    </div>
  </div>
</div>
```

### Toolbar Button
```tailwind
<button className="inline-flex items-center gap-2 px-4 py-2 text-wax-gray-600 font-medium rounded-lg transition-all duration-200 hover:text-wax-red-600 hover:bg-wax-red-50 focus:outline-none focus:ring-2 focus:ring-wax-red-500 focus:ring-offset-2">
```

## Usage Guidelines

### Do's ✅
- Use consistent wax color palette across all components
- Apply hover effects with subtle translations
- Maintain visual hierarchy with typography scale
- Use semantic colors for states and feedback
- Include focus states for accessibility
- Apply consistent border radius and shadows

### Don'ts ❌
- Don't mix color palettes
- Don't use arbitrary color values
- Don't skip hover states on interactive elements
- Don't use excessive animations
- Don't ignore accessibility requirements
- Don't use inconsistent spacing

## Accessibility

### Color Contrast
- All color combinations meet WCAG AA standards
- Interactive elements have clear focus states
- Status is conveyed through multiple means (color + icon + text)

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Clear focus indicators with `focus:ring-*`
- Logical tab order

### Screen Readers
- Semantic HTML structure
- Descriptive alt text and aria labels
- Proper heading hierarchy

## Implementation Notes

### Tailwind Configuration
Ensure your `tailwind.config.js` includes the custom wax colors, shadows, and animations:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        wax: {
          red: { /* red palette */ },
          white: { /* white palette */ },
          gray: { /* gray palette */ },
          gold: { /* gold palette */ }
        }
      },
      boxShadow: {
        'wax-sm': '0 1px 2px 0 rgba(220, 38, 38, 0.05)',
        // ... other wax shadows
      },
      animation: {
        'wax-pulse': 'wax-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // ... other wax animations
      }
    }
  }
}
```

This design system ensures a cohesive, professional, and elegant user experience that reflects the Waxcenter brand while providing excellent usability and accessibility. 
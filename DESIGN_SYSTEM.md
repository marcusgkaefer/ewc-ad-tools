# Ad Tools Studio - Professional Design System

## Overview

The Ad Tools Studio Design System delivers a sophisticated, professional user experience inspired by European Wax Center's elegant branding. This design system combines refined aesthetics with intuitive functionality, creating campaigns through a delightful, premium workflow that guides users seamlessly from concept to completion.

## Design Philosophy

### Core Principles

1. **Professional Elegance**: Every interface element should exude sophistication and purpose
2. **Contextual Guidance**: Users should feel confident and informed at every step
3. **Responsive Excellence**: Flawless experience across all devices and screen sizes
4. **Performance-First**: Smooth animations and instant loading times
5. **Accessibility**: Inclusive design that works for everyone
6. **Brand Cohesion**: Consistent with premium service industry standards

### Visual Language

- **Refined Glassmorphism**: Subtle transparency with sophisticated depth and premium materials
- **Sophisticated Gradients**: Elegant transitions that enhance without overwhelming
- **Purposeful Micro-interactions**: Smooth animations that provide premium feedback
- **Progressive Disclosure**: Information revealed elegantly when needed
- **Premium Spacing**: Generous whitespace that breathes luxury

## Color Palette

### Primary Colors (EWC-Inspired Burgundy/Wine)
```tailwind
bg-primary-50        /* Light wine/rose backgrounds */
bg-primary-100       /* Subtle burgundy highlights */
bg-primary-200       /* Soft wine accents */
bg-primary-300       /* Interactive elements */
bg-primary-400       /* Hover states */
bg-primary-500       /* Main brand color - Deep burgundy */
bg-primary-600       /* Active states */
bg-primary-700       /* Text on light backgrounds */
bg-primary-800       /* Dark mode elements */
bg-primary-900       /* High contrast text */
```

### Secondary Colors (Elegant Gray Scale)
```tailwind
bg-secondary-50      /* Pure white backgrounds */
bg-secondary-100     /* Soft pearl highlights */
bg-secondary-200     /* Subtle gray accents */
bg-secondary-300     /* Interactive elements */
bg-secondary-400     /* Hover states */
bg-secondary-500     /* Mid-tone gray */
bg-secondary-600     /* Active states */
bg-secondary-700     /* Professional text */
bg-secondary-800     /* Dark elements */
bg-secondary-900     /* High contrast text */
```

### Accent Colors (Professional Support)
```tailwind
bg-accent-50         /* Light champagne backgrounds */
bg-accent-100        /* Gold highlights */
bg-accent-200        /* Warm accents */
bg-accent-300        /* Interactive warmth */
bg-accent-400        /* Hover warmth */
bg-accent-500        /* Warm gold accent */
bg-accent-600        /* Active warmth */
bg-accent-700        /* Text on light backgrounds */
bg-accent-800        /* Dark mode accents */
bg-accent-900        /* High contrast accent */
```

### Semantic Colors
```tailwind
bg-success-500       /* Success states - Refined green */
bg-warning-500       /* Warning states - Elegant amber */
bg-error-500         /* Error states - Sophisticated red */
bg-info-500          /* Information states - Professional blue */
```

### Professional Neutrals
```tailwind
bg-neutral-50        /* Page backgrounds - Pure white */
bg-neutral-100       /* Card backgrounds - Off white */
bg-neutral-200       /* Subtle borders */
bg-neutral-300       /* Disabled states */
bg-neutral-400       /* Placeholder text */
bg-neutral-500       /* Secondary text */
bg-neutral-600       /* Primary text */
bg-neutral-700       /* Headings */
bg-neutral-800       /* High contrast text */
bg-neutral-900       /* Maximum contrast */
```

## Typography

### Font Families
- **Primary**: Inter (modern, clean, highly readable) - `font-sans`
- **Monospace**: JetBrains Mono (code and technical content) - `font-mono`

### Font Weights
- **Light**: `font-light` (Large headings only)
- **Regular**: `font-normal` (Body text)
- **Medium**: `font-medium` (Emphasized text)
- **Semi-bold**: `font-semibold` (Subheadings)
- **Bold**: `font-bold` (Headings)
- **Extra-bold**: `font-extrabold` (Hero titles)

### Type Scale
- **Hero Title**: `text-4xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 bg-clip-text text-transparent`
- **Page Title**: `text-3xl font-extrabold`
- **Section Title**: `text-2xl font-bold`
- **Card Title**: `text-xl font-bold`
- **Subheading**: `text-lg font-semibold`
- **Body**: `text-base font-normal`
- **Caption**: `text-sm font-medium`
- **Small**: `text-xs font-medium`

## Spacing System

### Tailwind Spacing Classes
```tailwind
p-1       /* 4px padding */
p-2       /* 8px padding */
p-4       /* 16px padding */
p-6       /* 24px padding */
p-8       /* 32px padding */
p-12      /* 48px padding */
p-16      /* 64px padding */

m-1       /* 4px margin */
m-2       /* 8px margin */
m-4       /* 16px margin */
m-6       /* 24px margin */
m-8       /* 32px margin */
m-12      /* 48px margin */
m-16      /* 64px margin */

gap-4     /* 16px grid/flex gap */
gap-6     /* 24px grid/flex gap */
gap-8     /* 32px grid/flex gap */
```

### Application
- **Component padding**: `p-4` to `p-6`
- **Section spacing**: `mb-8` to `mb-12`
- **Hero spacing**: `py-12` to `py-16`
- **Grid gaps**: `gap-4` to `gap-6`
- **Element margins**: `mb-1` to `mb-4`

## Border Radius

```tailwind
rounded-md        /* 6px - Small elements */
rounded-lg        /* 8px - Form elements */
rounded-xl        /* 12px - Cards */
rounded-2xl       /* 16px - Large cards */
rounded-3xl       /* 24px - Hero elements */
rounded-full      /* Pills and circles */
```

## Shadows & Elevation

```tailwind
shadow-sm         /* Subtle separation */
shadow-md         /* Form elements */
shadow-lg         /* Interactive cards */
shadow-xl         /* Floating elements */
shadow-2xl        /* Modal overlays */
```

### Usage
- **Floating elements**: `shadow-xl`
- **Interactive cards**: `shadow-lg`
- **Form elements**: `shadow-md`
- **Subtle separation**: `shadow-sm`

## Layout Components

### App Container
```tailwind
<div className="min-h-screen flex flex-col relative overflow-x-hidden">
```

### Main Content
```tailwind
<div className="flex-1 p-6 relative z-10">
```

### Card System
Cards are the primary content containers with glassmorphism effects.

```tailwind
<div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl">
```

## Interactive Components

### Button System

#### Primary Button
```tailwind
<button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
```

#### Secondary Button
```tailwind
<button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 shadow-md transition-all duration-200 hover:border-blue-500 hover:text-blue-600 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
```

#### Button Sizes
- **Small**: `px-3 py-1.5 text-xs h-8 rounded-lg`
- **Regular**: `px-4 py-2 text-sm h-10 rounded-lg`
- **Large**: `px-6 py-3 text-base h-12 rounded-xl`

### Form Elements

#### Input Fields
```tailwind
<input className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-200 bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:-translate-y-0.5 focus:outline-none">
```

#### Labels
```tailwind
<label className="block font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
```

## Progress System

### Progress Container
```tailwind
<div className="bg-white/10 backdrop-blur-xl rounded-full p-4 mb-12 border border-white/20">
```

### Progress Steps
Interactive step indicators with state management:

```tailwind
<!-- Default Step -->
<div className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 bg-white/10 border border-transparent min-w-[120px] justify-center">

<!-- Active Step -->
<div className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 bg-white/20 border border-white/30 transform scale-110 min-w-[120px] justify-center">

<!-- Completed Step -->
<div className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600 text-white border border-green-500 min-w-[120px] justify-center">
```

## Selection Components

### Selection Cards
```tailwind
<!-- Default Selection Card -->
<div className="bg-white border-2 border-gray-200 rounded-2xl p-6 transition-all duration-300 cursor-pointer relative overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:border-blue-400">

<!-- Selected Card -->
<div className="bg-white border-2 border-blue-500 rounded-2xl p-6 transition-all duration-300 cursor-pointer relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 -translate-y-1 shadow-xl">
  <!-- Selection indicator -->
  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
</div>
```

## Animation System

### Micro-interactions
All interactive elements include subtle animations:

```tailwind
<!-- Hover effects -->
hover:-translate-y-1 hover:shadow-lg

<!-- Focus states -->
focus:ring-4 focus:ring-blue-100 focus:border-blue-500

<!-- Loading states -->
animate-pulse

<!-- State changes -->
transition-all duration-200 ease-out
```

### Animation Classes
```tailwind
animate-fade-in       /* Fade in animation */
animate-slide-up      /* Slide up animation */
animate-scale-in      /* Scale in animation */
animate-bounce-gentle /* Gentle bounce */
animate-pulse-slow    /* Slow pulse */
animate-shimmer       /* Shimmer effect */
```

## Grid System

### Responsive Grid
```tailwind
<!-- Basic Grid -->
<div className="grid gap-6">
<div className="grid-cols-1">
<div className="grid-cols-2">
<div className="grid-cols-3">
<div className="grid-cols-4">

<!-- Responsive Grid -->
<div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```

### Responsive Breakpoints
- **Mobile**: Default (no prefix)
- **Tablet**: `md:` (768px+)
- **Desktop**: `lg:` (1024px+)
- **Large Desktop**: `xl:` (1280px+)

## Special Components

### Hero Section
```tailwind
<div className="text-center py-16 px-6 relative overflow-hidden">
  <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 bg-clip-text text-transparent leading-tight tracking-tight drop-shadow-sm">
    Ad Tools Studio
  </h1>
  <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto font-normal">
    Create beautiful, effective ad campaigns with our intuitive tools
  </p>
</div>
```

### Stats Cards
```tailwind
<div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center relative overflow-hidden">
  <!-- Top border indicator -->
  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
  
  <div className="text-4xl font-extrabold text-white mb-2 leading-none">
    1,234
  </div>
  <div className="text-white/80 font-medium text-sm uppercase tracking-wider">
    Total Campaigns
  </div>
</div>
```

### Floating Action Button
```tailwind
<button className="fixed bottom-8 right-8 w-15 h-15 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl flex items-center justify-center z-50">
```

## Usage Guidelines

### Do's ✅
- Use Tailwind spacing classes consistently
- Apply hover effects with `hover:` prefix
- Maintain visual hierarchy with typography classes
- Use semantic color classes for states
- Include loading states with `animate-pulse`
- Provide clear feedback with `focus:` states

### Don'ts ❌
- Don't use arbitrary spacing values
- Don't skip hover states on interactive elements
- Don't use more than 3 font weights per design
- Don't use low contrast color combinations
- Don't animate too many elements simultaneously
- Don't ignore accessibility requirements

## Accessibility

### Color Contrast
- All text meets WCAG AA standards
- Interactive elements have clear focus states using `focus:ring-*`
- Color is not the only way to convey information

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus indicators are clearly visible with `focus:ring-*`
- Tab order is logical and intuitive

### Screen Readers
- Proper semantic HTML structure
- Descriptive alt text for images
- Aria labels for complex interactions

## Performance Considerations

### Tailwind Optimization
- Use Tailwind's purge/content configuration to remove unused styles
- Minimize redundant classes
- Use efficient selectors
- Leverage Tailwind's built-in responsive design

### Bundle Size
- Tree-shake unused Tailwind utilities automatically
- Use component classes for repeated patterns
- Optimize for production builds

## Browser Support

### Modern Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Graceful Degradation
- Backdrop-filter fallbacks with `bg-white/95`
- Animation-friendly with `motion-reduce:` prefix
- Progressive enhancement approach

## Maintenance

### Adding New Components
1. Follow established Tailwind patterns
2. Use consistent spacing and color classes
3. Include hover and focus states
4. Test across different screen sizes
5. Update documentation

### Updating Colors
1. Modify Tailwind config colors
2. Test contrast ratios
3. Update all variants
4. Verify responsive design

## Enhanced Workflow Features

### Compact Location Selection

The location selection interface uses Tailwind for maximum efficiency:

#### Flat List Design
```tailwind
<div className="flex items-center justify-between py-2 px-4 cursor-pointer transition-all duration-200 text-sm hover:bg-blue-50">
  <div className="flex items-center gap-2 flex-1">
    <div className="w-4 h-4 rounded border-2 border-gray-300 transition-all duration-200 flex items-center justify-center data-[selected=true]:border-blue-500 data-[selected=true]:bg-blue-500">
      <!-- Checkmark when selected -->
    </div>
    <div className="font-medium text-gray-800">Location Name</div>
  </div>
  <div className="text-gray-600 text-xs flex items-center gap-2">
    <span>City, State</span>
    <span className="text-gray-400">•</span>
    <span>ZIP</span>
  </div>
</div>
```

#### Exclusion Mode
```tailwind
<label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
  <input type="checkbox" className="w-4 h-4 accent-blue-500" />
  Use exclusion mode (select locations to exclude instead)
</label>
```

#### Bulk Operations
```tailwind
<div className="flex gap-4 flex-wrap">
  <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 shadow-md transition-all duration-200 hover:border-blue-500 hover:text-blue-600 text-sm">
    <CheckCircleIcon className="w-4 h-4" />
    Select All
  </button>
  <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 shadow-md transition-all duration-200 hover:border-red-500 hover:text-red-600 text-sm">
    <XMarkIcon className="w-4 h-4" />
    Clear All
  </button>
</div>
```

### Multiple Ad Configuration

Each campaign supports multiple ad variations:

#### Ad Management Interface
```tailwind
<div className="bg-white/70 border-2 border-gray-200 rounded-2xl p-6 mb-6 transition-all duration-200 hover:shadow-lg">
  <div className="flex justify-between items-start mb-6">
    <h3 className="text-xl font-semibold text-gray-800">Ad Name</h3>
    <button className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-white text-gray-700 rounded-lg border border-gray-200 hover:border-red-500 hover:text-red-600 transition-all duration-200">
      <TrashIcon className="w-4 h-4" />
    </button>
  </div>
  <!-- Ad configuration fields -->
</div>
```

#### Template Preview
```tailwind
<div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
  <div className="text-sm font-semibold text-gray-700 mb-2">Preview:</div>
  <div className="text-sm space-y-1">
    <div><strong>Headline:</strong> Template Headline</div>
    <div><strong>Description:</strong> Template Description</div>
    <div><strong>CTA:</strong> Call to Action</div>
  </div>
</div>
```

### Enhanced Statistics

Live dashboard metrics with Tailwind styling:

#### Stats Grid
```tailwind
<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-12">
  <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center relative overflow-hidden animate-scale-in">
    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
    <MapPinIcon className="w-8 h-8 text-white/80 mx-auto mb-2" />
    <div className="text-4xl font-extrabold text-white mb-1 leading-none">1,234</div>
    <div className="text-white/80 font-medium text-sm uppercase tracking-wider">Locations</div>
  </div>
</div>
```

## Enhanced Professional Components

### Refined Glassmorphism Cards
```tailwind
<div className="bg-white/90 backdrop-blur-2xl border border-white/30 rounded-3xl p-8 shadow-2xl shadow-black/5 transition-all duration-300 hover:shadow-3xl hover:bg-white/95">
```

### Professional Gradient Backgrounds
```tailwind
/* Main background - Sophisticated wine gradient */
bg-gradient-to-br from-primary-50 via-white to-accent-50

/* Premium overlays */
bg-gradient-to-r from-primary-500/90 to-primary-600/90
```

### Elevated Button System

#### Primary Button (EWC Style)
```tailwind
<button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-2xl shadow-lg shadow-primary-500/25 transition-all duration-300 hover:from-primary-600 hover:to-primary-700 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
```

#### Secondary Button (Professional)
```tailwind
<button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/90 backdrop-blur-xl text-primary-700 font-semibold rounded-xl border border-primary-200 shadow-lg shadow-black/5 transition-all duration-300 hover:bg-white hover:border-primary-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
```

### Premium Form Elements

#### Professional Input Fields
```tailwind
<input className="w-full px-6 py-4 border-2 border-neutral-200 rounded-2xl text-base bg-white/90 backdrop-blur-xl transition-all duration-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:-translate-y-0.5 focus:outline-none hover:bg-white">
```

#### Elegant Labels
```tailwind
<label className="block font-semibold text-neutral-700 mb-3 text-sm uppercase tracking-wide">
```

## Professional Animation System

### Sophisticated Micro-interactions
All interactive elements include refined animations:

```tailwind
/* Premium hover effects */
hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/20

/* Professional focus states */
focus:ring-4 focus:ring-primary-100 focus:border-primary-500

/* Elegant loading states */
animate-pulse-slow

/* Smooth state changes */
transition-all duration-300 ease-out
```

### Professional Animation Classes
```tailwind
animate-fade-in-elegant    /* Smooth fade in */
animate-slide-up-premium   /* Elegant slide up */
animate-scale-in-smooth    /* Refined scale in */
animate-glow-gentle        /* Subtle glow effect */
animate-float-soft         /* Gentle floating */
```

This design system ensures consistency, maintainability, and an award-winning user experience across the entire Ad Tools Studio application using Tailwind CSS. 
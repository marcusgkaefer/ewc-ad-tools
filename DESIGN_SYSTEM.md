# Campaign Creator Studio - Design System

## Overview

The Campaign Creator Studio Design System is built to deliver an award-winning user experience that combines cutting-edge aesthetics with intuitive functionality. This design system focuses on creating campaigns through a delightful, interactive workflow that guides users seamlessly from concept to completion.

## Design Philosophy

### Core Principles

1. **Intuitive Elegance**: Every interface element should be both beautiful and purposeful
2. **Contextual Guidance**: Users should never feel lost or confused about next steps
3. **Responsive Excellence**: The experience should be flawless across all devices and screen sizes
4. **Performance-First**: Smooth animations and fast loading times are non-negotiable
5. **Accessibility**: Inclusive design that works for everyone

### Visual Language

- **Modern Glassmorphism**: Clean, transparent surfaces with subtle depth
- **Dynamic Gradients**: Animated backgrounds that create visual interest
- **Micro-interactions**: Delightful animations that provide feedback
- **Progressive Disclosure**: Information revealed when needed, not all at once
- **Smart Spacing**: Consistent rhythm and breathing room throughout

## Color Palette

### Primary Colors
```css
--primary-50: #f0f9ff    /* Light blue backgrounds */
--primary-100: #e0f2fe   /* Subtle highlights */
--primary-200: #bae6fd   /* Soft accents */
--primary-300: #7dd3fc   /* Interactive elements */
--primary-400: #38bdf8   /* Hover states */
--primary-500: #0ea5e9   /* Main brand color */
--primary-600: #0284c7   /* Active states */
--primary-700: #0369a1   /* Text on light backgrounds */
--primary-800: #075985   /* Dark mode elements */
--primary-900: #0c4a6e   /* High contrast text */
```

### Secondary Colors
```css
--secondary-50: #fdf4ff   /* Light purple backgrounds */
--secondary-100: #fae8ff  /* Subtle highlights */
--secondary-200: #f5d0fe  /* Soft accents */
--secondary-300: #f0abfc  /* Interactive elements */
--secondary-400: #e879f9  /* Hover states */
--secondary-500: #d946ef  /* Accent brand color */
--secondary-600: #c026d3  /* Active states */
--secondary-700: #a21caf  /* Text on light backgrounds */
--secondary-800: #86198f  /* Dark mode elements */
--secondary-900: #701a75  /* High contrast text */
```

### Semantic Colors
```css
--success-500: #10b981   /* Success states */
--warning-500: #f59e0b   /* Warning states */
--error-500: #ef4444     /* Error states */
--info-500: #3b82f6      /* Information states */
```

### Neutral Colors
```css
--gray-50: #f9fafb       /* Page backgrounds */
--gray-100: #f3f4f6      /* Card backgrounds */
--gray-200: #e5e7eb      /* Borders */
--gray-300: #d1d5db      /* Disabled states */
--gray-400: #9ca3af      /* Placeholder text */
--gray-500: #6b7280      /* Secondary text */
--gray-600: #4b5563      /* Primary text */
--gray-700: #374151      /* Headings */
--gray-800: #1f2937      /* High contrast text */
--gray-900: #111827      /* Maximum contrast */
```

## Typography

### Font Families
- **Primary**: Inter (modern, clean, highly readable)
- **Monospace**: JetBrains Mono (code and technical content)

### Font Weights
- **Light**: 300 (Large headings only)
- **Regular**: 400 (Body text)
- **Medium**: 500 (Emphasized text)
- **Semi-bold**: 600 (Subheadings)
- **Bold**: 700 (Headings)
- **Extra-bold**: 800 (Hero titles)

### Type Scale
- **Hero Title**: clamp(2rem, 5vw, 4rem) - Bold, animated gradient
- **Page Title**: 2rem - Extra bold
- **Section Title**: 1.5rem - Bold
- **Card Title**: 1.25rem - Bold
- **Subheading**: 1.125rem - Semi-bold
- **Body**: 1rem - Regular
- **Caption**: 0.875rem - Medium
- **Small**: 0.75rem - Medium

## Spacing System

### Scale
```css
--space-xs: 0.25rem     /* 4px */
--space-sm: 0.5rem      /* 8px */
--space-md: 1rem        /* 16px */
--space-lg: 1.5rem      /* 24px */
--space-xl: 2rem        /* 32px */
--space-2xl: 3rem       /* 48px */
--space-3xl: 4rem       /* 64px */
```

### Application
- **Component padding**: md to lg
- **Section spacing**: xl to 2xl
- **Hero spacing**: 2xl to 3xl
- **Grid gaps**: md to lg
- **Element margins**: xs to md

## Border Radius

```css
--radius-sm: 0.375rem    /* 6px - Small elements */
--radius-md: 0.5rem      /* 8px - Form elements */
--radius-lg: 0.75rem     /* 12px - Cards */
--radius-xl: 1rem        /* 16px - Large cards */
--radius-2xl: 1.5rem     /* 24px - Hero elements */
--radius-full: 9999px    /* Pills and circles */
```

## Shadows & Elevation

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
--shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25)
```

### Usage
- **Floating elements**: shadow-xl
- **Interactive cards**: shadow-lg
- **Form elements**: shadow-md
- **Subtle separation**: shadow-sm

## Layout Components

### App Container
```css
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
}
```

### Main Content
```css
.main-content {
  flex: 1;
  padding: var(--space-lg);
  position: relative;
  z-index: 1;
}
```

### Card System
Cards are the primary content containers with glassmorphism effects.

```css
.card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  box-shadow: var(--shadow-xl);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Interactive Components

### Button System

#### Primary Button
```css
.btn-primary {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: white;
  box-shadow: var(--shadow-lg);
  padding: var(--space-md) var(--space-xl);
  border-radius: var(--radius-lg);
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}
```

#### Button Sizes
- **Small**: `btn-sm` - Compact actions
- **Regular**: Default size
- **Large**: `btn-lg` - Primary actions

### Form Elements

#### Input Fields
```css
.form-input {
  width: 100%;
  padding: var(--space-md) var(--space-lg);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
}

.form-input:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  transform: translateY(-1px);
}
```

#### Labels
```css
.form-label {
  display: block;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: var(--space-sm);
  font-size: 0.875rem;
  letter-spacing: 0.025em;
  text-transform: uppercase;
}
```

## Progress System

### Progress Container
```css
.progress-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-full);
  padding: var(--space-md);
  margin-bottom: var(--space-2xl);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

### Progress Steps
Interactive step indicators with state management:
- **Default**: Inactive step
- **Active**: Current step with scale transform
- **Completed**: Finished step with success color

## Selection Components

### Selection Cards
```css
.selection-card {
  background: white;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.selection-card.selected {
  border-color: var(--primary-500);
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.05), rgba(217, 70, 239, 0.05));
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}
```

## Animation System

### Micro-interactions
All interactive elements include subtle animations:
- **Hover effects**: Transform and shadow changes
- **Focus states**: Border color and glow effects
- **Loading states**: Smooth transitions and skeleton screens
- **State changes**: Scale and color transitions

### Page Transitions
```css
/* Fade in animation */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* Slide up animation */
.animate-slide-up {
  animation: slideUp 0.6s ease-out;
}

/* Scale in animation */
.animate-scale-in {
  animation: scaleIn 0.4s ease-out;
}
```

### Framer Motion Variants
```javascript
const cardVariants = {
  hidden: { opacity: 0, rotateY: -15 },
  visible: { opacity: 1, rotateY: 0, transition: { duration: 0.6, ease: "easeOut" } },
  exit: { opacity: 0, rotateY: 15, transition: { duration: 0.4 } }
};
```

## Grid System

### Responsive Grid
```css
.grid {
  display: grid;
  gap: var(--space-lg);
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
```

### Breakpoints
```css
@media (max-width: 768px) {
  .grid-cols-2, .grid-cols-3, .grid-cols-4 {
    grid-template-columns: 1fr;
  }
}
```

## Special Components

### Hero Section
```css
.hero {
  text-align: center;
  padding: var(--space-3xl) var(--space-lg);
  position: relative;
  overflow: hidden;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-600), var(--secondary-600), var(--primary-500));
  background-size: 200% 200%;
  animation: textGradient 3s ease infinite;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

### Stats Cards
```css
.stat-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  text-align: center;
}
```

### Floating Action Button
```css
.fab {
  position: fixed;
  bottom: var(--space-xl);
  right: var(--space-xl);
  width: 60px;
  height: 60px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary-500), var(--secondary-500));
  color: white;
  box-shadow: var(--shadow-2xl);
  transition: all 0.3s ease;
}
```

## Usage Guidelines

### Do's ✅
- Use consistent spacing from the scale
- Apply hover effects to interactive elements
- Maintain visual hierarchy with typography
- Use semantic colors for states
- Include loading states for async operations
- Provide clear feedback for user actions

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
- Interactive elements have clear focus states
- Color is not the only way to convey information

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus indicators are clearly visible
- Tab order is logical and intuitive

### Screen Readers
- Proper semantic HTML structure
- Descriptive alt text for images
- Aria labels for complex interactions

## Performance Considerations

### CSS Optimization
- Use CSS custom properties for consistency
- Minimize expensive operations (box-shadow, backdrop-filter)
- Use transform and opacity for animations
- Implement proper z-index management

### Bundle Size
- Tree-shake unused CSS
- Minimize redundant styles
- Use efficient selectors

## Browser Support

### Modern Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Graceful Degradation
- Backdrop-filter fallbacks
- Animation-friendly reduced motion
- Progressive enhancement approach

## Maintenance

### Adding New Components
1. Follow established patterns
2. Use design tokens (CSS custom properties)
3. Include hover and focus states
4. Test across different screen sizes
5. Update documentation

### Updating Colors
1. Modify CSS custom properties
2. Test contrast ratios
3. Update all variants
4. Verify dark mode compatibility

## Enhanced Workflow Features

### Compact Location Selection

The location selection interface has been redesigned for maximum efficiency:

#### Flat List Design
```css
.compact-location-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.compact-location-item:hover {
  background-color: rgba(14, 165, 233, 0.05);
}

.compact-location-item.selected {
  background-color: rgba(14, 165, 233, 0.1);
}
```

#### Exclusion Mode
- Toggle between "select what you want" and "exclude what you don't want"
- Particularly useful when most locations should be included
- Visual indicators show inclusion/exclusion status
- Bulk operations respect the current mode

#### Bulk Operations
- **Select All / Include All**: Choose all visible locations
- **Clear All / Exclude All**: Deselect all visible locations  
- **Random Selection**: Quick testing with random subset
- **Search Integration**: Bulk operations work with filtered results

### Multiple Ad Configuration

Each campaign now supports multiple ad variations with separate file generation:

#### Ad Management Interface
- Default 4 ads per campaign (industry standard)
- Add/remove ads dynamically
- Individual template selection per ad
- Live template preview for each ad
- Custom naming for better organization

#### File Generation Strategy
- One Excel file per ad variation
- Dynamic file naming: `Prefix_Date_AdName_campaigns.xlsx`
- Each file contains all selected locations
- Complete 73-column Facebook/Meta format
- Parallel generation for efficiency

#### Template Preview
Real-time preview showing:
- Headline text
- Description content
- Call-to-action button
- Variable substitution examples

### Enhanced Statistics

The dashboard now displays comprehensive campaign metrics:

#### Live Calculations
- **Locations**: Total targeted locations
- **Ads**: Number of ad variations configured
- **Campaigns**: Total campaigns (Locations × Ads)
- **Files**: Number of Excel files to be generated

#### Dynamic Updates
- Real-time recalculation as selections change
- Exclusion mode calculations
- Budget projections per campaign
- File size estimations

This design system ensures consistency, maintainability, and an award-winning user experience across the entire Campaign Creator Studio application. 
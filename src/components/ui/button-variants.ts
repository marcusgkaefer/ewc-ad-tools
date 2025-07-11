import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md',
        secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:ring-secondary-500',
        success: 'bg-success-600 text-white hover:bg-success-700 focus:ring-success-500 shadow-sm hover:shadow-md',
        danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500 shadow-sm hover:shadow-md',
        warning: 'bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500 shadow-sm hover:shadow-md',
        ghost: 'text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500',
        outline: 'border border-secondary-300 text-secondary-700 hover:bg-secondary-50 focus:ring-secondary-500',
        gradient: 'bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-700 hover:to-purple-700 shadow-sm hover:shadow-md',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs h-8',
        default: 'px-4 py-2 text-sm h-10',
        lg: 'px-6 py-3 text-base h-12',
        xl: 'px-8 py-4 text-lg h-14',
      },
      animation: {
        none: '',
        bounce: 'hover:animate-bounce-gentle',
        scale: 'hover:scale-105 active:scale-95',
        glow: 'hover:animate-glow',
        shimmer: 'before:absolute before:inset-0 before:bg-shimmer before:animate-shimmer',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      animation: 'scale',
    },
  }
); 
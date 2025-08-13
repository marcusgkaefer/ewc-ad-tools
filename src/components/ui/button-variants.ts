import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden',
  {
    variants: {
      variant: {
        primary:
          'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md',
        secondary:
          'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
        success:
          'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow-md',
        danger:
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md',
        warning:
          'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 shadow-sm hover:shadow-md',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        outline:
          'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
        gradient:
          'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-sm hover:shadow-md',
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
        shimmer:
          'before:absolute before:inset-0 before:bg-shimmer before:animate-shimmer',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      animation: 'scale',
    },
  }
);

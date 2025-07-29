import React, { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/solid';

export interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Choose an option...',
  disabled = false,
  className = '',
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && optionsRef.current) {
      const optionElements = optionsRef.current.children;
      const highlightedOption = optionElements[highlightedIndex] as HTMLElement;
      if (highlightedOption) {
        highlightedOption.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (event: KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          const selectedOption = options[highlightedIndex];
          if (!selectedOption.disabled) {
            onChange(selectedOption.value);
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => {
            const nextIndex = prev < options.length - 1 ? prev + 1 : 0;
            return options[nextIndex].disabled ? nextIndex + 1 : nextIndex;
          });
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : options.length - 1;
            return options[nextIndex].disabled ? nextIndex - 1 : nextIndex;
          });
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleOptionClick = (option: Option) => {
    if (!option.disabled) {
      onChange(option.value);
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {label && (
        <label className="block font-semibold text-neutral-700 mb-3 text-sm uppercase tracking-wide">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={`w-full px-6 py-4 text-left border-2 rounded-2xl text-base bg-white/90 backdrop-blur-xl font-medium transition-all duration-300 focus:outline-none ${
            disabled
              ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed border-neutral-200'
              : error
              ? 'border-error-500 focus:border-error-600 focus:ring-4 focus:ring-error-100'
              : isOpen 
              ? 'border-primary-500 shadow-lg' 
              : 'border-neutral-200 hover:border-primary-300 hover:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-100'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={selectedOption ? 'text-neutral-800' : 'text-neutral-400'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDownIcon className="w-5 h-5 text-neutral-500" />
            </motion.div>
          </div>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 z-50 mt-2 bg-white/95 backdrop-blur-xl border-2 border-primary-500 rounded-2xl shadow-elegant max-h-60 overflow-y-auto"
              ref={optionsRef}
            >
              {options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full px-6 py-3 text-left text-base transition-all duration-200 first:rounded-t-2xl last:rounded-b-2xl border-none ${
                    option.disabled
                      ? 'text-neutral-300 cursor-not-allowed bg-neutral-50'
                      : highlightedIndex === index
                      ? 'bg-primary-50 text-primary-700'
                      : option.value === value
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-transparent text-neutral-700 hover:bg-primary-50'
                  } ${
                    !option.disabled ? 'hover:bg-primary-50' : ''
                  }`}
                  onClick={() => handleOptionClick(option)}
                  onMouseEnter={() => !option.disabled && setHighlightedIndex(index)}
                  disabled={option.disabled}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.label}</span>
                    {option.value === value && (
                      <CheckIcon className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-error-600"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Select; 
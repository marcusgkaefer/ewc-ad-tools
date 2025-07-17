import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  label,
  disabled = false,
  className = ""
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
      const highlightedElement = optionsRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => {
            const nextIndex = prev < options.length - 1 ? prev + 1 : prev;
            return options[nextIndex]?.disabled ? nextIndex : nextIndex;
          });
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : prev;
            return options[nextIndex]?.disabled ? nextIndex : nextIndex;
          });
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (highlightedIndex >= 0 && !options[highlightedIndex]?.disabled) {
          handleOptionClick(options[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleOptionClick = (option: SelectOption) => {
    if (!option.disabled) {
      onChange(option.value);
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
          {label}
        </label>
      )}
      <div
        ref={selectRef}
        className="relative w-full"
      >
        <div
          className={`flex items-center justify-between px-4 py-3 transition-all duration-200 text-base min-h-[48px] rounded-lg border-2 cursor-pointer focus:outline-none ${
            disabled 
              ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60' 
              : `bg-white border-gray-300 hover:border-gray-400 ${
                  isOpen ? 'border-blue-500 shadow-lg' : ''
                }`
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
        >
          <span className={`overflow-hidden text-ellipsis whitespace-nowrap ${
            selectedOption ? 'text-gray-800 font-medium' : 'text-gray-500 font-normal'
          }`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDownIcon
            className={`w-5 h-5 text-gray-500 flex-shrink-0 ml-2 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </div>

        {isOpen && (
          <div
            ref={optionsRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-white backdrop-blur-lg border-2 border-blue-500 rounded-lg shadow-2xl max-h-60 overflow-y-auto animate-dropdownSlide"
          >
            {options.map((option, index) => (
              <div
                key={option.value}
                className={`flex items-center justify-between px-4 py-3 transition-all duration-150 border-b border-gray-100 last:border-b-0 ${
                  option.disabled 
                    ? 'cursor-not-allowed opacity-50' 
                    : 'cursor-pointer'
                } ${
                  highlightedIndex === index ? 'bg-blue-50' :
                  option.value === value ? 'bg-blue-100' : 'bg-transparent'
                } ${
                  !option.disabled ? 'hover:bg-blue-50' : ''
                }`}
                onClick={() => handleOptionClick(option)}
                onMouseEnter={() => !option.disabled && setHighlightedIndex(index)}
              >
                <span className={`overflow-hidden text-ellipsis whitespace-nowrap ${
                  option.disabled ? 'text-gray-400' : 'text-gray-800'
                } ${
                  option.value === value ? 'font-semibold' : 'font-normal'
                }`}>
                  {option.label}
                </span>
                {option.value === value && (
                  <CheckIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Select; 
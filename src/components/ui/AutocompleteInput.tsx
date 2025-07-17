import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, CheckIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import type { AutocompleteInputProps, ObjectiveOption } from '../../types';

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select or type an option...",
  allowCustom = true,
  customLabel = "Add custom:",
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add custom option if search term doesn't match any existing option
  const showCustomOption = allowCustom && searchTerm && 
    !filteredOptions.some(option => option.value.toLowerCase() === searchTerm.toLowerCase());

  const allOptions = showCustomOption 
    ? [...filteredOptions, { 
        id: 'custom', 
        label: `${customLabel} "${searchTerm}"`, 
        value: searchTerm, 
        isCustom: true 
      }]
    : filteredOptions;

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    if (!isOpen) setIsOpen(true);
    setHighlightedIndex(-1);
  };

  // Handle option selection
  const handleOptionSelect = (option: ObjectiveOption) => {
    onChange(option.value);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < allOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && allOptions[highlightedIndex]) {
          handleOptionSelect(allOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-scroll highlighted option into view
  useEffect(() => {
    if (listRef.current && highlightedIndex >= 0) {
      const highlightedElement = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative" ref={inputRef}>
        <div className="relative">
          <motion.input
            type="text"
            value={searchTerm || value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className={`w-full pl-12 pr-12 py-3 bg-white border-2 rounded-lg text-base text-gray-700 transition-all duration-200 focus:outline-none min-h-[48px] ${
              isOpen ? 'border-blue-500 shadow-lg' : 'border-gray-300'
            }`}
            whileFocus={{
              borderColor: '#3b82f6',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
            }}
          />
          
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>

          <motion.div 
            className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-10"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          </motion.div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 z-50 mt-1 bg-white backdrop-blur-lg border-2 border-blue-500 rounded-lg shadow-2xl max-h-60 overflow-hidden"
            >
              <ul
                ref={listRef}
                className="max-h-60 overflow-y-auto py-1"
              >
              {allOptions.length === 0 ? (
                <li className="px-6 py-4 text-gray-500 text-center text-sm">
                  No options found
                </li>
              ) : (
                allOptions.map((option, index) => (
                  <li key={option.id} className="m-0">
                    <motion.button
                      type="button"
                      onClick={() => handleOptionSelect(option)}
                      className={`w-full px-4 py-3 text-left border-none rounded-md text-sm cursor-pointer transition-all duration-200 flex items-center justify-between ${
                        highlightedIndex === index 
                          ? option.isCustom 
                            ? 'bg-purple-50'
                            : 'bg-blue-50'
                          : 'bg-transparent'
                      } ${
                        option.isCustom ? 'text-purple-700' : 'text-gray-700'
                      }`}
                      whileHover={{
                        backgroundColor: option.isCustom 
                          ? '#f3e8ff'
                          : '#dbeafe',
                        scale: 1.02
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        {option.isCustom ? (
                          <PlusIcon className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 flex-shrink-0" />
                        )}
                        
                        <span className="flex-1 truncate">
                          {option.label}
                        </span>
                      </div>
                      
                      {option.value === value && !option.isCustom && (
                        <CheckIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </motion.button>
                  </li>
                ))
              )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AutocompleteInput; 
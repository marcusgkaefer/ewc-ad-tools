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
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
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
        if (highlightedIndex >= 0 && highlightedIndex < allOptions.length) {
          handleOptionSelect(allOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted option into view
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
    <div className="form-group">
      {label && (
        <label className="form-label" style={{ marginBottom: 'var(--space-sm)' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }} ref={inputRef}>
        <div style={{ position: 'relative' }}>
          <motion.input
            type="text"
            value={searchTerm || value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: 'var(--space-md) var(--space-xl) var(--space-md) var(--space-xl)',
              background: 'white',
              border: `2px solid ${isOpen ? 'var(--primary-500)' : 'var(--gray-300)'}`,
              borderRadius: 'var(--radius-lg)',
              fontSize: '1rem',
              color: 'var(--gray-700)',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxShadow: isOpen ? 'var(--shadow-lg)' : 'none',
              minHeight: '48px'
            }}
            whileFocus={{
              borderColor: 'var(--primary-500)',
              boxShadow: 'var(--shadow-lg)'
            }}
          />
          
          <div style={{
            position: 'absolute',
            left: 'var(--space-md)',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            zIndex: 1
          }}>
            <MagnifyingGlassIcon style={{ 
              width: '20px', 
              height: '20px', 
              color: 'var(--gray-400)' 
            }} />
          </div>

          <motion.button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              position: 'absolute',
              right: 'var(--space-md)',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--gray-400)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-xs)',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.2s ease',
              zIndex: 1
            }}
            whileHover={{ 
              color: 'var(--gray-600)',
              backgroundColor: 'var(--gray-100)'
            }}
            whileTap={{ scale: 0.95 }}
            animate={{ rotate: isOpen ? 180 : 0 }}
          >
            <ChevronDownIcon style={{ width: '20px', height: '20px' }} />
          </motion.button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              style={{
                position: 'absolute',
                zIndex: 50,
                width: '100%',
                marginTop: 'var(--space-sm)',
                background: 'white',
                backdropFilter: 'blur(20px)',
                border: '2px solid var(--primary-500)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
              boxShadow: 'var(--shadow-2xl)'
            }}
          >
            <ul 
              ref={listRef} 
              style={{ 
                maxHeight: '240px', 
                overflowY: 'auto',
                margin: 0,
                padding: 'var(--space-sm)',
                listStyle: 'none'
              }}
            >
              {allOptions.length === 0 ? (
                <li style={{ 
                  padding: 'var(--space-lg)', 
                  color: 'var(--gray-500)', 
                  textAlign: 'center',
                  fontSize: '0.875rem'
                }}>
                  No options found
                </li>
              ) : (
                allOptions.map((option, index) => (
                  <li key={option.id} style={{ margin: 0 }}>
                    <motion.button
                      type="button"
                      onClick={() => handleOptionSelect(option)}
                      style={{
                        width: '100%',
                        padding: 'var(--space-md)',
                        textAlign: 'left',
                        background: highlightedIndex === index 
                          ? option.isCustom 
                            ? 'var(--secondary-50)'
                            : 'var(--primary-50)'
                          : 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        color: option.isCustom ? 'var(--secondary-700)' : 'var(--gray-700)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                      whileHover={{
                        backgroundColor: option.isCustom 
                          ? 'var(--secondary-100)'
                          : 'var(--primary-100)',
                        scale: 1.02
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 'var(--space-sm)' 
                      }}>
                        {option.isCustom && (
                          <div style={{
                            width: '24px',
                            height: '24px',
                            background: 'var(--secondary-100)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <PlusIcon style={{ 
                              width: '14px', 
                              height: '14px', 
                              color: 'var(--secondary-600)' 
                            }} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 500 }}>
                            {option.isCustom ? 'Create Custom:' : option.label}
                          </div>
                          {option.isCustom && (
                            <div style={{ 
                              fontSize: '0.75rem', 
                              color: 'var(--secondary-600)',
                              fontWeight: 600
                            }}>
                              "{searchTerm}"
                            </div>
                          )}
                        </div>
                      </div>
                      {value === option.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          style={{
                            width: '20px',
                            height: '20px',
                            background: 'var(--success-500)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <CheckIcon style={{ 
                            width: '12px', 
                            height: '12px', 
                            color: 'white' 
                          }} />
                        </motion.div>
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
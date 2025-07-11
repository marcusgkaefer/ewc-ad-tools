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
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          const selectedOption = options[highlightedIndex];
          if (selectedOption && !selectedOption.disabled) {
            onChange(selectedOption.value);
            setIsOpen(false);
            setHighlightedIndex(-1);
          }
        } else {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => {
            const nextIndex = prev + 1;
            return nextIndex < options.length ? nextIndex : 0;
          });
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => {
            const prevIndex = prev - 1;
            return prevIndex >= 0 ? prevIndex : options.length - 1;
          });
        }
        break;
    }
  };

  const handleOptionClick = (option: SelectOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label" style={{ marginBottom: 'var(--space-sm)' }}>
          {label}
        </label>
      )}
      <div
        ref={selectRef}
        className="select-container"
        style={{
          position: 'relative',
          width: '100%'
        }}
      >
        <div
          className="select-trigger"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-md)',
            background: disabled ? 'var(--gray-50)' : 'white',
            border: `2px solid ${isOpen ? 'var(--primary-500)' : 'var(--gray-300)'}`,
            borderRadius: 'var(--radius-lg)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '1rem',
            minHeight: '48px',
            boxShadow: isOpen ? 'var(--shadow-lg)' : 'none',
            outline: 'none',
            opacity: disabled ? 0.6 : 1
          }}
        >
          <span style={{
            color: selectedOption ? 'var(--gray-800)' : 'var(--gray-500)',
            fontWeight: selectedOption ? 500 : 400,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDownIcon
            style={{
              width: '20px',
              height: '20px',
              color: 'var(--gray-500)',
              transition: 'transform 0.2s ease',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              flexShrink: 0,
              marginLeft: 'var(--space-sm)'
            }}
          />
        </div>

        {isOpen && (
          <div
            ref={optionsRef}
            className="select-dropdown"
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              background: 'white',
              border: '2px solid var(--primary-500)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-2xl)',
              marginTop: '4px',
              maxHeight: '300px',
              overflowY: 'auto',
              animation: 'dropdownSlide 0.15s ease-out',
              backdropFilter: 'blur(10px)'
            }}
          >
            {options.map((option, index) => (
              <div
                key={option.value}
                className="select-option"
                onClick={() => handleOptionClick(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-md)',
                  cursor: option.disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  backgroundColor: 
                    highlightedIndex === index ? 'var(--primary-50)' :
                    option.value === value ? 'var(--primary-100)' : 'transparent',
                  color: option.disabled ? 'var(--gray-400)' : 'var(--gray-800)',
                  fontWeight: option.value === value ? 600 : 400,
                  borderBottom: index < options.length - 1 ? '1px solid var(--gray-100)' : 'none',
                  opacity: option.disabled ? 0.5 : 1
                }}
              >
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {option.label}
                </span>
                {option.value === value && (
                  <CheckIcon
                    style={{
                      width: '16px',
                      height: '16px',
                      color: 'var(--primary-500)',
                      flexShrink: 0,
                      marginLeft: 'var(--space-sm)'
                    }}
                  />
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
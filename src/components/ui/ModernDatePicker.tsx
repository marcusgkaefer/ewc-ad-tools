import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ModernDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

const ModernDatePicker: React.FC<ModernDatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select a date",
  className = '',
  label,
  disabled = false,
  minDate,
  maxDate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(value.getFullYear(), value.getMonth()));
  const [selectedDate, setSelectedDate] = useState(value);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDate = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!isDateDisabled(newDate)) {
      setSelectedDate(newDate);
      onChange(newDate);
      setIsOpen(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const navigateToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth()));
    setSelectedDate(today);
    onChange(today);
    setIsOpen(false);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div key={`empty-${i}`} style={{ padding: 'var(--space-sm)' }} />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = isSameDate(date, selectedDate);
      const isHovered = hoveredDate && isSameDate(date, hoveredDate);
      const isTodayDate = isToday(date);
      const disabled = isDateDisabled(date);

      days.push(
        <motion.button
          key={day}
          onClick={() => !disabled && handleDateSelect(day)}
          onMouseEnter={() => !disabled && setHoveredDate(date)}
          onMouseLeave={() => setHoveredDate(null)}
          disabled={disabled}
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            fontSize: '0.875rem',
            fontWeight: isSelected ? 600 : 500,
            cursor: disabled ? 'not-allowed' : 'pointer',
            background: isSelected 
              ? 'var(--primary-500)' 
              : isHovered
                ? 'var(--primary-100)'
                : isTodayDate
                  ? 'var(--secondary-100)'
                  : 'transparent',
            color: isSelected
              ? 'white'
              : disabled
                ? 'var(--gray-300)'
                : isTodayDate
                  ? 'var(--secondary-700)'
                  : 'var(--gray-700)',
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden'
          }}
          whileHover={!disabled ? { scale: 1.1 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          initial={false}
          animate={{
            backgroundColor: isSelected 
              ? 'var(--primary-500)' 
              : isHovered
                ? 'var(--primary-100)'
                : isTodayDate
                  ? 'var(--secondary-100)'
                  : 'transparent'
          }}
        >
          {isTodayDate && !isSelected && (
            <motion.div
              style={{
                position: 'absolute',
                bottom: '4px',
                left: '50%',
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'var(--secondary-500)',
                transform: 'translateX(-50%)'
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            />
          )}
          {day}
        </motion.button>
      );
    }

    return days;
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div ref={containerRef} className={`modern-datepicker ${className}`} style={{ position: 'relative' }}>
      {label && (
        <label className="form-label" style={{ marginBottom: 'var(--space-sm)' }}>
          {label}
        </label>
      )}
      
      <motion.button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: 'var(--space-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'white',
          border: `2px solid ${isOpen ? 'var(--primary-300)' : 'var(--gray-200)'}`,
          borderRadius: 'var(--radius-lg)',
          fontSize: '1rem',
          color: 'var(--gray-700)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: disabled ? 0.6 : 1
        }}
        whileHover={!disabled ? { 
          borderColor: 'var(--primary-300)',
          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
        } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <CalendarDaysIcon style={{ width: '20px', height: '20px', color: 'var(--primary-500)' }} />
          <span>
            {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
          </span>
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRightIcon style={{ width: '20px', height: '20px', color: 'var(--gray-400)' }} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 50,
              marginTop: 'var(--space-sm)',
                             background: 'white',
               borderRadius: 'var(--radius-xl)',
               boxShadow: 'var(--shadow-2xl)',
               padding: 'var(--space-lg)',
               backdropFilter: 'blur(20px)',
               border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: 'var(--space-lg)',
              paddingBottom: 'var(--space-md)',
              borderBottom: '1px solid var(--gray-100)'
            }}>
              <motion.button
                onClick={() => navigateMonth('prev')}
                style={{
                  padding: 'var(--space-sm)',
                  background: 'var(--gray-50)',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                whileHover={{ backgroundColor: 'var(--gray-100)', scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeftIcon style={{ width: '16px', height: '16px', color: 'var(--gray-600)' }} />
              </motion.button>

              <div style={{ textAlign: 'center' }}>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: 600, 
                  color: 'var(--gray-900)', 
                  margin: 0,
                  marginBottom: 'var(--space-xs)'
                }}>
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <motion.button
                  onClick={navigateToToday}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--primary-600)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 'var(--space-xs) var(--space-sm)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all 0.2s ease'
                  }}
                  whileHover={{ 
                    backgroundColor: 'var(--primary-50)',
                    scale: 1.05
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Today
                </motion.button>
              </div>

              <motion.button
                onClick={() => navigateMonth('next')}
                style={{
                  padding: 'var(--space-sm)',
                  background: 'var(--gray-50)',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                whileHover={{ backgroundColor: 'var(--gray-100)', scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRightIcon style={{ width: '16px', height: '16px', color: 'var(--gray-600)' }} />
              </motion.button>
            </div>

            {/* Day Headers */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gap: 'var(--space-xs)',
              marginBottom: 'var(--space-md)'
            }}>
              {dayNames.map(day => (
                <div 
                  key={day}
                  style={{
                    padding: 'var(--space-sm)',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--gray-500)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <motion.div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: 'var(--space-xs)' 
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {renderCalendarDays()}
            </motion.div>

            {/* Footer */}
            <div style={{ 
              marginTop: 'var(--space-lg)',
              paddingTop: 'var(--space-md)',
              borderTop: '1px solid var(--gray-100)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                Selected: {selectedDate ? formatDisplayDate(selectedDate) : 'None'}
              </div>
              
              <motion.button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: 'var(--space-xs) var(--space-sm)',
                  background: 'var(--gray-100)',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.75rem',
                  color: 'var(--gray-600)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-xs)'
                }}
                whileHover={{ backgroundColor: 'var(--gray-200)' }}
                whileTap={{ scale: 0.95 }}
              >
                <XMarkIcon style={{ width: '12px', height: '12px' }} />
                Close
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModernDatePicker; 
import {
  CalendarDaysIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useRef, useEffect } from 'react';

interface ModernDatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const ModernDatePicker: React.FC<ModernDatePickerProps> = ({
  value: selectedDate,
  onChange,
  placeholder = 'Select a date',
  label,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHoveredDate(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isSameDate = (date1: Date, date2: Date | null) => {
    if (!date2) return false;
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDate(date, today);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isDateDisabled = (_date: Date) => {
    // Currently no dates are disabled - can be extended for custom logic
    return false;
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    onChange(newDate);
    setIsOpen(false);
    setHoveredDate(null);
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

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
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
          className={`w-10 h-10 flex items-center justify-center border-none rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 relative overflow-hidden ${
            isSelected
              ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
              : isHovered
                ? 'bg-primary-100 text-primary-700'
                : isTodayDate
                  ? 'bg-accent-100 text-accent-700'
                  : 'bg-transparent text-neutral-700'
          } ${disabled ? 'cursor-not-allowed text-neutral-300' : ''}`}
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
        >
          {/* Pulse animation for today */}
          {isTodayDate && !isSelected && (
            <motion.div
              className="absolute inset-0 bg-accent-200 rounded-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
          <span className="relative z-10">{day}</span>
        </motion.button>
      );
    }

    return days;
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label className="block font-semibold text-neutral-700 mb-3 text-sm uppercase tracking-wide">
          {label}
        </label>
      )}

      <motion.button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-6 py-4 flex items-center justify-between bg-white/90 backdrop-blur-xl border-2 rounded-2xl text-base text-neutral-700 cursor-pointer transition-all duration-300 focus:outline-none ${
          disabled ? 'cursor-not-allowed opacity-60' : ''
        } ${
          isOpen
            ? 'border-primary-500 shadow-lg'
            : 'border-neutral-200 hover:border-primary-300 hover:bg-white'
        }`}
        whileHover={
          !disabled
            ? {
                borderColor: '#f5a0a0',
                boxShadow: '0 0 0 3px rgba(139, 0, 0, 0.1)',
              }
            : {}
        }
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="w-5 h-5 text-primary-500" />
          <span>
            {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
          </span>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRightIcon className="w-5 h-5 text-neutral-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 z-50 mt-2 bg-white/95 backdrop-blur-xl border-2 border-primary-300 rounded-3xl shadow-elegant overflow-hidden"
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-neutral-50">
              <motion.button
                onClick={() => navigateMonth('prev')}
                className="p-2 text-neutral-600 bg-white rounded-xl border border-neutral-200 hover:bg-neutral-50 hover:text-neutral-800 focus:outline-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRightIcon className="w-4 h-4 rotate-180" />
              </motion.button>

              <h3 className="text-lg font-semibold text-neutral-800">
                {currentMonth.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h3>

              <motion.button
                onClick={() => navigateMonth('next')}
                className="p-2 text-neutral-600 bg-white rounded-xl border border-neutral-200 hover:bg-neutral-50 hover:text-neutral-800 focus:outline-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div
                    key={day}
                    className="h-8 flex items-center justify-center text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {renderCalendarDays()}
              </div>
            </div>

            {/* Quick actions */}
            <div className="p-4 border-t border-neutral-200 bg-neutral-50">
              <div className="flex justify-between">
                <motion.button
                  onClick={() => {
                    onChange(new Date());
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 text-sm text-primary-600 bg-primary-50 rounded-xl border border-primary-200 hover:bg-primary-100 focus:outline-none"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Today
                </motion.button>

                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm text-neutral-600 bg-white rounded-xl border border-neutral-200 hover:bg-neutral-50 focus:outline-none"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModernDatePicker;

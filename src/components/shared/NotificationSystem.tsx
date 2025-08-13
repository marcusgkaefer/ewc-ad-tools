// Component: NotificationSystem
// Purpose: Display and manage application notifications (success, error, info)
// Props: Notification data and display configuration
// State: Notification visibility and auto-dismiss timing
// Dependencies: React, Framer Motion, Heroicons

import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number; // Auto-dismiss in milliseconds, 0 for manual dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationSystemProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
  maxNotifications?: number;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

const notificationVariants = {
  hidden: {
    opacity: 0,
    x: 300,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    x: 300,
    scale: 0.8,
    transition: {
      duration: 0.2,
    },
  },
};

const getNotificationStyles = (type: Notification['type']) => {
  const baseStyles = 'p-4 rounded-xl shadow-lg border-l-4 max-w-sm';

  switch (type) {
    case 'success':
      return `${baseStyles} bg-green-50 border-green-500 text-green-800`;
    case 'error':
      return `${baseStyles} bg-red-50 border-red-500 text-red-800`;
    case 'warning':
      return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-800`;
    case 'info':
      return `${baseStyles} bg-blue-50 border-blue-500 text-blue-800`;
    default:
      return `${baseStyles} bg-neutral-50 border-neutral-500 text-neutral-800`;
  }
};

const getNotificationIcon = (type: Notification['type']) => {
  const iconClasses = 'w-5 h-5';

  switch (type) {
    case 'success':
      return <CheckCircleIcon className={`${iconClasses} text-green-600`} />;
    case 'error':
      return <XCircleIcon className={`${iconClasses} text-red-600`} />;
    case 'warning':
      return (
        <ExclamationTriangleIcon className={`${iconClasses} text-yellow-600`} />
      );
    case 'info':
      return (
        <InformationCircleIcon className={`${iconClasses} text-blue-600`} />
      );
    default:
      return (
        <InformationCircleIcon className={`${iconClasses} text-neutral-600`} />
      );
  }
};

const getPositionClasses = (position: string) => {
  switch (position) {
    case 'top-right':
      return 'top-4 right-4';
    case 'top-left':
      return 'top-4 left-4';
    case 'bottom-right':
      return 'bottom-4 right-4';
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'top-center':
      return 'top-4 left-1/2 transform -translate-x-1/2';
    case 'bottom-center':
      return 'bottom-4 left-1/2 transform -translate-x-1/2';
    default:
      return 'top-4 right-4';
  }
};

export default function NotificationSystem({
  notifications,
  onDismiss,
  maxNotifications = 5,
  position = 'top-right',
}: NotificationSystemProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<
    Notification[]
  >([]);

  useEffect(() => {
    // Limit the number of visible notifications
    setVisibleNotifications(notifications.slice(-maxNotifications));
  }, [notifications, maxNotifications]);

  const handleDismiss = useCallback(
    (id: string) => {
      onDismiss(id);
    },
    [onDismiss]
  );

  const handleAutoDismiss = useCallback(
    (notification: Notification) => {
      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          handleDismiss(notification.id);
        }, notification.duration);
      }
    },
    [handleDismiss]
  );

  useEffect(() => {
    // Set up auto-dismiss for notifications with duration
    visibleNotifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        handleAutoDismiss(notification);
      }
    });
  }, [visibleNotifications, handleAutoDismiss]);

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={`fixed z-50 ${getPositionClasses(position)} space-y-3`}>
      <AnimatePresence mode="popLayout">
        {visibleNotifications.map(notification => (
          <motion.div
            key={notification.id}
            variants={notificationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={getNotificationStyles(notification.type)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm">{notification.message}</p>

                {notification.action && (
                  <button
                    onClick={notification.action.onClick}
                    className="mt-2 text-xs font-medium underline hover:no-underline transition-all"
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>

              <button
                onClick={() => handleDismiss(notification.id)}
                className="flex-shrink-0 ml-2 p-1 rounded-lg hover:bg-black/10 transition-colors"
                aria-label="Dismiss notification"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification = { ...notification, id };
    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const showSuccess = (title: string, message: string, duration = 5000) => {
    return addNotification({ type: 'success', title, message, duration });
  };

  const showError = (title: string, message: string, duration = 8000) => {
    return addNotification({ type: 'error', title, message, duration });
  };

  const showInfo = (title: string, message: string, duration = 4000) => {
    return addNotification({ type: 'info', title, message, duration });
  };

  const showWarning = (title: string, message: string, duration = 6000) => {
    return addNotification({ type: 'warning', title, message, duration });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };
}

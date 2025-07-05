/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Notification Context
const NotificationContext = createContext();

// Custom hook to use notifications
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// SVG icons as components
const SVGIcons = {
  success: (
    <svg className="w-6 h-6 text-green-100" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="w-6 h-6 text-red-100" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-6 h-6 text-amber-100" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  info: (
    <svg className="w-6 h-6 text-blue-100" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
  close: (
    <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
};

// Notification types configuration
const notificationTypes = {
  success: {
    icon: SVGIcons.success,
    className: 'bg-gradient-to-r from-green-500 to-green-600 text-white'
  },
  error: {
    icon: SVGIcons.error,
    className: 'bg-gradient-to-r from-red-500 to-red-600 text-white'
  },
  warning: {
    icon: SVGIcons.warning,
    className: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
  },
  info: {
    icon: SVGIcons.info,
    className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
  }
};

// Individual notification component
const NotificationItem = ({ notification, index, onRemove }) => {
  const config = notificationTypes[notification.type];

  const handleDragEnd = (event, info) => {
    const { offset, velocity } = info;
    if (offset.x > 100 || velocity.x > 500) {
      onRemove(notification.id);
    }
  };

  return (
    <motion.div
      key={notification.id}
      layout
      initial={{ opacity: 0, x: 400, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1, y: index * 80 }}
      exit={{ opacity: 0, x: 400, scale: 0.8, transition: { duration: 0.2 } }}
      drag="x"
      dragConstraints={{ left: 0, right: 300 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02, rotateZ: 2 }}
      className={`
        fixed top-4 right-4 w-80 p-4 rounded-lg shadow-2xl border border-white/20
        backdrop-blur-sm cursor-grab active:cursor-grabbing z-50
        ${config.className}
      `}
      style={{ zIndex: 1000 - index }}
    >
      <div className="absolute inset-0 bg-black/10 rounded-lg backdrop-blur-sm" />

      <div className="relative flex items-start gap-3">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          className="flex-shrink-0"
        >
          {config.icon}
        </motion.div>

        <div className="flex-1 min-w-0">
          {notification.title && (
            <motion.h4
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-semibold text-sm leading-tight"
            >
              {notification.title}
            </motion.h4>
          )}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-xs opacity-90 leading-relaxed ${notification.title ? 'mt-1' : ''}`}
          >
            {notification.message}
          </motion.p>
        </div>

        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onRemove(notification.id)}
          className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
        >
          {SVGIcons.close}
        </motion.button>
      </div>

      {notification.duration && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: notification.duration / 1000, ease: "linear" }}
          className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg origin-left"
        />
      )}
    </motion.div>
  );
};

// Notification Provider Component
export const NotificationProvider = ({ children, maxNotifications = 3 }) => {
  const [notifications, setNotifications] = useState([]);
  const [idCounter, setIdCounter] = useState(1);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const addNotification = useCallback((options) => {
    const {
      type = 'info',
      title,
      message,
      duration = 3000,
      persistent = false
    } = options;

    const newNotification = {
      id: idCounter,
      type,
      title,
      message,
      duration: persistent ? null : duration,
      timestamp: Date.now()
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      return updated.slice(0, maxNotifications);
    });

    setIdCounter(prev => prev + 1);

    if (!persistent && duration > 0) {
      setTimeout(() => removeNotification(newNotification.id), duration);
    }

    return newNotification.id;
  }, [idCounter, maxNotifications, removeNotification]);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const success = useCallback((message, options = {}) => {
    return addNotification({ ...options, type: 'success', message });
  }, [addNotification]);

  const error = useCallback((message, options = {}) => {
    return addNotification({ ...options, type: 'error', message });
  }, [addNotification]);

  const warning = useCallback((message, options = {}) => {
    return addNotification({ ...options, type: 'warning', message });
  }, [addNotification]);

  const info = useCallback((message, options = {}) => {
    return addNotification({ ...options, type: 'info', message });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {notifications.map((notification, index) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            index={index}
            onRemove={removeNotification}
          />
        ))}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
};

// Main Notification wrapper
const Notification = ({ children }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

export default Notification;

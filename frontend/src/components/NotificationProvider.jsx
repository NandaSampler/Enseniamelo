import React, { createContext, useContext, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider');
  }
  return context;
};

const NotificationContainer = ({ notifications, onRemove }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getBackgroundColor(notification.type)} border rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in`}
        >
          <div className="flex-shrink-0">
            {getIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            {notification.title && (
              <h4 className="text-sm font-semibold text-slate-900 mb-1">
                {notification.title}
              </h4>
            )}
            <p className="text-sm text-slate-700">
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => onRemove(notification.id)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = ({ type, title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random();
    
    setNotifications(prev => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

export default NotificationContainer;
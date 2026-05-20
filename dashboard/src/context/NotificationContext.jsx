import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((type, message, title = '') => {
        const id = Math.random().toString(36).substr(2, 9);

        // Play sound
        try {
            const audio = new Audio('/notifications/notification.mp3'); // We'll need to provide this or a placeholder
            audio.volume = 0.4;
            audio.play().catch(() => { }); // Ignore autoplay blocks
        } catch (e) { }

        const newNotification = {
            id,
            type, // 'success', 'error', 'warning', 'info'
            message,
            title: title || type.charAt(0).toUpperCase() + type.slice(1)
        };

        setNotifications((prev) => [...prev, newNotification]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-4 pointer-events-none">
                <AnimatePresence>
                    {notifications.map((notification) => (
                        <Toast
                            key={notification.id}
                            {...notification}
                            onClose={() => removeNotification(notification.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

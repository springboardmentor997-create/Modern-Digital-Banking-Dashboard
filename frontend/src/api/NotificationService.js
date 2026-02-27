// src/services/NotificationService.js

/**
 * A central service for handling user notifications.
 * You can easily swap 'alert' for a library like react-hot-toast or toastify later.
 */

export const success = (message) => {
    // You can replace this with toast.success(message) if you install a library
    console.log(`%c SUCCESS: ${message}`, 'color: green; font-weight: bold;');
    alert(`✅ ${message}`);
};

export const error = (message) => {
    // You can replace this with toast.error(message)
    console.log(`%c ERROR: ${message}`, 'color: red; font-weight: bold;');
    alert(`❌ ${message}`);
};

export const info = (message) => {
    // You can replace this with toast.info(message)
    console.log(`%c INFO: ${message}`, 'color: blue; font-weight: bold;');
    alert(`ℹ️ ${message}`);
};

export const warning = (message) => {
    // You can replace this with toast.warning(message)
    console.log(`%c WARNING: ${message}`, 'color: orange; font-weight: bold;');
    alert(`⚠️ ${message}`);
};

// Default export to support both: 
// import NotificationService from '...' 
// AND 
// import { success } from '...'
const NotificationService = {
    success,
    error,
    info,
    warning
};

export default NotificationService;
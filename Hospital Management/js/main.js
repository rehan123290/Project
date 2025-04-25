// Main JavaScript file for the Hospital Management System

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initApp();
    
    // Add event listeners
    addEventListeners();
});

/**
 * Initialize the application
 */
function initApp() {
    // Display current year in footer
    updateCopyrightYear();
    
    // Highlight active navigation item
    highlightCurrentPage();
}

/**
 * Update copyright year
 */
function updateCopyrightYear() {
    const yearEl = document.querySelector('.footer-bottom p');
    if (yearEl) {
        const currentYear = new Date().getFullYear();
        yearEl.innerHTML = yearEl.innerHTML.replace(/\d{4}/, currentYear);
    }
}

/**
 * Add global event listeners
 */
function addEventListeners() {
    // Smooth scrolling for anchor links - using event delegation
    document.addEventListener('click', handleAnchorClicks);

    // Mobile menu toggle (for mobile responsive design)
    setupMobileMenu();
}

/**
 * Handle anchor clicks for smooth scrolling
 * @param {Event} e - Click event
 */
function handleAnchorClicks(e) {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
        window.scrollTo({
            top: target.offsetTop - 70,
            behavior: 'smooth'
        });
    }
}

/**
 * Setup mobile menu toggle
 */
function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.querySelector('nav ul').classList.toggle('show');
        });
    }
}

/**
 * Highlight the current page in navigation
 */
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav ul li a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPage = link.getAttribute('href');
        
        if (currentPage === linkPage || 
            (currentPage === '' && linkPage === 'index.html') ||
            (currentPage === '/' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Notification system - using singleton pattern for efficiency
const NotificationSystem = (() => {
    let notificationQueue = [];
    let isProcessing = false;

    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - Type of notification (success, error, warning, info)
     */
    function showNotification(message, type = 'info') {
        notificationQueue.push({ message, type });
        
        if (!isProcessing) {
            processNotificationQueue();
        }
    }

    /**
     * Process the notification queue
     */
    function processNotificationQueue() {
        if (notificationQueue.length === 0) {
            isProcessing = false;
            return;
        }

        isProcessing = true;
        const { message, type } = notificationQueue.shift();
        
        // Create and show notification
        const notification = createNotificationElement(message, type);
        document.body.appendChild(notification);
        
        // Show notification with slight delay for animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            hideNotification(notification, () => {
                processNotificationQueue();
            });
        }, 5000);
        
        // Add close button handler
        notification.querySelector('.notification-close').addEventListener('click', () => {
            hideNotification(notification);
        });
    }

    /**
     * Create notification element
     * @param {string} message - Message to display
     * @param {string} type - Notification type
     * @returns {HTMLElement} Notification element
     */
    function createNotificationElement(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <span class="notification-close">&times;</span>
        `;
        return notification;
    }

    /**
     * Hide notification and remove from DOM
     * @param {HTMLElement} notification - Notification element
     * @param {Function} callback - Callback function
     */
    function hideNotification(notification, callback) {
        notification.classList.remove('show');
        
        // Wait for animation to complete
        setTimeout(() => {
            notification.remove();
            if (callback) callback();
        }, 300);
    }

    return {
        showNotification
    };
})();

/**
 * Format a date string to a readable format
 * @param {string} dateStr - Date string to format
 * @returns {string} - Formatted date string
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}

/**
 * Format a time string to a readable format
 * @param {string} timeStr - Time string to format
 * @returns {string} - Formatted time string
 */
function formatTime(timeStr) {
    if (!timeStr) return '';
    
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString(undefined, options);
}

/**
 * Generate a unique ID
 * @returns {string} - Unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Storage utility - leveraging closures for enhanced performance
const StorageUtil = (() => {
    /**
     * Save data to localStorage with error handling
     * @param {string} key - Key to store data under
     * @param {any} data - Data to store
     * @returns {boolean} Success status
     */
    function saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    /**
     * Get data from localStorage with error handling
     * @param {string} key - Key to retrieve data from
     * @returns {any|null} - Retrieved data or null on error
     */
    function getFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting from localStorage:', error);
            return null;
        }
    }

    return {
        saveToLocalStorage,
        getFromLocalStorage
    };
})();

/**
 * Validate form data with debouncing
 * @param {HTMLFormElement} form - Form to validate
 * @returns {boolean} - Whether the form is valid
 */
function validateForm(form) {
    let isValid = true;
    
    // Check required fields
    form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            
            if (!field.classList.contains('error')) {
                field.classList.add('error');
                
                // Add error message if not exists
                if (!field.parentNode.querySelector('.error-message')) {
                    const errorMsg = document.createElement('div');
                    errorMsg.className = 'error-message';
                    errorMsg.textContent = 'This field is required';
                    field.parentNode.appendChild(errorMsg);
                }
            }
        } else {
            field.classList.remove('error');
            const errorMsg = field.parentNode.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        }
    });
    
    return isValid;
}

// Export functions for use in other files
window.hospitalUtils = {
    showNotification: NotificationSystem.showNotification,
    formatDate,
    formatTime,
    generateId,
    saveToLocalStorage: StorageUtil.saveToLocalStorage,
    getFromLocalStorage: StorageUtil.getFromLocalStorage,
    validateForm
}; 
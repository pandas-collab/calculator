/**
 * Utility functions for the calculator application
 * Provides validation, formatting, and helper functions
 */

// State management utilities
const StateManager = {
    /**
     * Validates calculator state object
     * @param {Object} state - State object to validate
     * @returns {boolean} - True if state is valid
     */
    validateState(state) {
        try {
            if (!state || typeof state !== 'object') return false;

            const requiredFields = ['currentValue', 'previousValue', 'operator', 'waitingForOperand'];
            return requiredFields.every(field => state.hasOwnProperty(field));
        } catch (error) {
            console.error('State validation error:', error);
            return false;
        }
    },

    /**
     * Creates default calculator state
     * @returns {Object} - Default state object
     */
    createDefaultState() {
        return {
            currentValue: '0',
            previousValue: null,
            operator: null,
            waitingForOperand: false,
            hasError: false,
            errorMessage: ''
        };
    },

    /**
     * Deep clones state object
     * @param {Object} state - State to clone
     * @returns {Object} - Cloned state
     */
    cloneState(state) {
        try {
            return JSON.parse(JSON.stringify(state));
        } catch (error) {
            console.error('State cloning error:', error);
            return this.createDefaultState();
        }
    }
};

// Number formatting utilities
const NumberFormatter = {
    /**
     * Formats number for display with proper decimal handling
     * @param {string|number} value - Value to format
     * @param {number} maxLength - Maximum display length
     * @returns {string} - Formatted number string
     */
    formatForDisplay(value, maxLength = 12) {
        try {
            if (value === null || value === undefined) return '0';

            let numStr = String(value);

            // Handle special cases
            if (numStr === 'Infinity') return 'Error: Overflow';
            if (numStr === '-Infinity') return 'Error: Underflow';
            if (numStr === 'NaN') return 'Error: Invalid';

            // Parse as number to handle formatting
            const num = parseFloat(numStr);
            if (isNaN(num)) return 'Error: Invalid';

            // Handle very large or very small numbers
            if (Math.abs(num) >= 1e12) {
                return num.toExponential(6);
            }

            // Format with appropriate decimal places
            let formatted = num.toString();

            // Limit length while preserving significant digits
            if (formatted.length > maxLength) {
                if (formatted.includes('.')) {
                    const intPart = formatted.split('.')[0];
                    const decimalPlaces = Math.max(0, maxLength - intPart.length - 1);
                    formatted = num.toFixed(decimalPlaces);
                } else {
                    formatted = num.toExponential(6);
                }
            }

            return formatted;
        } catch (error) {
            console.error('Number formatting error:', error);
            return 'Error: Format';
        }
    },

    /**
     * Validates if string is a valid number
     * @param {string} value - String to validate
     * @returns {boolean} - True if valid number
     */
    isValidNumber(value) {
        try {
            if (typeof value !== 'string' && typeof value !== 'number') return false;
            const num = parseFloat(value);
            return !isNaN(num) && isFinite(num);
        } catch (error) {
            console.error('Number validation error:', error);
            return false;
        }
    },

    /**
     * Checks if number exceeds display limits
     * @param {string|number} value - Value to check
     * @returns {boolean} - True if exceeds limits
     */
    exceedsDisplayLimits(value) {
        try {
            const num = parseFloat(value);
            return Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-10 && num !== 0);
        } catch (error) {
            console.error('Display limit check error:', error);
            return false;
        }
    }
};

// DOM manipulation utilities
const DOMUtils = {
    /**
     * Safely gets element by ID with error handling
     * @param {string} id - Element ID
     * @returns {HTMLElement|null} - Element or null if not found
     */
    safeGetElement(id) {
        try {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element not found: ${id}`);
            }
            return element;
        } catch (error) {
            console.error('DOM element retrieval error:', error);
            return null;
        }
    },

    /**
     * Safely sets element text content
     * @param {HTMLElement} element - Target element
     * @param {string} content - Text content to set
     */
    safeSetContent(element, content) {
        try {
            if (element && typeof content === 'string') {
                element.textContent = content;
            }
        } catch (error) {
            console.error('DOM content setting error:', error);
        }
    },

    /**
     * Safely adds CSS class to element
     * @param {HTMLElement} element - Target element
     * @param {string} className - CSS class name
     */
    safeAddClass(element, className) {
        try {
            if (element && element.classList && typeof className === 'string') {
                element.classList.add(className);
            }
        } catch (error) {
            console.error('CSS class addition error:', error);
        }
    },

    /**
     * Safely removes CSS class from element
     * @param {HTMLElement} element - Target element
     * @param {string} className - CSS class name
     */
    safeRemoveClass(element, className) {
        try {
            if (element && element.classList && typeof className === 'string') {
                element.classList.remove(className);
            }
        } catch (error) {
            console.error('CSS class removal error:', error);
        }
    }
};

// Event handling utilities
const EventUtils = {
    /**
     * Safely adds event listener with error handling
     * @param {HTMLElement} element - Target element
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     */
    safeAddListener(element, event, handler) {
        try {
            if (element && typeof event === 'string' && typeof handler === 'function') {
                element.addEventListener(event, handler);
            }
        } catch (error) {
            console.error('Event listener addition error:', error);
        }
    },

    /**
     * Debounces function calls
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            try {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay);
            } catch (error) {
                console.error('Debounce error:', error);
            }
        };
    }
};

// Error handling utilities
const ErrorHandler = {
    /**
     * Creates standardized error object
     * @param {string} type - Error type
     * @param {string} message - Error message
     * @param {Error} originalError - Original error object
     * @returns {Object} - Standardized error object
     */
    createError(type, message, originalError = null) {
        return {
            type: type || 'UNKNOWN',
            message: message || 'An unknown error occurred',
            timestamp: new Date().toISOString(),
            originalError: originalError
        };
    },

    /**
     * Logs error with context information
     * @param {Object} error - Error object
     * @param {string} context - Context where error occurred
     */
    logError(error, context = 'Unknown') {
        try {
            console.error(`[${context}] Calculator Error:`, {
                type: error.type,
                message: error.message,
                timestamp: error.timestamp,
                originalError: error.originalError
            });
        } catch (logError) {
            console.error('Error logging failed:', logError);
        }
    },

    /**
     * Determines if error should be shown to user
     * @param {Object} error - Error object
     * @returns {boolean} - True if should show to user
     */
    shouldShowToUser(error) {
        const userFacingTypes = ['CALCULATION', 'VALIDATION', 'OVERFLOW'];
        return userFacingTypes.includes(error.type);
    }
};

// Export utilities for use in other modules
if (typeof window !== 'undefined') {
    window.CalculatorUtils = {
        StateManager,
        NumberFormatter,
        DOMUtils,
        EventUtils,
        ErrorHandler
    };
}

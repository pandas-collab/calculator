/**
 * Calculator Display System
 * Manages the visual display of numbers, operators, and results
 * Handles real-time updates, error states, and formatting
 */

class CalculatorDisplay {
    constructor(displayElementId = 'display-content') {
        this.displayElement = null;
        this.displayContainer = null;
        this.currentValue = '0';
        this.maxDisplayLength = 12;
        this.isAnimating = false;
        this.scrollTimeout = null;

        this.initialize(displayElementId);
    }

    /**
     * Initializes the display system with error handling
     * @param {string} displayElementId - ID of the display element
     */
    initialize(displayElementId) {
        try {
            this.displayElement = document.getElementById(displayElementId);
            this.displayContainer = document.getElementById('display');

            if (!this.displayElement) {
                throw new Error(`Display element not found: ${displayElementId}`);
            }

            // Set initial state
            this.setValue('0');
            this.setupDisplayElements();

            console.log('Calculator display initialized successfully');
        } catch (error) {
            console.error('Display initialization error:', error);
            this.handleError('INIT', 'Display initialization failed');
        }
    }

    /**
     * Sets up display elements and styling
     */
    setupDisplayElements() {
        try {
            if (this.displayElement) {
                // Ensure display has proper attributes
                this.displayElement.setAttribute('aria-live', 'polite');
                this.displayElement.setAttribute('aria-label', 'Calculator display');

                // Set initial styling
                this.displayElement.style.textAlign = 'right';
                this.displayElement.style.overflow = 'hidden';
                this.displayElement.style.whiteSpace = 'nowrap';
            }

            if (this.displayContainer) {
                this.displayContainer.style.position = 'relative';
            }
        } catch (error) {
            console.error('Display setup error:', error);
        }
    }

    /**
     * Sets the display value with formatting and validation
     * @param {string|number} value - Value to display
     * @param {Object} options - Display options
     */
    setValue(value, options = {}) {
        try {
            // Validate input
            if (value === null || value === undefined) {
                value = '0';
            }

            // Convert to string and validate
            const stringValue = String(value);

            // Handle special values
            if (this.isSpecialValue(stringValue)) {
                this.setSpecialValue(stringValue);
                return;
            }

            // Format the value for display
            const formattedValue = this.formatValue(stringValue);

            // Update display
            this.updateDisplay(formattedValue, options);

            // Store current value
            this.currentValue = formattedValue;

        } catch (error) {
            console.error('Display setValue error:', error);
            this.showError('Error: Display');
        }
    }

    /**
     * Formats value for display with proper number formatting
     * @param {string} value - Raw value to format
     * @returns {string} - Formatted display value
     */
    formatValue(value) {
        try {
            // Use utility formatter if available
            if (window.CalculatorUtils && window.CalculatorUtils.NumberFormatter) {
                return window.CalculatorUtils.NumberFormatter.formatForDisplay(value, this.maxDisplayLength);
            }

            // Fallback formatting
            const num = parseFloat(value);

            if (isNaN(num)) {
                return 'Error: Invalid';
            }

            if (!isFinite(num)) {
                return num > 0 ? 'Error: Overflow' : 'Error: Underflow';
            }

            // Handle very large numbers
            if (Math.abs(num) >= 1e12) {
                return num.toExponential(6);
            }

            // Format with appropriate precision
            let formatted = num.toString();
            if (formatted.length > this.maxDisplayLength) {
                const decimalIndex = formatted.indexOf('.');
                if (decimalIndex > 0) {
                    const integerPart = formatted.substring(0, decimalIndex);
                    const decimalPlaces = Math.max(0, this.maxDisplayLength - integerPart.length - 1);
                    formatted = num.toFixed(decimalPlaces);
                }
            }

            return formatted;
        } catch (error) {
            console.error('Value formatting error:', error);
            return 'Error: Format';
        }
    }

    /**
     * Checks if value is a special value (error, infinity, etc.)
     * @param {string} value - Value to check
     * @returns {boolean} - True if special value
     */
    isSpecialValue(value) {
        const specialValues = ['Infinity', '-Infinity', 'NaN'];
        return specialValues.includes(value) || value.startsWith('Error:');
    }

    /**
     * Handles special values (errors, infinity, etc.)
     * @param {string} value - Special value to handle
     */
    setSpecialValue(value) {
        try {
            let displayValue;

            switch (value) {
                case 'Infinity':
                    displayValue = 'Error: Overflow';
                    break;
                case '-Infinity':
                    displayValue = 'Error: Underflow';
                    break;
                case 'NaN':
                    displayValue = 'Error: Invalid';
                    break;
                default:
                    displayValue = value; // Already formatted error message
            }

            this.showError(displayValue);
        } catch (error) {
            console.error('Special value handling error:', error);
            this.showError('Error: Unknown');
        }
    }

    /**
     * Updates the display element with new value
     * @param {string} value - Value to display
     * @param {Object} options - Display options
     */
    updateDisplay(value, options = {}) {
        try {
            if (!this.displayElement) return;

            // Clear any existing error state
            this.clearErrorState();

            // Set the display content
            this.displayElement.textContent = value;

            // Handle animations if requested
            if (options.animate && !this.isAnimating) {
                this.animateValueChange();
            }

            // Handle long numbers with scrolling
            this.handleLongNumbers(value);

            // Adjust font size if needed
            this.adjustFontSize(value);

            // Update accessibility
            this.updateAccessibility(value);

        } catch (error) {
            console.error('Display update error:', error);
        }
    }

    /**
     * Handles display of long numbers with horizontal scrolling
     * @param {string} value - Current display value
     */
    handleLongNumbers(value) {
        try {
            if (!this.displayElement || !this.displayContainer) return;

            const element = this.displayElement;
            const container = this.displayContainer;

            // Check if content overflows
            if (element.scrollWidth > container.clientWidth) {
                // Enable horizontal scrolling
                element.style.transform = 'translateX(0)';

                // Auto-scroll to show the end (most recent input)
                clearTimeout(this.scrollTimeout);
                this.scrollTimeout = setTimeout(() => {
                    const scrollAmount = element.scrollWidth - container.clientWidth;
                    element.style.transform = `translateX(-${scrollAmount}px)`;
                }, 100);
            } else {
                // Reset transform if content fits
                element.style.transform = 'translateX(0)';
            }
        } catch (error) {
            console.error('Long number handling error:', error);
        }
    }

    /**
     * Adjusts font size for optimal display
     * @param {string} value - Current display value
     */
    adjustFontSize(value) {
        try {
            if (!this.displayElement) return;

            const baseSize = 2.5; // rem
            const length = value.length;

            let fontSize;
            if (length <= 8) {
                fontSize = baseSize;
            } else if (length <= 12) {
                fontSize = baseSize * 0.85;
            } else {
                fontSize = baseSize * 0.7;
            }

            this.displayElement.style.fontSize = `${fontSize}rem`;
        } catch (error) {
            console.error('Font size adjustment error:', error);
        }
    }

    /**
     * Animates value changes for visual feedback
     */
    animateValueChange() {
        try {
            if (!this.displayElement || this.isAnimating) return;

            this.isAnimating = true;

            // Add animation class
            this.displayElement.classList.add('value-change');

            // Remove class after animation
            setTimeout(() => {
                if (this.displayElement) {
                    this.displayElement.classList.remove('value-change');
                }
                this.isAnimating = false;
            }, 200);
        } catch (error) {
            console.error('Animation error:', error);
            this.isAnimating = false;
        }
    }

    /**
     * Shows error state in display
     * @param {string} errorMessage - Error message to display
     */
    showError(errorMessage) {
        try {
            if (!this.displayElement) return;

            // Set error content
            this.displayElement.textContent = errorMessage;

            // Add error styling
            this.displayElement.classList.add('error');

            // Reset font size for error messages
            this.displayElement.style.fontSize = '1.8rem';

            // Update accessibility
            this.displayElement.setAttribute('aria-live', 'assertive');

            // Auto-clear error state after delay
            setTimeout(() => {
                this.clearErrorState();
            }, 3000);

        } catch (error) {
            console.error('Error display error:', error);
        }
    }

    /**
     * Clears error state from display
     */
    clearErrorState() {
        try {
            if (!this.displayElement) return;

            this.displayElement.classList.remove('error');
            this.displayElement.setAttribute('aria-live', 'polite');
        } catch (error) {
            console.error('Error state clearing error:', error);
        }
    }

    /**
     * Updates accessibility attributes
     * @param {string} value - Current display value
     */
    updateAccessibility(value) {
        try {
            if (!this.displayElement) return;

            // Update screen reader announcement
            const announcement = this.createAccessibilityAnnouncement(value);
            this.displayElement.setAttribute('aria-label', announcement);
        } catch (error) {
            console.error('Accessibility update error:', error);
        }
    }

    /**
     * Creates accessibility announcement for screen readers
     * @param {string} value - Current display value
     * @returns {string} - Accessibility announcement
     */
    createAccessibilityAnnouncement(value) {
        try {
            if (value.startsWith('Error:')) {
                return `Calculator error: ${value.replace('Error: ', '')}`;
            }

            // Convert mathematical symbols for screen readers
            const readable = value
                .replace(/\*/g, ' times ')
                .replace(/\//g, ' divided by ')
                .replace(/\+/g, ' plus ')
                .replace(/-/g, ' minus ');

            return `Calculator display shows: ${readable}`;
        } catch (error) {
            console.error('Accessibility announcement error:', error);
            return 'Calculator display';
        }
    }

    /**
     * Gets current display value
     * @returns {string} - Current display value
     */
    getValue() {
        try {
            return this.currentValue || '0';
        } catch (error) {
            console.error('Get value error:', error);
            return '0';
        }
    }

    /**
     * Clears the display
     */
    clear() {
        try {
            this.setValue('0');
        } catch (error) {
            console.error('Display clear error:', error);
        }
    }

    /**
     * Shows operator feedback briefly
     * @param {string} operator - Operator symbol
     */
    showOperator(operator) {
        try {
            if (!this.displayElement) return;

            const operatorSymbols = {
                '+': '+',
                '-': '',
                '*': '',
                '/': ''
            };

            const displayOperator = operatorSymbols[operator] || operator;

            // Briefly show operator
            const originalValue = this.currentValue;
            this.displayElement.textContent = displayOperator;

            // Restore original value after brief display
            setTimeout(() => {
                if (this.displayElement) {
                    this.displayElement.textContent = originalValue;
                }
            }, 150);

        } catch (error) {
            console.error('Operator display error:', error);
        }
    }

    /**
     * Handles calculator errors
     * @param {string} type - Error type
     * @param {string} message - Error message
     */
    handleError(type, message) {
        try {
            if (window.CalculatorUtils && window.CalculatorUtils.ErrorHandler) {
                const error = window.CalculatorUtils.ErrorHandler.createError(type, message);
                window.CalculatorUtils.ErrorHandler.logError(error, 'Display');

                if (window.CalculatorUtils.ErrorHandler.shouldShowToUser(error)) {
                    this.showError(`Error: ${message}`);
                }
            } else {
                this.showError(`Error: ${message}`);
            }
        } catch (error) {
            console.error('Error handling error:', error);
            this.showError('Error: Unknown');
        }
    }

    /**
     * Destroys the display instance
     */
    destroy() {
        try {
            // Clear timeouts
            if (this.scrollTimeout) {
                clearTimeout(this.scrollTimeout);
            }

            // Reset display element
            if (this.displayElement) {
                this.displayElement.textContent = '0';
                this.displayElement.className = '';
                this.displayElement.style.cssText = '';
            }

            // Clear references
            this.displayElement = null;
            this.displayContainer = null;
            this.currentValue = '0';

        } catch (error) {
            console.error('Display destruction error:', error);
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.CalculatorDisplay = CalculatorDisplay;
}

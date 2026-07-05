/**
 * Calculator Input Handler
 * Coordinates input processing between calculator engine, display, and history
 * Handles button clicks, keyboard input, and application state
 */

class InputHandler {
    constructor() {
        this.calculator = null;
        this.display = null;
        this.history = null;
        this.isInitialized = false;

        this.initialize();
    }

    /**
     * Initializes the input handler and all calculator components
     */
    initialize() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
            } else {
                this.initializeComponents();
            }
        } catch (error) {
            console.error('Input handler initialization error:', error);
        }
    }

    /**
     * Initializes all calculator components
     */
    initializeComponents() {
        try {
            // Initialize calculator engine
            this.calculator = new Calculator();

            // Initialize display
            this.display = new CalculatorDisplay('display-content');

            // Initialize history
            this.history = new CalculatorHistory();

            // Setup event listeners
            this.setupEventListeners();

            // Mark as initialized
            this.isInitialized = true;

            console.log('Calculator application initialized successfully');

            // Initial display update
            this.updateDisplay();

        } catch (error) {
            console.error('Component initialization error:', error);
            this.handleError('INIT', 'Failed to initialize calculator components');
        }
    }

    /**
     * Sets up all event listeners for user input
     */
    setupEventListeners() {
        try {
            this.setupButtonListeners();
            this.setupKeyboardListeners();
            this.setupAccessibilityListeners();
        } catch (error) {
            console.error('Event listeners setup error:', error);
        }
    }

    /**
     * Sets up button click listeners
     */
    setupButtonListeners() {
        try {
            // Number buttons
            const numberButtons = document.querySelectorAll('.btn.number');
            numberButtons.forEach(button => {
                button.addEventListener('click', (event) => {
                    const digit = event.target.dataset.value;
                    this.handleNumberInput(digit);
                });
            });

            // Operator buttons
            const operatorButtons = document.querySelectorAll('.btn.operator');
            operatorButtons.forEach(button => {
                button.addEventListener('click', (event) => {
                    const operator = event.target.dataset.value;
                    this.handleOperatorInput(operator);
                });
            });

            // Function buttons
            const functionButtons = document.querySelectorAll('.btn.function');
            functionButtons.forEach(button => {
                button.addEventListener('click', (event) => {
                    const action = event.target.dataset.action || event.target.dataset.value;
                    this.handleFunctionInput(action);
                });
            });

            // Equals button
            const equalsButton = document.querySelector('.btn.equals');
            if (equalsButton) {
                equalsButton.addEventListener('click', () => {
                    this.handleEqualsInput();
                });
            }

            // Add visual feedback for button presses
            const allButtons = document.querySelectorAll('.btn');
            allButtons.forEach(button => {
                button.addEventListener('mousedown', () => {
                    button.classList.add('pressed');
                });

                button.addEventListener('mouseup', () => {
                    button.classList.remove('pressed');
                });

                button.addEventListener('mouseleave', () => {
                    button.classList.remove('pressed');
                });
            });

        } catch (error) {
            console.error('Button listeners setup error:', error);
        }
    }

    /**
     * Sets up keyboard input listeners
     */
    setupKeyboardListeners() {
        try {
            document.addEventListener('keydown', (event) => {
                this.handleKeyboardInput(event);
            });
        } catch (error) {
            console.error('Keyboard listeners setup error:', error);
        }
    }

    /**
     * Sets up accessibility listeners
     */
    setupAccessibilityListeners() {
        try {
            // Focus management for keyboard navigation
            const buttons = document.querySelectorAll('.btn');
            buttons.forEach(button => {
                button.addEventListener('focus', () => {
                    button.classList.add('focused');
                });

                button.addEventListener('blur', () => {
                    button.classList.remove('focused');
                });
            });
        } catch (error) {
            console.error('Accessibility listeners setup error:', error);
        }
    }

    /**
     * Handles number input (digits 0-9)
     * @param {string} digit - The digit that was input
     */
    handleNumberInput(digit) {
        try {
            if (!this.isInitialized || !this.calculator) return;

            const result = this.calculator.inputDigit(digit);
            this.updateDisplay(result);

            // Add button press animation
            this.animateButtonPress(digit);

        } catch (error) {
            console.error('Number input handling error:', error);
            this.handleError('INPUT', 'Number input failed');
        }
    }

    /**
     * Handles operator input (+, -, *, /)
     * @param {string} operator - The operator that was input
     */
    handleOperatorInput(operator) {
        try {
            if (!this.isInitialized || !this.calculator) return;

            const result = this.calculator.inputOperator(operator);
            this.updateDisplay(result);

            // Show operator feedback in display
            if (this.display) {
                this.display.showOperator(operator);
            }

            // Add button press animation
            this.animateButtonPress(operator);

        } catch (error) {
            console.error('Operator input handling error:', error);
            this.handleError('INPUT', 'Operator input failed');
        }
    }

    /**
     * Handles function input (clear, backspace, decimal, negate)
     * @param {string} action - The function action
     */
    handleFunctionInput(action) {
        try {
            if (!this.isInitialized || !this.calculator) return;

            let result;

            switch (action) {
                case 'clear':
                    result = this.calculator.clear();
                    break;

                case 'clear-entry':
                    result = this.calculator.clearEntry();
                    break;

                case 'backspace':
                    result = this.calculator.backspace();
                    break;

                case '.':
                    result = this.calculator.inputDecimal();
                    break;

                case 'negate':
                    result = this.calculator.negate();
                    break;

                default:
                    console.warn('Unknown function action:', action);
                    return;
            }

            this.updateDisplay(result);

            // Add button press animation
            this.animateButtonPress(action);

        } catch (error) {
            console.error('Function input handling error:', error);
            this.handleError('INPUT', 'Function input failed');
        }
    }

    /**
     * Handles equals input (perform calculation)
     */
    handleEqualsInput() {
        try {
            if (!this.isInitialized || !this.calculator) return;

            const result = this.calculator.calculate();
            this.updateDisplay(result, { animate: true });

            // Add to history if calculation was successful
            const lastOperation = this.calculator.getLastOperation();
            if (lastOperation && this.history && !result.startsWith('Error:')) {
                this.history.addToHistory(lastOperation);
            }

            // Add button press animation
            this.animateButtonPress('equals');

        } catch (error) {
            console.error('Equals input handling error:', error);
            this.handleError('INPUT', 'Calculation failed');
        }
    }

    /**
     * Handles keyboard input
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyboardInput(event) {
        try {
            // Prevent default for calculator keys
            const key = event.key;

            // Number keys
            if (key >= '0' && key <= '9') {
                event.preventDefault();
                this.handleNumberInput(key);
                return;
            }

            // Operator keys
            const operatorMap = {
                '+': '+',
                '-': '-',
                '*': '*',
                '/': '/',
                'x': '*',
                'X': '*'
            };

            if (operatorMap.hasOwnProperty(key)) {
                event.preventDefault();
                this.handleOperatorInput(operatorMap[key]);
                return;
            }

            // Function keys
            switch (key) {
                case 'Enter':
                case '=':
                    event.preventDefault();
                    this.handleEqualsInput();
                    break;

                case '.':
                case ',':
                    event.preventDefault();
                    this.handleFunctionInput('.');
                    break;

                case 'Backspace':
                    event.preventDefault();
                    this.handleFunctionInput('backspace');
                    break;

                case 'Delete':
                case 'c':
                case 'C':
                    event.preventDefault();
                    this.handleFunctionInput('clear');
                    break;

                case 'Escape':
                    event.preventDefault();
                    this.handleFunctionInput('clear-entry');
                    break;
            }

        } catch (error) {
            console.error('Keyboard input handling error:', error);
        }
    }

    /**
     * Updates the display with current value
     * @param {string} value - Value to display
     * @param {Object} options - Display options
     */
    updateDisplay(value = null, options = {}) {
        try {
            if (!this.display) return;

            const displayValue = value !== null ? value : this.calculator.getCurrentDisplayValue();
            this.display.setValue(displayValue, options);

        } catch (error) {
            console.error('Display update error:', error);
        }
    }

    /**
     * Animates button press for visual feedback
     * @param {string} buttonValue - Value or action of pressed button
     */
    animateButtonPress(buttonValue) {
        try {
            // Find the button element
            let button = document.querySelector(`[data-value="${buttonValue}"]`) ||
                        document.querySelector(`[data-action="${buttonValue}"]`);

            if (!button && buttonValue === 'equals') {
                button = document.querySelector('.btn.equals');
            }

            if (button) {
                button.classList.add('pressed');
                setTimeout(() => {
                    button.classList.remove('pressed');
                }, 100);
            }
        } catch (error) {
            console.error('Button animation error:', error);
        }
    }

    /**
     * Handles application errors
     * @param {string} type - Error type
     * @param {string} message - Error message
     */
    handleError(type, message) {
        try {
            console.error(`[${type}] Calculator Error: ${message}`);

            if (this.display) {
                this.display.showError(`Error: ${message}`);
            }

            // Log error using utility if available
            if (window.CalculatorUtils && window.CalculatorUtils.ErrorHandler) {
                const error = window.CalculatorUtils.ErrorHandler.createError(type, message);
                window.CalculatorUtils.ErrorHandler.logError(error, 'InputHandler');
            }

        } catch (error) {
            console.error('Error handling error:', error);
        }
    }

    /**
     * Gets current application state
     * @returns {Object} - Current application state
     */
    getApplicationState() {
        try {
            return {
                calculator: this.calculator ? this.calculator.getState() : null,
                display: this.display ? this.display.getValue() : null,
                history: this.history ? this.history.getHistory() : [],
                isInitialized: this.isInitialized
            };
        } catch (error) {
            console.error('Get application state error:', error);
            return { isInitialized: false };
        }
    }

    /**
     * Resets the entire calculator application
     */
    reset() {
        try {
            if (this.calculator) {
                this.calculator.clear();
            }

            if (this.display) {
                this.display.clear();
            }

            console.log('Calculator application reset');
        } catch (error) {
            console.error('Application reset error:', error);
        }
    }

    /**
     * Destroys the input handler and cleans up resources
     */
    destroy() {
        try {
            // Clean up components
            if (this.display) {
                this.display.destroy();
            }

            // Clear references
            this.calculator = null;
            this.display = null;
            this.history = null;
            this.isInitialized = false;

            console.log('Calculator application destroyed');
        } catch (error) {
            console.error('Application destruction error:', error);
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.InputHandler = InputHandler;
}

/**
 * Calculator Core Logic
 * Handles mathematical operations, state management, and calculation engine
 */

class Calculator {
    constructor() {
        this.state = {
            currentValue: '0',
            previousValue: null,
            operator: null,
            waitingForOperand: false,
            hasError: false,
            errorMessage: '',
            lastOperation: null
        };

        this.operations = {
            '+': (a, b) => a + b,
            '-': (a, b) => a - b,
            '*': (a, b) => a * b,
            '/': (a, b) => {
                if (b === 0) {
                    throw new Error('Division by zero');
                }
                return a / b;
            }
        };

        this.initialize();
    }

    /**
     * Initializes the calculator
     */
    initialize() {
        try {
            this.resetState();
            console.log('Calculator engine initialized successfully');
        } catch (error) {
            console.error('Calculator initialization error:', error);
            this.handleError('INIT', 'Calculator initialization failed');
        }
    }

    /**
     * Resets calculator state to default values
     */
    resetState() {
        try {
            if (window.CalculatorUtils && window.CalculatorUtils.StateManager) {
                this.state = window.CalculatorUtils.StateManager.createDefaultState();
            } else {
                this.state = {
                    currentValue: '0',
                    previousValue: null,
                    operator: null,
                    waitingForOperand: false,
                    hasError: false,
                    errorMessage: '',
                    lastOperation: null
                };
            }
        } catch (error) {
            console.error('State reset error:', error);
        }
    }

    /**
     * Inputs a digit into the calculator
     * @param {string} digit - Digit to input (0-9)
     */
    inputDigit(digit) {
        try {
            // Validate digit input
            if (!/^[0-9]$/.test(digit)) {
                throw new Error('Invalid digit');
            }

            // Clear error state if present
            if (this.state.hasError) {
                this.resetState();
            }

            // Handle digit input based on current state
            if (this.state.waitingForOperand) {
                this.state.currentValue = digit;
                this.state.waitingForOperand = false;
            } else {
                this.state.currentValue = this.state.currentValue === '0' ? digit : this.state.currentValue + digit;
            }

            return this.getCurrentDisplayValue();
        } catch (error) {
            console.error('Digit input error:', error);
            return this.handleError('INPUT', 'Invalid digit input');
        }
    }

    /**
     * Inputs decimal point
     */
    inputDecimal() {
        try {
            // Clear error state if present
            if (this.state.hasError) {
                this.resetState();
            }

            if (this.state.waitingForOperand) {
                this.state.currentValue = '0.';
                this.state.waitingForOperand = false;
            } else if (this.state.currentValue.indexOf('.') === -1) {
                this.state.currentValue += '.';
            }

            return this.getCurrentDisplayValue();
        } catch (error) {
            console.error('Decimal input error:', error);
            return this.handleError('INPUT', 'Decimal input failed');
        }
    }

    /**
     * Inputs an operator (+, -, *, /)
     * @param {string} operator - Mathematical operator
     */
    inputOperator(operator) {
        try {
            // Validate operator
            if (!this.operations.hasOwnProperty(operator)) {
                throw new Error('Invalid operator');
            }

            // Clear error state if present
            if (this.state.hasError) {
                this.resetState();
            }

            const currentValue = parseFloat(this.state.currentValue);

            // Perform pending calculation if there is one
            if (this.state.previousValue !== null && this.state.operator && !this.state.waitingForOperand) {
                const result = this.performCalculation();
                if (this.state.hasError) {
                    return this.getCurrentDisplayValue();
                }
                this.state.currentValue = String(result);
            }

            // Set up for next operation
            this.state.previousValue = currentValue;
            this.state.operator = operator;
            this.state.waitingForOperand = true;

            return this.getCurrentDisplayValue();
        } catch (error) {
            console.error('Operator input error:', error);
            return this.handleError('INPUT', 'Invalid operator');
        }
    }

    /**
     * Performs the calculation when equals is pressed
     */
    calculate() {
        try {
            // Clear error state if present
            if (this.state.hasError) {
                return this.getCurrentDisplayValue();
            }

            if (this.state.previousValue !== null && this.state.operator) {
                const result = this.performCalculation();

                if (!this.state.hasError) {
                    // Store operation for history
                    this.state.lastOperation = {
                        operand1: this.state.previousValue,
                        operator: this.state.operator,
                        operand2: parseFloat(this.state.currentValue),
                        result: result,
                        timestamp: new Date()
                    };

                    // Update state
                    this.state.currentValue = String(result);
                    this.state.previousValue = null;
                    this.state.operator = null;
                    this.state.waitingForOperand = true;
                }
            }

            return this.getCurrentDisplayValue();
        } catch (error) {
            console.error('Calculation error:', error);
            return this.handleError('CALCULATION', 'Calculation failed');
        }
    }

    /**
     * Performs the actual mathematical calculation
     * @returns {number} - Calculation result
     */
    performCalculation() {
        try {
            const prev = this.state.previousValue;
            const current = parseFloat(this.state.currentValue);
            const operator = this.state.operator;

            if (prev === null || !operator) {
                throw new Error('Invalid calculation state');
            }

            // Validate operands
            if (!isFinite(prev) || !isFinite(current)) {
                throw new Error('Invalid operands');
            }

            // Perform operation
            const operation = this.operations[operator];
            if (!operation) {
                throw new Error('Unknown operator');
            }

            const result = operation(prev, current);

            // Validate result
            if (!isFinite(result)) {
                if (result === Infinity || result === -Infinity) {
                    throw new Error('Overflow');
                } else {
                    throw new Error('Invalid result');
                }
            }

            // Check for precision issues with very small numbers
            if (Math.abs(result) < 1e-10 && result !== 0) {
                return 0;
            }

            return result;
        } catch (error) {
            console.error('Perform calculation error:', error);

            // Handle specific calculation errors
            if (error.message === 'Division by zero') {
                this.handleError('CALCULATION', 'Division by zero');
            } else if (error.message === 'Overflow') {
                this.handleError('CALCULATION', 'Overflow');
            } else {
                this.handleError('CALCULATION', 'Invalid calculation');
            }

            return 0;
        }
    }

    /**
     * Clears all calculator state (AC/Clear All)
     */
    clear() {
        try {
            this.resetState();
            return this.getCurrentDisplayValue();
        } catch (error) {
            console.error('Clear error:', error);
            return '0';
        }
    }

    /**
     * Clears current entry (CE/Clear Entry)
     */
    clearEntry() {
        try {
            this.state.currentValue = '0';
            this.state.hasError = false;
            this.state.errorMessage = '';
            return this.getCurrentDisplayValue();
        } catch (error) {
            console.error('Clear entry error:', error);
            return '0';
        }
    }

    /**
     * Removes last digit (backspace)
     */
    backspace() {
        try {
            if (this.state.hasError) {
                this.clearEntry();
                return this.getCurrentDisplayValue();
            }

            if (this.state.waitingForOperand) {
                return this.getCurrentDisplayValue();
            }

            const current = this.state.currentValue;
            if (current.length > 1) {
                this.state.currentValue = current.slice(0, -1);
            } else {
                this.state.currentValue = '0';
            }

            return this.getCurrentDisplayValue();
        } catch (error) {
            console.error('Backspace error:', error);
            return this.getCurrentDisplayValue();
        }
    }

    /**
     * Negates the current value (+/-)
     */
    negate() {
        try {
            if (this.state.hasError) {
                return this.getCurrentDisplayValue();
            }

            const current = parseFloat(this.state.currentValue);
            this.state.currentValue = String(-current);

            return this.getCurrentDisplayValue();
        } catch (error) {
            console.error('Negate error:', error);
            return this.getCurrentDisplayValue();
        }
    }

    /**
     * Gets the current value to display
     * @returns {string} - Current display value
     */
    getCurrentDisplayValue() {
        try {
            if (this.state.hasError) {
                return `Error: ${this.state.errorMessage}`;
            }

            return this.state.currentValue;
        } catch (error) {
            console.error('Get display value error:', error);
            return 'Error: Unknown';
        }
    }

    /**
     * Gets the last operation performed
     * @returns {Object|null} - Last operation details
     */
    getLastOperation() {
        try {
            return this.state.lastOperation;
        } catch (error) {
            console.error('Get last operation error:', error);
            return null;
        }
    }

    /**
     * Gets current calculator state
     * @returns {Object} - Current state object
     */
    getState() {
        try {
            if (window.CalculatorUtils && window.CalculatorUtils.StateManager) {
                return window.CalculatorUtils.StateManager.cloneState(this.state);
            }
            return { ...this.state };
        } catch (error) {
            console.error('Get state error:', error);
            return this.state;
        }
    }

    /**
     * Sets calculator state
     * @param {Object} newState - New state to set
     */
    setState(newState) {
        try {
            if (window.CalculatorUtils && window.CalculatorUtils.StateManager) {
                if (window.CalculatorUtils.StateManager.validateState(newState)) {
                    this.state = window.CalculatorUtils.StateManager.cloneState(newState);
                } else {
                    throw new Error('Invalid state object');
                }
            } else {
                this.state = { ...newState };
            }
        } catch (error) {
            console.error('Set state error:', error);
            this.handleError('STATE', 'Failed to set state');
        }
    }

    /**
     * Handles calculator errors
     * @param {string} type - Error type
     * @param {string} message - Error message
     * @returns {string} - Error display value
     */
    handleError(type, message) {
        try {
            this.state.hasError = true;
            this.state.errorMessage = message;

            // Log error if utility is available
            if (window.CalculatorUtils && window.CalculatorUtils.ErrorHandler) {
                const error = window.CalculatorUtils.ErrorHandler.createError(type, message);
                window.CalculatorUtils.ErrorHandler.logError(error, 'Calculator');
            }

            return this.getCurrentDisplayValue();
        } catch (error) {
            console.error('Error handling error:', error);
            return 'Error: Unknown';
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.Calculator = Calculator;
}

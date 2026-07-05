/**
 * Calculator History System
 * Manages calculation history, storage, and display
 */

class CalculatorHistory {
    constructor(maxHistoryItems = 50) {
        this.maxHistoryItems = maxHistoryItems;
        this.history = [];
        this.historyElement = null;
        this.historyPanel = null;
        this.storageKey = 'calculator-history';

        this.initialize();
    }

    /**
     * Initializes the history system
     */
    initialize() {
        try {
            this.setupHistoryElements();
            this.loadHistoryFromStorage();
            this.setupEventListeners();
            this.updateHistoryDisplay();

            console.log('Calculator history initialized successfully');
        } catch (error) {
            console.error('History initialization error:', error);
        }
    }

    /**
     * Sets up history DOM elements
     */
    setupHistoryElements() {
        try {
            this.historyElement = document.getElementById('history-list');
            this.historyPanel = document.getElementById('history-panel');

            if (!this.historyElement) {
                console.warn('History list element not found');
            }

            if (!this.historyPanel) {
                console.warn('History panel element not found');
            }
        } catch (error) {
            console.error('History elements setup error:', error);
        }
    }

    /**
     * Sets up event listeners for history functionality
     */
    setupEventListeners() {
        try {
            // History toggle button
            const historyBtn = document.getElementById('history-btn');
            if (historyBtn) {
                historyBtn.addEventListener('click', () => this.toggleHistoryPanel());
            }

            // Clear history button
            const clearHistoryBtn = document.getElementById('clear-history');
            if (clearHistoryBtn) {
                clearHistoryBtn.addEventListener('click', () => this.clearHistory());
            }

            // Close history panel when clicking outside
            document.addEventListener('click', (event) => {
                if (this.historyPanel &&
                    !this.historyPanel.contains(event.target) &&
                    !event.target.matches('#history-btn')) {
                    this.hideHistoryPanel();
                }
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', (event) => {
                if (event.ctrlKey && event.key === 'h') {
                    event.preventDefault();
                    this.toggleHistoryPanel();
                }
            });
        } catch (error) {
            console.error('History event listeners setup error:', error);
        }
    }

    /**
     * Adds a calculation to history
     * @param {Object} operation - Operation details
     */
    addToHistory(operation) {
        try {
            if (!operation || !this.isValidOperation(operation)) {
                console.warn('Invalid operation for history:', operation);
                return;
            }

            // Create history entry
            const historyEntry = {
                id: this.generateId(),
                operand1: operation.operand1,
                operator: operation.operator,
                operand2: operation.operand2,
                result: operation.result,
                expression: this.formatExpression(operation),
                timestamp: operation.timestamp || new Date(),
                displayValue: this.formatResult(operation.result)
            };

            // Add to beginning of history array
            this.history.unshift(historyEntry);

            // Limit history size
            if (this.history.length > this.maxHistoryItems) {
                this.history = this.history.slice(0, this.maxHistoryItems);
            }

            // Save to storage and update display
            this.saveHistoryToStorage();
            this.updateHistoryDisplay();

            console.log('Operation added to history:', historyEntry);
        } catch (error) {
            console.error('Add to history error:', error);
        }
    }

    /**
     * Validates operation object
     * @param {Object} operation - Operation to validate
     * @returns {boolean} - True if valid operation
     */
    isValidOperation(operation) {
        try {
            return operation &&
                   typeof operation.operand1 === 'number' &&
                   typeof operation.operator === 'string' &&
                   typeof operation.operand2 === 'number' &&
                   typeof operation.result === 'number' &&
                   ['+', '-', '*', '/'].includes(operation.operator);
        } catch (error) {
            console.error('Operation validation error:', error);
            return false;
        }
    }

    /**
     * Formats mathematical expression for display
     * @param {Object} operation - Operation details
     * @returns {string} - Formatted expression
     */
    formatExpression(operation) {
        try {
            const operatorSymbols = {
                '+': ' + ',
                '-': '  ',
                '*': '  ',
                '/': '  '
            };

            const symbol = operatorSymbols[operation.operator] || ` ${operation.operator} `;

            return `${this.formatNumber(operation.operand1)}${symbol}${this.formatNumber(operation.operand2)}`;
        } catch (error) {
            console.error('Expression formatting error:', error);
            return 'Invalid expression';
        }
    }

    /**
     * Formats number for display in history
     * @param {number} num - Number to format
     * @returns {string} - Formatted number
     */
    formatNumber(num) {
        try {
            if (!isFinite(num)) {
                return 'Error';
            }

            // Use utility formatter if available
            if (window.CalculatorUtils && window.CalculatorUtils.NumberFormatter) {
                return window.CalculatorUtils.NumberFormatter.formatForDisplay(num, 10);
            }

            // Fallback formatting
            if (Math.abs(num) >= 1e10) {
                return num.toExponential(4);
            }

            return num.toString();
        } catch (error) {
            console.error('Number formatting error:', error);
            return 'Error';
        }
    }

    /**
     * Formats result for display
     * @param {number} result - Result to format
     * @returns {string} - Formatted result
     */
    formatResult(result) {
        try {
            return this.formatNumber(result);
        } catch (error) {
            console.error('Result formatting error:', error);
            return 'Error';
        }
    }

    /**
     * Updates the history display in the DOM
     */
    updateHistoryDisplay() {
        try {
            if (!this.historyElement) return;

            // Clear existing content
            this.historyElement.innerHTML = '';

            if (this.history.length === 0) {
                this.showEmptyHistoryMessage();
                return;
            }

            // Create history items
            this.history.forEach(entry => {
                const historyItem = this.createHistoryItem(entry);
                this.historyElement.appendChild(historyItem);
            });
        } catch (error) {
            console.error('History display update error:', error);
        }
    }

    /**
     * Shows empty history message
     */
    showEmptyHistoryMessage() {
        try {
            if (!this.historyElement) return;

            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'history-empty';
            emptyMessage.textContent = 'No calculations yet';
            this.historyElement.appendChild(emptyMessage);
        } catch (error) {
            console.error('Empty history message error:', error);
        }
    }

    /**
     * Creates a DOM element for a history item
     * @param {Object} entry - History entry
     * @returns {HTMLElement} - History item element
     */
    createHistoryItem(entry) {
        try {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.dataset.historyId = entry.id;

            // Expression
            const expression = document.createElement('div');
            expression.className = 'history-expression';
            expression.textContent = entry.expression;

            // Result
            const result = document.createElement('div');
            result.className = 'history-result';
            result.textContent = `= ${entry.displayValue}`;

            // Timestamp
            const timestamp = document.createElement('div');
            timestamp.className = 'history-timestamp';
            timestamp.textContent = this.formatTimestamp(entry.timestamp);

            // Actions
            const actions = document.createElement('div');
            actions.className = 'history-actions';

            // Reuse button
            const reuseBtn = document.createElement('button');
            reuseBtn.className = 'history-reuse-btn';
            reuseBtn.textContent = '';
            reuseBtn.title = 'Use this result';
            reuseBtn.addEventListener('click', () => this.reuseHistoryItem(entry));

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'history-delete-btn';
            deleteBtn.textContent = '';
            deleteBtn.title = 'Delete from history';
            deleteBtn.addEventListener('click', () => this.deleteHistoryItem(entry.id));

            actions.appendChild(reuseBtn);
            actions.appendChild(deleteBtn);

            item.appendChild(expression);
            item.appendChild(result);
            item.appendChild(timestamp);
            item.appendChild(actions);

            return item;
        } catch (error) {
            console.error('History item creation error:', error);

            // Return minimal item on error
            const errorItem = document.createElement('div');
            errorItem.className = 'history-item error';
            errorItem.textContent = 'Error displaying history item';
            return errorItem;
        }
    }

    /**
     * Formats timestamp for display
     * @param {Date} timestamp - Timestamp to format
     * @returns {string} - Formatted timestamp
     */
    formatTimestamp(timestamp) {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffMins < 1) {
                return 'Just now';
            } else if (diffMins < 60) {
                return `${diffMins}m ago`;
            } else if (diffHours < 24) {
                return `${diffHours}h ago`;
            } else if (diffDays < 7) {
                return `${diffDays}d ago`;
            } else {
                return date.toLocaleDateString();
            }
        } catch (error) {
            console.error('Timestamp formatting error:', error);
            return 'Unknown time';
        }
    }

    /**
     * Reuses a history item result
     * @param {Object} entry - History entry to reuse
     */
    reuseHistoryItem(entry) {
        try {
            if (window.calculatorApp && window.calculatorApp.calculator) {
                // Set the result as current value
                window.calculatorApp.calculator.clearEntry();

                // Simulate inputting the result digits
                const resultStr = entry.result.toString();
                for (const char of resultStr) {
                    if (char >= '0' && char <= '9') {
                        window.calculatorApp.calculator.inputDigit(char);
                    } else if (char === '.') {
                        window.calculatorApp.calculator.inputDecimal();
                    }
                }

                // Update display
                if (window.calculatorApp.display) {
                    window.calculatorApp.display.setValue(entry.result);
                }

                // Hide history panel
                this.hideHistoryPanel();
            }
        } catch (error) {
            console.error('History item reuse error:', error);
        }
    }

    /**
     * Deletes a history item
     * @param {string} id - ID of history item to delete
     */
    deleteHistoryItem(id) {
        try {
            this.history = this.history.filter(entry => entry.id !== id);
            this.saveHistoryToStorage();
            this.updateHistoryDisplay();
        } catch (error) {
            console.error('History item deletion error:', error);
        }
    }

    /**
     * Clears all history
     */
    clearHistory() {
        try {
            this.history = [];
            this.saveHistoryToStorage();
            this.updateHistoryDisplay();
            console.log('History cleared');
        } catch (error) {
            console.error('Clear history error:', error);
        }
    }

    /**
     * Toggles history panel visibility
     */
    toggleHistoryPanel() {
        try {
            if (!this.historyPanel) return;

            const isVisible = this.historyPanel.classList.contains('visible');
            if (isVisible) {
                this.hideHistoryPanel();
            } else {
                this.showHistoryPanel();
            }
        } catch (error) {
            console.error('History panel toggle error:', error);
        }
    }

    /**
     * Shows history panel
     */
    showHistoryPanel() {
        try {
            if (!this.historyPanel) return;

            this.historyPanel.classList.add('visible');
            this.updateHistoryDisplay(); // Refresh display when showing
        } catch (error) {
            console.error('Show history panel error:', error);
        }
    }

    /**
     * Hides history panel
     */
    hideHistoryPanel() {
        try {
            if (!this.historyPanel) return;

            this.historyPanel.classList.remove('visible');
        } catch (error) {
            console.error('Hide history panel error:', error);
        }
    }

    /**
     * Saves history to local storage
     */
    saveHistoryToStorage() {
        try {
            const historyData = {
                history: this.history,
                timestamp: new Date().toISOString()
            };

            localStorage.setItem(this.storageKey, JSON.stringify(historyData));
        } catch (error) {
            console.error('Save history to storage error:', error);
        }
    }

    /**
     * Loads history from local storage
     */
    loadHistoryFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const historyData = JSON.parse(stored);
                if (historyData.history && Array.isArray(historyData.history)) {
                    this.history = historyData.history.slice(0, this.maxHistoryItems);
                }
            }
        } catch (error) {
            console.error('Load history from storage error:', error);
            this.history = []; // Reset to empty on error
        }
    }

    /**
     * Generates unique ID for history entries
     * @returns {string} - Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Gets current history
     * @returns {Array} - Current history array
     */
    getHistory() {
        try {
            return [...this.history];
        } catch (error) {
            console.error('Get history error:', error);
            return [];
        }
    }

    /**
     * Exports history as JSON
     * @returns {string} - JSON string of history
     */
    exportHistory() {
        try {
            return JSON.stringify(this.history, null, 2);
        } catch (error) {
            console.error('Export history error:', error);
            return '[]';
        }
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.CalculatorHistory = CalculatorHistory;
}

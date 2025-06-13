/**
 * Shared Utility Functions
 * Common functions used across multiple modules
 * Prevents code duplication and provides consistent behavior
 */

window.MazeUtils = {
    /**
     * Create a delay promise for async functions
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise} Promise that resolves after delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Generate random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Random integer
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Shuffle array in place using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} The same array, shuffled
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    /**
     * Check if coordinates are within maze bounds
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {number} width - Maze width
     * @param {number} height - Maze height
     * @returns {boolean} True if coordinates are valid
     */
    isValidCoordinate(x, y, width, height) {
        return x >= 0 && x < width && y >= 0 && y < height;
    },

    /**
     * Calculate Manhattan distance between two points
     * @param {number} x1 - First point X
     * @param {number} y1 - First point Y
     * @param {number} x2 - Second point X
     * @param {number} y2 - Second point Y
     * @returns {number} Manhattan distance
     */
    manhattanDistance(x1, y1, x2, y2) {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    },

    /**
     * Calculate Euclidean distance between two points
     * @param {number} x1 - First point X
     * @param {number} y1 - First point Y
     * @param {number} x2 - Second point X
     * @param {number} y2 - Second point Y
     * @returns {number} Euclidean distance
     */
    euclideanDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    },

    /**
     * Get the four cardinal direction neighbors of a cell
     * @param {number} x - Cell X coordinate
     * @param {number} y - Cell Y coordinate
     * @param {number} step - Step size (default 1)
     * @returns {Array} Array of neighbor coordinates
     */
    getCardinalNeighbors(x, y, step = 1) {
        return [
            { x: x, y: y - step, direction: 'north' },
            { x: x + step, y: y, direction: 'east' },
            { x: x, y: y + step, direction: 'south' },
            { x: x - step, y: y, direction: 'west' }
        ];
    },

    /**
     * Get all eight neighbors of a cell (including diagonals)
     * @param {number} x - Cell X coordinate
     * @param {number} y - Cell Y coordinate
     * @returns {Array} Array of neighbor coordinates
     */
    getAllNeighbors(x, y) {
        const neighbors = [];
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                neighbors.push({ x: x + dx, y: y + dy });
            }
        }
        return neighbors;
    },

    /**
     * Convert 2D maze coordinates to 3D world coordinates
     * @param {number} mazeX - Maze X coordinate
     * @param {number} mazeY - Maze Y coordinate
     * @param {Object} config - Configuration object with cellSize
     * @returns {Object} Object with x, z world coordinates
     */
    mazeToWorld(mazeX, mazeY, config = window.MazeConfig.threeD) {
        return {
            x: (mazeX - config.cellSize / 2) * config.cellSize,
            z: (mazeY - config.cellSize / 2) * config.cellSize
        };
    },

    /**
     * Convert 3D world coordinates to 2D maze coordinates
     * @param {number} worldX - World X coordinate
     * @param {number} worldZ - World Z coordinate
     * @param {Object} config - Configuration object with cellSize
     * @returns {Object} Object with x, y maze coordinates
     */
    worldToMaze(worldX, worldZ, config = window.MazeConfig.threeD) {
        return {
            x: Math.floor(worldX / config.cellSize + config.cellSize / 2),
            y: Math.floor(worldZ / config.cellSize + config.cellSize / 2)
        };
    },

    /**
     * Clamp a value between min and max
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped value
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Linear interpolation between two values
     * @param {number} a - Start value
     * @param {number} b - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    lerp(a, b, t) {
        return a + (b - a) * this.clamp(t, 0, 1);
    },

    /**
     * Format time in seconds to readable string
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time string
     */
    formatTime(seconds) {
        if (seconds < 1) {
            return `${Math.round(seconds * 1000)}ms`;
        } else if (seconds < 60) {
            return `${seconds.toFixed(1)}s`;
        } else {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.round(seconds % 60);
            return `${minutes}m ${remainingSeconds}s`;
        }
    },

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Deep clone an object (simple version)
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    /**
     * Calculate percentage with proper rounding
     * @param {number} value - Current value
     * @param {number} total - Total value
     * @param {number} decimals - Number of decimal places
     * @returns {number} Percentage
     */
    calculatePercentage(value, total, decimals = 1) {
        if (total === 0) return 0;
        return Math.round((value / total) * 100 * Math.pow(10, decimals)) / Math.pow(10, decimals);
    },

    /**
     * Log debug information if debug mode is enabled
     * @param {string} module - Module name
     * @param {string} message - Debug message
     * @param {*} data - Optional data to log
     */
    debug(module, message, data = null) {
        if (window.MazeConfig.performance.debugMode) {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] [${module}] ${message}`, data || '');
        }
    },

    /**
     * Performance measurement utility
     * @param {string} label - Performance label
     * @returns {Function} Function to call when measurement is complete
     */
    measurePerformance(label) {
        const start = performance.now();
        return () => {
            const end = performance.now();
            const duration = end - start;
            this.debug('Performance', `${label}: ${duration.toFixed(2)}ms`);
            return duration;
        };
    }
};

/**
 * Event Bus for Decoupled Component Communication
 * Allows modules to communicate without direct dependencies
 * Prevents tight coupling between UI, maze generation, and 3D rendering
 */

class EventBus {
    constructor() {
        this.events = {};
        this.debugMode = window.MazeConfig?.performance?.debugMode || false;
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Function to call when event is emitted
     * @param {Object} context - Optional context for callback
     */
    on(event, callback, context = null) {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push({
            callback: callback,
            context: context,
            id: this.generateId()
        });

        if (this.debugMode) {
            console.log(`EventBus: Subscribed to '${event}'`);
        }

        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    /**
     * Subscribe to an event only once
     * @param {string} event - Event name
     * @param {Function} callback - Function to call when event is emitted
     * @param {Object} context - Optional context for callback
     */
    once(event, callback, context = null) {
        const unsubscribe = this.on(event, (...args) => {
            unsubscribe();
            callback.apply(context, args);
        }, context);
        return unsubscribe;
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     */
    off(event, callback) {
        if (!this.events[event]) return;

        this.events[event] = this.events[event].filter(
            listener => listener.callback !== callback
        );

        if (this.events[event].length === 0) {
            delete this.events[event];
        }

        if (this.debugMode) {
            console.log(`EventBus: Unsubscribed from '${event}'`);
        }
    }

    /**
     * Remove all listeners for an event
     * @param {string} event - Event name
     */
    removeAllListeners(event) {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }
    }

    /**
     * Emit an event to all subscribers
     * @param {string} event - Event name
     * @param {*} data - Data to pass to callbacks
     */
    emit(event, data) {
        if (this.debugMode) {
            console.log(`EventBus: Emitting '${event}'`, data);
        }

        if (!this.events[event]) return;

        // Create a copy of listeners to avoid issues if listeners are modified during emission
        const listeners = [...this.events[event]];

        listeners.forEach(listener => {
            try {
                if (listener.context) {
                    listener.callback.call(listener.context, data);
                } else {
                    listener.callback(data);
                }
            } catch (error) {
                console.error(`EventBus: Error in event listener for '${event}':`, error);
            }
        });
    }

    /**
     * Get number of listeners for an event
     * @param {string} event - Event name
     * @returns {number} Number of listeners
     */
    listenerCount(event) {
        return this.events[event] ? this.events[event].length : 0;
    }

    /**
     * Get all event names that have listeners
     * @returns {Array<string>} Array of event names
     */
    eventNames() {
        return Object.keys(this.events);
    }

    /**
     * Generate unique ID for listeners
     * @returns {string} Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Debug helper to log all current listeners
     */
    debugListeners() {
        console.log('EventBus Current Listeners:', this.events);
    }
}

// Create global event bus instance
window.EventBus = new EventBus();

// Convenience methods for maze-specific events
window.EventBus.maze = {
    /**
     * Emit maze generation started event
     * @param {string} algorithm - Algorithm being used
     * @param {Object} config - Generation configuration
     */
    generationStarted(algorithm, config) {
        window.EventBus.emit(window.MazeConfig.events.MAZE_GENERATION_START, {
            algorithm,
            config,
            timestamp: Date.now()
        });
    },

    /**
     * Emit maze generation progress event
     * @param {number} percentage - Progress percentage (0-100)
     * @param {number} steps - Current step count
     * @param {Object} currentState - Current maze state
     */
    generationProgress(percentage, steps, currentState) {
        window.EventBus.emit(window.MazeConfig.events.MAZE_GENERATION_PROGRESS, {
            percentage,
            steps,
            currentState,
            timestamp: Date.now()
        });
    },

    /**
     * Emit maze generation completed event
     * @param {Object} maze - Completed maze data
     * @param {Object} stats - Generation statistics
     */
    generationCompleted(maze, stats) {
        window.EventBus.emit(window.MazeConfig.events.MAZE_GENERATION_COMPLETE, {
            maze,
            stats,
            timestamp: Date.now()
        });
    },

    /**
     * Emit maze reset event
     */
    reset() {
        window.EventBus.emit(window.MazeConfig.events.MAZE_RESET, {
            timestamp: Date.now()
        });
    }
};

// UI-specific convenience methods
window.EventBus.ui = {
    /**
     * Emit algorithm changed event
     * @param {string} algorithm - New algorithm name
     * @param {Object} algorithmConfig - Algorithm configuration
     */
    algorithmChanged(algorithm, algorithmConfig) {
        window.EventBus.emit(window.MazeConfig.events.ALGORITHM_CHANGED, {
            algorithm,
            algorithmConfig,
            timestamp: Date.now()
        });
    },

    /**
     * Emit view mode changed event
     * @param {string} mode - New view mode ('2d' or '3d')
     */
    viewModeChanged(mode) {
        window.EventBus.emit(window.MazeConfig.events.VIEW_MODE_CHANGED, {
            mode,
            timestamp: Date.now()
        });
    },

    /**
     * Emit speed changed event
     * @param {number} speed - New speed value (1-10)
     */
    speedChanged(speed) {
        window.EventBus.emit(window.MazeConfig.events.SPEED_CHANGED, {
            speed,
            timestamp: Date.now()
        });
    },

    /**
     * Emit camera changed event
     * @param {string} cameraType - New camera type
     * @param {Object} cameraData - Camera configuration
     */
    cameraChanged(cameraType, cameraData) {
        window.EventBus.emit(window.MazeConfig.events.CAMERA_CHANGED, {
            cameraType,
            cameraData,
            timestamp: Date.now()
        });
    }
};

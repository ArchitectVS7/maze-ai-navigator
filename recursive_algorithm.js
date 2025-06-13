/**
 * Recursive Backtracking Maze Generation Algorithm
 * Creates perfect mazes with exactly one solution between any two points
 * Uses depth-first search with backtracking
 */

class RecursiveBacktrackingAlgorithm {
    constructor(maze, config = {}) {
        this.maze = maze;
        this.config = {
            ...window.MazeConfig.algorithms.recursive,
            ...config
        };
        this.stack = [];
        this.current = null;
        this.isComplete = false;
        this.stepCount = 0;
    }

    /**
     * Initialize the algorithm
     * Sets starting position and marks initial cell
     */
    initialize() {
        // Start from position (1,1) to ensure odd coordinates
        this.current = { x: 1, y: 1 };
        this.maze.setCell(this.current.x, this.current.y, {
            wall: false,
            visited: true,
            current: true,
            path: false
        });
        this.stack = [];
        this.isComplete = false;
        this.stepCount = 0;
        
        window.MazeUtils.debug('RecursiveBacktracking', 'Algorithm initialized', this.current);
    }

    /**
     * Execute one step of the algorithm
     * @returns {Object} Step result with completion status and current state
     */
    step() {
        if (this.isComplete) {
            return { complete: true, current: this.current };
        }

        const neighbors = this.getUnvisitedNeighbors(this.current.x, this.current.y);
        
        if (neighbors.length > 0) {
            // Choose random neighbor
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            
            // Remove wall between current and next cell
            const wallX = this.current.x + (next.x - this.current.x) / 2;
            const wallY = this.current.y + (next.y - this.current.y) / 2;
            
            // Clear the wall
            this.maze.setCell(wallX, wallY, {
                wall: false,
                visited: true,
                current: false,
                path: true
            });
            
            // Mark next cell as visited
            this.maze.setCell(next.x, next.y, {
                wall: false,
                visited: true,
                current: false,
                path: false
            });
            
            // Push current to stack for backtracking
            this.stack.push(this.current);
            
            // Clear current cell marker
            this.maze.setCell(this.current.x, this.current.y, {
                wall: false,
                visited: true,
                current: false,
                path: true
            });
            
            // Move to next cell
            this.current = next;
            this.maze.setCell(this.current.x, this.current.y, {
                wall: false,
                visited: true,
                current: true,
                path: false
            });
            
        } else if (this.stack.length > 0) {
            // Backtrack
            this.maze.setCell(this.current.x, this.current.y, {
                wall: false,
                visited: true,
                current: false,
                path: true
            });
            
            this.current = this.stack.pop();
            this.maze.setCell(this.current.x, this.current.y, {
                wall: false,
                visited: true,
                current: true,
                path: true
            });
        } else {
            // Algorithm complete
            this.maze.setCell(this.current.x, this.current.y, {
                wall: false,
                visited: true,
                current: false,
                path: true
            });
            this.isComplete = true;
            
            window.MazeUtils.debug('RecursiveBacktracking', 'Algorithm completed', {
                steps: this.stepCount,
                current: this.current
            });
        }
        
        this.stepCount++;
        return { 
            complete: this.isComplete, 
            current: this.current, 
            step: this.stepCount,
            stackSize: this.stack.length
        };
    }

    /**
     * Get unvisited neighbors for a given cell
     * @param {number} x - Cell X coordinate
     * @param {number} y - Cell Y coordinate
     * @returns {Array} Array of unvisited neighbor coordinates
     */
    getUnvisitedNeighbors(x, y) {
        const neighbors = [];
        const step = this.config.stepSize;
        
        // Check four cardinal directions
        const directions = [
            { x: x, y: y - step },      // North
            { x: x + step, y: y },      // East
            { x: x, y: y + step },      // South
            { x: x - step, y: y }       // West
        ];
        
        for (let dir of directions) {
            if (window.MazeUtils.isValidCoordinate(dir.x, dir.y, this.maze.width, this.maze.height)) {
                const cell = this.maze.getCell(dir.x, dir.y);
                if (!cell.visited) {
                    neighbors.push(dir);
                }
            }
        }
        
        return neighbors;
    }

    /**
     * Generate complete maze using this algorithm
     * @param {Function} progressCallback - Callback for progress updates
     * @param {number} animationSpeed - Speed of animation (1-10)
     * @returns {Promise} Promise that resolves when generation is complete
     */
    async generate(progressCallback = null, animationSpeed = 5) {
        const startTime = performance.now();
        this.initialize();
        
        const totalCells = Math.floor((this.maze.width * this.maze.height) / 4);
        let processedCells = 0;
        
        while (!this.isComplete) {
            const result = this.step();
            processedCells++;
            
            // Call progress callback if provided
            if (progressCallback) {
                const percentage = (processedCells / totalCells) * 100;
                progressCallback(percentage, this.stepCount, result);
            }
            
            // Animation delay based on speed
            const delay = window.MazeConfig.maze.animationDelayMax - 
                         (animationSpeed - 1) * (window.MazeConfig.maze.animationDelayMax - window.MazeConfig.maze.animationDelayBase) / 9;
            await window.MazeUtils.delay(delay);
        }
        
        const endTime = performance.now();
        const generationTime = (endTime - startTime) / 1000;
        
        window.MazeUtils.debug('RecursiveBacktracking', 'Generation completed', {
            steps: this.stepCount,
            time: generationTime,
            cellsProcessed: processedCells
        });
        
        return {
            algorithm: 'recursive',
            steps: this.stepCount,
            time: generationTime,
            cellsProcessed: processedCells
        };
    }

    /**
     * Get algorithm information
     * @returns {Object} Algorithm description and properties
     */
    getInfo() {
        return {
            name: this.config.name,
            description: this.config.description,
            guaranteesSolution: this.config.guaranteesSolution,
            createLoops: this.config.createLoops,
            stepSize: this.config.stepSize,
            currentStep: this.stepCount,
            isComplete: this.isComplete,
            stackSize: this.stack.length
        };
    }

    /**
     * Reset algorithm state
     */
    reset() {
        this.stack = [];
        this.current = null;
        this.isComplete = false;
        this.stepCount = 0;
        
        window.MazeUtils.debug('RecursiveBacktracking', 'Algorithm reset');
    }

    /**
     * Get current algorithm state for debugging
     * @returns {Object} Current state information
     */
    getState() {
        return {
            current: this.current,
            stackSize: this.stack.length,
            stepCount: this.stepCount,
            isComplete: this.isComplete
        };
    }
}

// Register algorithm globally
window.RecursiveBacktrackingAlgorithm = RecursiveBacktrackingAlgorithm;
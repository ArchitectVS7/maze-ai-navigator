/**
 * Global Configuration Settings
 * Centralized configuration prevents magic numbers scattered throughout code
 * Easy to adjust performance and behavior from one location
 */

window.MazeConfig = {
    // Maze Generation Settings
    maze: {
        defaultWidth: 31,           // Must be odd for proper maze structure
        defaultHeight: 31,          // Must be odd for proper maze structure
        minSize: 11,               // Minimum maze dimension
        maxSize: 51,               // Maximum maze dimension
        cellSize: 20,              // Default cell size for 2D rendering
        animationDelayBase: 50,    // Base delay for animation (ms)
        animationDelayMax: 500     // Maximum delay for slow animation
    },

    // 3D Rendering Settings
    threeD: {
        wallHeight: 3,             // Height of maze walls in 3D space
        cellSize: 4,               // Size of each maze cell in 3D units
        playerHeight: 1.8,         // Camera height for first-person view
        cameraDistance: 50,        // Distance for overhead camera
        lightIntensity: 0.8,       // Ambient light intensity
        enableShadows: false,      // Enable shadows (performance impact)
        fogDensity: 0.01,         // Fog density for atmosphere
        renderDistance: 100        // Maximum render distance
    },

    // UI Settings
    ui: {
        canvasWidth: 600,          // Default canvas width
        canvasHeight: 600,         // Default canvas height
        progressUpdateInterval: 50, // How often to update progress (ms)
        statUpdateInterval: 100,   // How often to update statistics (ms)
        fadeAnimationDuration: 300, // UI fade animation duration (ms)
        buttonClickDuration: 150   // Button press animation duration (ms)
    },

    // Color Schemes
    colors: {
        // 2D Maze Colors
        background: '#000000',
        wall: '#333333',
        path: '#ffffff',
        current: '#ff4444',
        visited: '#4444ff',
        pathGenerated: '#44ff44',
        border: '#666666',

        // 3D Material Colors
        wallMaterial: 0x8B4513,    // Brown walls
        floorMaterial: 0x2F4F2F,   // Dark green floor
        currentMaterial: 0xFF4444,  // Red for current position
        pathMaterial: 0x90EE90,    // Light green for paths
        skyColor: 0x87CEEB         // Sky blue background
    },

    // Algorithm Settings
    algorithms: {
        recursive: {
            name: 'Recursive Backtracking',
            description: 'Creates perfect mazes with exactly one solution between any two points. Uses depth-first search with backtracking to carve paths through a grid of walls.',
            stepSize: 2,           // Step size for maze generation
            guaranteesSolution: true,
            createLoops: false
        },
        kruskal: {
            name: "Modified Kruskal's Algorithm",
            description: 'Generates mazes with multiple paths and loops by treating cells as graph nodes and randomly connecting them while avoiding cycles initially, then adding some back.',
            loopProbability: 0.1,  // Probability of adding extra connections
            guaranteesSolution: true,
            createLoops: true
        },
        cellular: {
            name: 'Cellular Automata',
            description: 'Creates organic, cave-like structures by starting with random noise and applying local rules based on neighbor counts over multiple iterations.',
            iterations: 5,         // Number of CA iterations
            initialWallProbability: 0.45, // Initial random wall probability
            wallThreshold: 4,      // Neighbor threshold for walls
            guaranteesSolution: false, // May create unreachable areas
            createLoops: true
        }
    },

    // Performance Settings
    performance: {
        maxAnimationSteps: 1000,   // Maximum steps before skipping animation
        frameRateTarget: 30,       // Target frame rate for 3D rendering
        enableOptimizations: true, // Enable performance optimizations
        debugMode: false           // Enable debug logging
    },

    // Event Names (prevents typos in event handling)
    events: {
        MAZE_GENERATION_START: 'maze:generation:start',
        MAZE_GENERATION_PROGRESS: 'maze:generation:progress',
        MAZE_GENERATION_COMPLETE: 'maze:generation:complete',
        MAZE_RESET: 'maze:reset',
        ALGORITHM_CHANGED: 'algorithm:changed',
        VIEW_MODE_CHANGED: 'view:mode:changed',
        SPEED_CHANGED: 'speed:changed',
        CAMERA_CHANGED: 'camera:changed'
    }
};

// Freeze configuration to prevent accidental modification
Object.freeze(window.MazeConfig);

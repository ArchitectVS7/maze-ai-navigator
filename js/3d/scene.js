/**
 * 3D Scene Management for Maze Visualization
 * Handles Three.js scene setup, rendering, and maze conversion
 * Independent module that can be easily modified without affecting other components
 */

class MazeScene3D {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.maze = null;
        this.meshes = [];
        this.animationId = null;
        this.isInitialized = false;
        
        // Configuration
        this.config = window.MazeConfig.threeD;
        
        this.initialize();
        this.setupEventListeners();
    }

    /**
     * Initialize Three.js scene
     */
    initialize() {
        try {
            // Create scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(this.config.skyColor);
            
            // Setup renderer
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true,
                alpha: true 
            });
            this.renderer.setSize(
                this.container.clientWidth, 
                this.container.clientHeight
            );
            this.renderer.shadowMap.enabled = this.config.enableShadows;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
            // Add renderer to container
            this.container.appendChild(this.renderer.domElement);
            
            // Setup camera
            this.setupCamera();
            
            // Setup lighting
            this.setupLighting();
            
            // Setup fog for atmosphere
            if (this.config.fogDensity > 0) {
                this.scene.fog = new THREE.FogExp2(0x000000, this.config.fogDensity);
            }
            
            this.isInitialized = true;
            this.startRenderLoop();
            
            window.MazeUtils.debug('MazeScene3D', 'Scene initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize 3D scene:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Setup camera with default perspective view
     */
    setupCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, this.config.renderDistance);
        
        // Default overhead view
        this.setCameraView('overhead');
    }

    /**
     * Setup scene lighting
     */
    setupLighting() {
        // Ambient light for general illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, this.config.lightIntensity);
        this.scene.add(ambientLight);
        
        // Directional light for shadows and depth
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = this.config.enableShadows;
        
        if (this.config.enableShadows) {
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 100;
        }
        
        this.scene.add(directionalLight);
    }

    /**
     * Convert 2D maze to 3D scene
     * @param {Object} mazeData - 2D maze data structure
     */
    loadMaze(mazeData) {
        this.maze = mazeData;
        this.clearMeshes();
        
        if (!this.isInitialized) {
            console.warn('Scene not initialized, cannot load maze');
            return;
        }
        
        const geometryBuilder = new window.MazeGeometry3D(this.config);
        const materialManager = new window.MazeMaterials3D(this.config);
        
        // Generate floor
        const floorMesh = geometryBuilder.createFloor(mazeData.width, mazeData.height);
        floorMesh.material = materialManager.getFloorMaterial();
        floorMesh.receiveShadow = this.config.enableShadows;
        this.scene.add(floorMesh);
        this.meshes.push(floorMesh);
        
        // Generate walls
        const wallMeshes = geometryBuilder.createWalls(mazeData);
        wallMeshes.forEach(wallMesh => {
            wallMesh.material = materialManager.getWallMaterial();
            wallMesh.castShadow = this.config.enableShadows;
            wallMesh.receiveShadow = this.config.enableShadows;
            this.scene.add(wallMesh);
            this.meshes.push(wallMesh);
        });
        
        // Generate path indicators for visualization
        this.updatePathVisualization();
        
        // Adjust camera to fit maze
        this.fitCameraToMaze();
        
        window.MazeUtils.debug('MazeScene3D', 'Maze loaded into 3D scene', {
            wallCount: wallMeshes.length,
            mazeSize: `${mazeData.width}x${mazeData.height}`
        });
    }

    /**
     * Update path visualization based on current maze state
     */
    updatePathVisualization() {
        if (!this.maze) return;
        
        // Remove existing path indicators
        this.meshes = this.meshes.filter(mesh => {
            if (mesh.userData.isPathIndicator) {
                this.scene.remove(mesh);
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) mesh.material.dispose();
                return false;
            }
            return true;
        });
        
        const geometryBuilder = new window.MazeGeometry3D(this.config);
        const materialManager = new window.MazeMaterials3D(this.config);
        
        // Add path indicators for current generation state
        for (let y = 0; y < this.maze.height; y++) {
            for (let x = 0; x < this.maze.width; x++) {
                const cell = this.maze.grid[y][x];
                
                if (cell.current) {
                    // Current position indicator
                    const indicator = geometryBuilder.createPathIndicator(x, y, 'current');
                    indicator.material = materialManager.getCurrentMaterial();
                    indicator.userData.isPathIndicator = true;
                    this.scene.add(indicator);
                    this.meshes.push(indicator);
                } else if (cell.path) {
                    // Generated path indicator
                    const indicator = geometryBuilder.createPathIndicator(x, y, 'path');
                    indicator.material = materialManager.getPathMaterial();
                    indicator.userData.isPathIndicator = true;
                    this.scene.add(indicator);
                    this.meshes.push(indicator);
                }
            }
        }
    }

    /**
     * Set camera view mode
     * @param {string} viewMode - 'overhead', 'perspective', or 'first-person'
     */
    setCameraView(viewMode) {
        if (!this.camera) return;
        
        const mazeCenter = this.getMazeCenter();
        
        switch (viewMode) {
            case 'overhead':
                this.camera.position.set(
                    mazeCenter.x, 
                    this.config.cameraDistance, 
                    mazeCenter.z
                );
                this.camera.lookAt(mazeCenter.x, 0, mazeCenter.z);
                break;
                
            case 'perspective':
                this.camera.position.set(
                    mazeCenter.x + this.config.cameraDistance * 0.7,
                    this.config.cameraDistance * 0.5,
                    mazeCenter.z + this.config.cameraDistance * 0.7
                );
                this.camera.lookAt(mazeCenter.x, 0, mazeCenter.z);
                break;
                
            case 'first-person':
                this.camera.position.set(
                    mazeCenter.x,
                    this.config.playerHeight,
                    mazeCenter.z
                );
                this.camera.lookAt(
                    mazeCenter.x + 1,
                    this.config.playerHeight,
                    mazeCenter.z
                );
                break;
        }
        
        window.MazeUtils.debug('MazeScene3D', `Camera set to ${viewMode} view`);
    }

    /**
     * Calculate center point of the maze
     * @returns {Object} Center coordinates {x, y, z}
     */
    getMazeCenter() {
        if (!this.maze) {
            return { x: 0, y: 0, z: 0 };
        }
        
        return {
            x: (this.maze.width * this.config.cellSize) / 2,
            y: 0,
            z: (this.maze.height * this.config.cellSize) / 2
        };
    }

    /**
     * Fit camera to show entire maze
     */
    fitCameraToMaze() {
        if (!this.maze || !this.camera) return;
        
        const maxDimension = Math.max(this.maze.width, this.maze.height);
        const distance = maxDimension * this.config.cellSize * 0.8;
        
        this.config.cameraDistance = distance;
        this.setCameraView('overhead');
    }

    /**
     * Start the render loop
     */
    startRenderLoop() {
        const animate = () => {
            this.animationId = requestAnimationFrame(animate);
            
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            }
        };
        
        animate();
    }

    /**
     * Stop the render loop
     */
    stopRenderLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Clear all meshes from the scene
     */
    clearMeshes() {
        this.meshes.forEach(mesh => {
            this.scene.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material.forEach(material => material.dispose());
                } else {
                    mesh.material.dispose();
                }
            }
        });
        this.meshes = [];
    }

    /**
     * Handle window resize
     */
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Listen for maze generation events
        window.EventBus.on(window.MazeConfig.events.MAZE_GENERATION_PROGRESS, (data) => {
            if (this.maze) {
                this.updatePathVisualization();
            }
        });
        
        window.EventBus.on(window.MazeConfig.events.MAZE_GENERATION_COMPLETE, (data) => {
            this.loadMaze(data.maze);
        });
        
        window.EventBus.on(window.MazeConfig.events.CAMERA_CHANGED, (data) => {
            this.setCameraView(data.cameraType);
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    }

    /**
     * Dispose of all resources
     */
    dispose() {
        this.stopRenderLoop();
        this.clearMeshes();
        
        if (this.renderer) {
            this.renderer.dispose();
            if (this.container.contains(this.renderer.domElement)) {
                this.container.removeChild(this.renderer.domElement);
            }
        }
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.maze = null;
        this.isInitialized = false;
        
        window.MazeUtils.debug('MazeScene3D', 'Scene disposed');
    }
}

// Register globally
window.MazeScene3D = MazeScene3D;

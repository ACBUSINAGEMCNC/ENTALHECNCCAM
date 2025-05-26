"use client"

import { useRef, useEffect } from "react"
import type { SimulationFrame } from "@/types/simulation"
import { updateAngleIndicator, updatePositionIndicator } from "@/lib/indicators"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

interface Canvas3DProps {
  simulationFrames: SimulationFrame[]
  currentFrame: number
}

/**
 * 3D Canvas visualization component
 * Renders the tool path and current position in 3D using Three.js
 */
export function Canvas3D({ simulationFrames, currentFrame }: Canvas3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const toolRef = useRef<THREE.Group | null>(null)
  const axesRef = useRef<THREE.AxesHelper | null>(null)
  const gridRef = useRef<THREE.GridHelper | null>(null)

  // Add legend for G0/G1
  const addLegend = () => {
    if (!sceneRef.current) return;
    
    // Remove existing legend
    sceneRef.current.children.forEach(child => {
      if (child.userData.isLegend) {
        sceneRef.current!.remove(child);
      }
    });
    
    // G0 legend (red)
    const g0Line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-90, 80, 0),
        new THREE.Vector3(-70, 80, 0)
      ]),
      new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 4 })
    );
    g0Line.userData.isLegend = true;
    
    // G1 legend (blue)
    const g1Line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-90, 70, 0),
        new THREE.Vector3(-70, 70, 0)
      ]),
      new THREE.LineBasicMaterial({ color: 0x00aaff, linewidth: 3 })
    );
    g1Line.userData.isLegend = true;
    
    // Add to scene
    sceneRef.current.add(g0Line);
    sceneRef.current.add(g1Line);
  };
  
  // Initialize 3D scene with correct CNC axes
  useEffect(() => {
    if (!containerRef.current) return;

    // Clear existing content
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x121212);
    sceneRef.current = scene;

    // Camera setup - view aligned with standard CNC coordinates
    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.set(150, -150, 150); // View from top-front-right
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Correct CNC coordinate system:
    // X: Red (right/left)
    // Y: Blue (up/down) - This will be our vertical axis
    // Z: Green (front/back) - This will rotate around Y (A-axis)

    // Main grid (X-Z plane - horizontal floor)
    const grid = new THREE.GridHelper(200, 20, 0x555555, 0x333333);
    scene.add(grid);

    // Vertical grid (X-Y plane)
    const verticalGrid = new THREE.GridHelper(200, 20, 0x444444, 0x222222);
    verticalGrid.rotation.x = Math.PI / 2;
    scene.add(verticalGrid);

    // Axes helper with CNC standard colors
    const axesHelper = new THREE.AxesHelper(50);
    scene.add(axesHelper);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create tool representation (for A-axis rotation)
    const toolGroup = new THREE.Group();
    
    // Tool geometry (arrow for direction)
    const toolGeometry = new THREE.CylinderGeometry(0.5, 0, 5, 8);
    const toolMaterial = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const toolArrow = new THREE.Mesh(toolGeometry, toolMaterial);
    toolArrow.rotation.x = Math.PI / 2;
    toolArrow.position.y = 5;
    
    toolGroup.add(toolArrow);
    scene.add(toolGroup);
    toolRef.current = toolGroup;

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current!);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Progressively build the tool path during simulation
  useEffect(() => {
    // Add legend
    addLegend();
    if (!sceneRef.current || !simulationFrames.length || currentFrame === undefined) return;

    // Clear previous tool paths
    sceneRef.current.children.forEach(child => {
      if (child.userData.isToolPath) {
        sceneRef.current!.remove(child);
      }
    });

    // Define types for our segments
    interface PathSegment {
      points: THREE.Vector3[];
      isG0: boolean;
    }

    // Create segmented path with G0/G1 coloring up to current frame
    const lineSegments: PathSegment[] = [];
    let currentSegment: THREE.Vector3[] = [];
    let currentMode = '';
    
    // Only process frames up to the current frame
    const visibleFrames = simulationFrames.slice(0, currentFrame + 1);
    
    visibleFrames.forEach((frame: SimulationFrame & { gCode?: string }, index) => {
      const angle = frame.a * (Math.PI / 180);
      const x = frame.x * Math.cos(angle) - frame.y * Math.sin(angle);
      const y = frame.x * Math.sin(angle) + frame.y * Math.cos(angle);
      const z = frame.z;
      
      // Detect G0/G1 changes (fallback to G1 if not specified, case insensitive)
      const frameGCode = (frame.gCode || 'G1').toUpperCase();
      if (frameGCode !== currentMode) {
        if (currentSegment.length > 0) {
          lineSegments.push({
            points: currentSegment,
            isG0: currentMode === 'G0'
          });
        }
        currentSegment = [];
        currentMode = frameGCode;
      }
      
      currentSegment.push(new THREE.Vector3(x, z, y));
      
      // Add last segment
      if (index === visibleFrames.length - 1) {
        lineSegments.push({
          points: currentSegment,
          isG0: currentMode === 'G0'
        });
      }
    });

    // Create lines with appropriate colors
    lineSegments.forEach(segment => {
      if (segment.points.length > 1 && sceneRef.current) {
        const geometry = new THREE.BufferGeometry().setFromPoints(segment.points);
        const material = new THREE.LineBasicMaterial({
          color: segment.isG0 ? 0xff0000 : 0x00aaff, // Strong red for G0, blue for G1
          linewidth: segment.isG0 ? 4 : 3 // Thicker line for G0
        });
        const line = new THREE.Line(geometry, material);
        line.userData.isToolPath = true;
        sceneRef.current.add(line);
      }
    });

    // Update current position
    if (currentFrame !== undefined && currentFrame < simulationFrames.length) {
      const frame = simulationFrames[currentFrame];
      const angle = frame.a * (Math.PI / 180);
      
      // Calculate rotated position
      const x = frame.x * Math.cos(angle) - frame.y * Math.sin(angle);
      const y = frame.x * Math.sin(angle) + frame.y * Math.cos(angle);
      const z = frame.z;
      
      // Update indicators with original values
      updatePositionIndicator(frame.x, frame.y, frame.z);
      updateAngleIndicator(frame.a);
      
      // Highlight current position (rotated)
      // Determine if this is a G0 movement
      const isG0Movement = ((frame as any).gCode || 'G1').toUpperCase() === 'G0';
      
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(3, 16, 16),
        new THREE.MeshBasicMaterial({ 
          color: isG0Movement ? 0xff0000 : 0x00aaff // Match line color
        })
      );
      sphere.position.set(x, z, y); // Note: Y and Z swapped for correct display
      sphere.userData.isToolPath = true;
      sceneRef.current.add(sphere);
    }
  }, [simulationFrames, currentFrame]);

  return (
    <>
      <div ref={containerRef} className="w-full h-full" />
      <div className="angle-display absolute top-2 right-5 px-3 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 shadow-sm text-center font-bold text-lg" id="angleDisplayTop">
        A: 0.0°
      </div>
      <div className="angle-indicator absolute top-14 right-5 w-[100px] h-[100px] rounded-full border-2 border-gray-700 bg-white/80 overflow-hidden">
        <div className="angle-fill absolute inset-0 bg-primary/20 origin-center" id="angleFill"></div>
        <div className="angle-center absolute top-1/2 left-1/2 w-[10px] h-[10px] bg-gray-700 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        <div
          className="angle-needle absolute top-1/2 left-1/2 w-[45px] h-[2px] bg-primary origin-left"
          id="angleNeedle"
        ></div>
        <div
          className="angle-value absolute -bottom-[25px] left-0 w-full text-center text-xs font-bold"
          id="angleValue"
        >
          0°
        </div>
      </div>
      <div
        className="position-indicator absolute bottom-2 left-2 bg-white/90 px-2 py-1 rounded text-xs border border-gray-300"
        id="positionIndicator"
      >
        X: 0.00 | Y: 0.00 | Z: 0.00
      </div>
    </>
  )
}

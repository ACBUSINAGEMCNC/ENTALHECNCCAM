"use client"

import { useRef, useEffect } from "react"
import type { SimulationFrame } from "@/types/simulation"
import { updateAngleIndicator, updatePositionIndicator } from "@/lib/indicators"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

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

  // Initialize 3D scene
  useEffect(() => {
    if (!containerRef.current) return

    // Clear any existing content
    containerRef.current.innerHTML = ""

    // Create scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f0f0)
    sceneRef.current = scene

    // Create camera
    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
    camera.position.set(100, 100, 100) // Position camera at a good viewing angle
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Create renderer with clear configuration
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: false 
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setClearColor(0xf0f0f0, 1) // Explicit clear color
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)
    
    // Add directional light for better depth perception
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(1, 1, 1)
    scene.add(directionalLight)

    // Add axes helper - colored arrows showing X,Y,Z directions
    const axesHelper = new THREE.AxesHelper(50)
    scene.add(axesHelper)

    // Add grid on XZ plane
    const gridHelper = new THREE.GridHelper(200, 20, 0x888888, 0x444444)
    scene.add(gridHelper)

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.screenSpacePanning = true
    controlsRef.current = controls

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)

      if (controlsRef.current) {
        controlsRef.current.update()
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return

      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      cameraRef.current.aspect = width / height
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      if (rendererRef.current && rendererRef.current.domElement && rendererRef.current.domElement.parentNode) {
        rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement)
      }

      // Dispose of Three.js resources
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
    }
  }, [])

  // Create or update trajectory lines when simulation frames change
  useEffect(() => {
    if (!sceneRef.current || simulationFrames.length === 0) return

    // Update position and angle indicators
    if (currentFrame < simulationFrames.length) {
      const frame = simulationFrames[currentFrame]
      updatePositionIndicator(frame.x || 0, frame.y, frame.z)
      updateAngleIndicator(frame.a)
    }

    // Clean up scene - remove all objects except grid, axes and lights
    const objectsToRemove: THREE.Object3D[] = [];
    sceneRef.current.children.forEach((child) => {
      // Keep only the grid, axes helper, and lights
      const isGrid = child instanceof THREE.GridHelper;
      const isAxes = child instanceof THREE.AxesHelper;
      const isLight = child instanceof THREE.Light;
      
      // Remove everything else (any tool paths, cylinders, or other objects)
      if (!isGrid && !isAxes && !isLight) {
        objectsToRemove.push(child);
      }
    });
    
    // Remove the identified objects
    objectsToRemove.forEach((obj) => {
      sceneRef.current?.remove(obj);
    });

    // Separate points by command type
    const g0Points: THREE.Vector3[] = []
    const g1Points: THREE.Vector3[] = []

    simulationFrames.forEach((frame) => {
      // Use proper CNC machine coordinates:
      // X and Y are horizontal, Z is vertical (up)
      const point = new THREE.Vector3(frame.x || 0, frame.z, frame.y)

      if (frame.cmd === "G0") {
        g0Points.push(point)
      } else if (frame.cmd === "G1") {
        g1Points.push(point)
      }
    })

    // Create G0 (rapid) lines with enhanced visibility
    if (g0Points.length > 1) {
      // Create thicker blue line for rapid moves
      const g0Material = new THREE.LineBasicMaterial({ color: 0x0066cc, linewidth: 3 })
      const g0Geometry = new THREE.BufferGeometry().setFromPoints(g0Points)
      const g0Line = new THREE.Line(g0Geometry, g0Material)
      ;(g0Line as any).isLine = true
      sceneRef.current.add(g0Line)
    }

    // Create G1 (cutting) lines with enhanced visibility
    if (g1Points.length > 1) {
      // Create thicker red line for cutting moves
      const g1Material = new THREE.LineBasicMaterial({ color: 0xcc0000, linewidth: 4 })
      const g1Geometry = new THREE.BufferGeometry().setFromPoints(g1Points)
      const g1Line = new THREE.Line(g1Geometry, g1Material)
      ;(g1Line as any).isLine = true
      sceneRef.current.add(g1Line)
    }
  }, [simulationFrames, currentFrame])

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

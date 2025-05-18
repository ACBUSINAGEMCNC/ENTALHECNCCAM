"use client"

import { useRef, useEffect } from "react"
import type { SimulationFrame } from "@/types/simulation"
import { updateAngleIndicator, updatePositionIndicator } from "@/lib/indicators"

interface Canvas2DProps {
  simulationFrames: SimulationFrame[]
  currentFrame: number
  zoomLevel: number
  setZoomLevel: (zoom: number) => void
}

/**
 * 2D Canvas visualization component
 * Renders the tool path and current position in 2D
 */
export function Canvas2D({ simulationFrames, currentFrame, zoomLevel, setZoomLevel }: Canvas2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDraggingRef = useRef(false)
  const lastMouseXRef = useRef(0)
  const lastMouseYRef = useRef(0)
  const panOffsetXRef = useRef(0)
  const panOffsetYRef = useRef(0)

  // Draw the current frame on the canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Update position and angle indicators
    if (simulationFrames.length > 0 && currentFrame < simulationFrames.length) {
      const frame = simulationFrames[currentFrame]
      updatePositionIndicator(frame.x || 0, frame.y, frame.z)
      updateAngleIndicator(frame.a)
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw coordinate system with zoom
    drawCoordinateSystem(ctx, canvas.width, canvas.height, zoomLevel, panOffsetXRef.current, panOffsetYRef.current)

    // Draw simulation path if available
    if (simulationFrames.length > 0) {
      drawSimulationPath(
        ctx,
        simulationFrames,
        currentFrame,
        canvas.width,
        canvas.height,
        zoomLevel,
        panOffsetXRef.current,
        panOffsetYRef.current,
      )
    } else {
      // Draw message if no simulation data
      ctx.font = "14px Arial"
      ctx.textAlign = "center"
      ctx.fillStyle = "#333"
      ctx.fillText(
        "Gere o Código G e clique em Iniciar Simulação para visualizar",
        canvas.width / 2,
        canvas.height / 2 - 50,
      )
    }
  }, [simulationFrames, currentFrame, zoomLevel])

  // Set up canvas resizing
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const container = canvas.parentElement
      if (!container) return

      canvas.width = container.clientWidth
      canvas.height = container.clientHeight

      // Redraw after resize
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      drawCoordinateSystem(ctx, canvas.width, canvas.height, zoomLevel, panOffsetXRef.current, panOffsetYRef.current)

      if (simulationFrames.length > 0) {
        drawSimulationPath(
          ctx,
          simulationFrames,
          currentFrame,
          canvas.width,
          canvas.height,
          zoomLevel,
          panOffsetXRef.current,
          panOffsetYRef.current,
        )
      }
    }

    // Initial resize
    resizeCanvas()

    // Add resize listener
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [simulationFrames, currentFrame, zoomLevel])

  // Set up canvas panning
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true
      lastMouseXRef.current = e.clientX
      lastMouseYRef.current = e.clientY
      canvas.style.cursor = "grabbing"
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return

      const deltaX = e.clientX - lastMouseXRef.current
      const deltaY = e.clientY - lastMouseYRef.current

      panOffsetXRef.current += deltaX / zoomLevel
      panOffsetYRef.current += deltaY / zoomLevel

      lastMouseXRef.current = e.clientX
      lastMouseYRef.current = e.clientY

      // Redraw with new pan offset
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawCoordinateSystem(ctx, canvas.width, canvas.height, zoomLevel, panOffsetXRef.current, panOffsetYRef.current)

      if (simulationFrames.length > 0) {
        drawSimulationPath(
          ctx,
          simulationFrames,
          currentFrame,
          canvas.width,
          canvas.height,
          zoomLevel,
          panOffsetXRef.current,
          panOffsetYRef.current,
        )
      }
    }

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false
        canvas.style.cursor = "default"
      }
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      const newZoom = Math.max(0.5, Math.min(4, zoomLevel + delta))
      setZoomLevel(newZoom)
    }

    canvas.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("wheel", handleWheel)

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("wheel", handleWheel)
    }
  }, [zoomLevel, setZoomLevel, simulationFrames, currentFrame])

  return (
    <>
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="angle-indicator absolute top-5 right-5 w-[100px] h-[100px] rounded-full border-2 border-gray-700 bg-white/80 overflow-hidden">
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

// Helper function to draw coordinate system
function drawCoordinateSystem(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  zoomLevel: number,
  panOffsetX: number,
  panOffsetY: number,
) {
  const padding = 40
  const originX = (padding * 2 + panOffsetX) * zoomLevel
  const originY = (height / 2 + panOffsetY) * zoomLevel
  const scaleZ = 5 * zoomLevel // Scale for Z
  const scaleY = 5 * zoomLevel // Scale for Y

  // Z axis (horizontal)
  ctx.beginPath()
  ctx.moveTo(padding, originY)
  ctx.lineTo(width - padding, originY)
  ctx.strokeStyle = "#000"
  ctx.lineWidth = 1
  ctx.stroke()

  // Y axis (vertical)
  ctx.beginPath()
  ctx.moveTo(originX, padding)
  ctx.lineTo(originX, height - padding)
  ctx.stroke()

  // Axis labels
  ctx.font = "12px Arial"
  ctx.fillStyle = "#333"
  ctx.fillText("Z", width - padding + 10, originY + 5)
  ctx.fillText("Y", originX - 5, padding - 10)

  // Z axis markings
  ctx.textAlign = "center"
  for (let i = -40; i <= 40; i += 5) {
    const posX = originX + i * scaleZ
    ctx.beginPath()
    ctx.moveTo(posX, originY - 5)
    ctx.lineTo(posX, originY + 5)
    ctx.stroke()
    if (i !== 0) {
      ctx.fillText(i.toString(), posX, originY + 20)
    }
  }

  // Y axis markings
  for (let i = -40; i <= 40; i += 5) {
    const posY = originY - i * scaleY
    ctx.beginPath()
    ctx.moveTo(originX - 5, posY)
    ctx.lineTo(originX + 5, posY)
    ctx.stroke()
    if (i !== 0) {
      ctx.textAlign = "right"
      ctx.fillText(i.toString(), originX - 10, posY + 4)
    }
  }
}

// Helper function to draw simulation path
function drawSimulationPath(
  ctx: CanvasRenderingContext2D,
  frames: SimulationFrame[],
  currentFrame: number,
  width: number,
  height: number,
  zoomLevel: number,
  panOffsetX: number,
  panOffsetY: number,
) {
  if (currentFrame >= frames.length) return

  const padding = 40
  const originX = (padding * 2 + panOffsetX) * zoomLevel
  const originY = (height / 2 + panOffsetY) * zoomLevel
  const scaleZ = 5 * zoomLevel
  const scaleY = 5 * zoomLevel

  // Draw path up to current frame
  ctx.beginPath()
  ctx.moveTo(originX, originY)

  for (let i = 0; i <= currentFrame; i++) {
    const point = frames[i]
    const x = originX + point.z * scaleZ
    const y = originY - point.y * scaleY

    // Use red for cutting moves (G1), blue for rapid moves (G0)
    ctx.strokeStyle = point.cmd === "G1" ? "#cc0000" : "#0066cc"
    ctx.lineWidth = point.cmd === "G1" ? 2 : 1

    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  // Draw current tool position
  const frame = frames[currentFrame]
  const currentX = originX + frame.z * scaleZ
  const currentY = originY - frame.y * scaleY

  // Draw tool
  const toolSize = 8
  ctx.beginPath()
  ctx.arc(currentX, currentY, toolSize, 0, Math.PI * 2)
  ctx.fillStyle = frame.cmd === "G1" ? "rgba(204, 0, 0, 0.7)" : "rgba(0, 102, 204, 0.7)"
  ctx.fill()
  ctx.strokeStyle = "#000"
  ctx.lineWidth = 1
  ctx.stroke()
}

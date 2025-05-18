"use client"

import type React from "react"
import { useState } from "react"

interface TooltipProps {
  children?: React.ReactNode
  text: string
}

export function Tooltip({ text }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <span
      className="tooltip inline-block ml-2 relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span className="help-icon inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-gray-500 hover:bg-primary text-white text-xs font-bold cursor-pointer transition-colors">
        ?
      </span>
      {isVisible && (
        <div className="tooltip-text absolute z-50 w-64 bg-gray-800 text-white text-left rounded-md p-2.5 bottom-[125%] left-1/2 transform -translate-x-1/2 opacity-100 transition-opacity text-sm font-normal shadow-lg">
          {text}
          <div className="after:content-[''] after:absolute after:top-full after:left-1/2 after:ml-[-5px] after:border-[5px] after:border-solid after:border-t-gray-800 after:border-r-transparent after:border-b-transparent after:border-l-transparent"></div>
        </div>
      )}
    </span>
  )
}

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

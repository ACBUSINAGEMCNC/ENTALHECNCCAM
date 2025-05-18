"use client"

import * as React from "react"
import { useState } from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

// Interface para o componente Tooltip original usado no projeto
interface TooltipProps {
  text: string
  children?: React.ReactNode
}

// Componente Tooltip original usado no projeto
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

// Componentes do Radix UI
export const TooltipProvider = TooltipPrimitive.Provider
export const TooltipRoot = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger

export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

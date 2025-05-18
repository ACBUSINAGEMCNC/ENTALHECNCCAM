"use client"

import type React from "react"

import { useState } from "react"

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

/**
 * Collapsible section component for organizing form fields
 * Allows sections to be expanded or collapsed
 */
export function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="collapsible-section border border-gray-200 dark:border-gray-700 rounded-md mb-4 bg-white dark:bg-gray-800">
      <div
        className="collapsible-header bg-gray-50 dark:bg-gray-700 p-3 font-bold cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {title}
        <span>{isOpen ? "-" : "+"}</span>
      </div>
      <div className="collapsible-body p-4" style={{ display: isOpen ? "block" : "none" }}>
        {children}
      </div>
    </div>
  )
}

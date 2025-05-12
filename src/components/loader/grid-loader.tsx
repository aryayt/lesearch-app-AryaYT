"use client"

import { useEffect, useRef } from "react"

interface GridLoaderAltProps {
  size?: string
  speed?: string
  color?: string
  className?: string
}

export default function GridLoade({
  size = "60",
  speed = "1.5",
  color = "black",
  className = "",
}: GridLoaderAltProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    import("ldrs").then(({ grid }) => {
      grid.register()

      // Create the element programmatically
      const gridElement = document.createElement("l-grid")
      gridElement.setAttribute("size", size)
      gridElement.setAttribute("speed", speed)
      gridElement.setAttribute("color", color)

      // Clear container and append the new element
      if (containerRef.current) {
          containerRef.current.innerHTML = ""
        containerRef.current.appendChild(gridElement)
      }
    })
  }, [size, speed, color])

  return <div ref={containerRef} className={className}></div>
}


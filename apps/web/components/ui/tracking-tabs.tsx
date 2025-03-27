"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useRef, useEffect } from "react"

export default function TrackingTabs({ links, bottomBorder = false }: {
  links: {
    label: string,
    href: string,
  }[],
  bottomBorder?: boolean
}) {
  const pathname = usePathname()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" })
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const lastHoveredIndexRef = useRef<number | null>(null)
  const isMouseOutsideRef = useRef(true)

  // Update active indicator position
  useEffect(() => {
    const activeElement = tabRefs.current[activeIndex]
    if (activeElement) {
      const { offsetLeft, offsetWidth } = activeElement
      setActiveStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      })
    }
  }, [activeIndex])

  // Initialize active indicator position
  useEffect(() => {
    requestAnimationFrame(() => {
      const overviewElement = tabRefs.current[0]
      if (overviewElement) {
        const { offsetLeft, offsetWidth } = overviewElement
        setActiveStyle({
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        })
      }
    })
  }, [])

  // Update active tab on pathname change
  useEffect(() => {
    const index = links.findIndex((link) => link.href === pathname)
    if (index !== -1) {
      setActiveIndex(index)
    }
  }, [pathname])

  const getHoverHighlightStyle = () => {
    if (hoveredIndex === null) {
      return { opacity: 0 }
    }

    const hoveredElement = tabRefs.current[hoveredIndex]
    if (!hoveredElement) {
      return { opacity: 0 }
    }

    const { offsetLeft, offsetWidth } = hoveredElement

    // If mouse was outside and now hovering a different tab than before,
    // don't apply transition class
    const shouldTransition = !isMouseOutsideRef.current || hoveredIndex === lastHoveredIndexRef.current

    return {
      left: `${offsetLeft}px`,
      width: `${offsetWidth}px`,
      opacity: 1,
      transition: shouldTransition ? "all 150ms ease-out" : "opacity 150ms ease-out",
    }
  }

  const handleMouseEnter = (index: number) => {
    isMouseOutsideRef.current = false
    setHoveredIndex(index)
    lastHoveredIndexRef.current = index
  }

  const handleTabAreaLeave = () => {
    setHoveredIndex(null)
    isMouseOutsideRef.current = true
  }

  return (
    <div className="relative w-full">
      {/* Hover Highlight */}
      <div
        className="absolute h-[30px] bg-[#0e0f1114] dark:bg-[#ffffff1a] rounded-[6px] flex items-center"
        style={getHoverHighlightStyle()}
      />

      {/* Active Indicator */}
      <div
        className="absolute bottom-[-6px] h-[2px] bg-[#0e0f11] dark:bg-white transition-all duration-150 ease-out"
        style={activeStyle}
      />

      {/* Bottom Border */}
      {bottomBorder && (
        <div
          className="absolute bottom-[-6px] h-[1px] w-full bg-black/10 dark:bg-white/10 transition-all duration-150 ease-out"
        />
      )}

      {/* Tabs */}
      <div className="relative flex space-x-[6px] items-center" onMouseLeave={handleTabAreaLeave}>
        {links.map((link, index) => (
          <Link
            key={index}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            href={link.href}
            className={`px-3 py-2 cursor-pointer transition-colors duration-150 h-[30px] ${index === activeIndex ? "text-[#0e0e10] dark:text-white" : "text-[#0e0f1199] dark:text-[#ffffff99]"}`}
            onMouseEnter={() => handleMouseEnter(index)}
            onClick={() => setActiveIndex(index)}
          >
            <div className="text-sm font-display font-medium leading-5 whitespace-nowrap flex items-center justify-center h-full">
              {link.label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}


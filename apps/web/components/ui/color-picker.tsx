"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Range, Root, Thumb, Track } from "@radix-ui/react-slider"
import Color, { ColorInstance } from "color"
import { PipetteIcon } from "lucide-react"
import { type ComponentProps, type HTMLAttributes, useCallback, useEffect, useRef, useState } from "react"
import { createContext, useContext } from "react"

interface ColorPickerContextValue {
  hue: number
  saturation: number
  lightness: number
  alpha: number
  mode: string
  setHue: (hue: number) => void
  setSaturation: (saturation: number) => void
  setLightness: (lightness: number) => void
  setAlpha: (alpha: number) => void
  setMode: (mode: string) => void
}

const ColorPickerContext = createContext<ColorPickerContextValue | undefined>(undefined)

export const useColorPicker = () => {
  const context = useContext(ColorPickerContext)

  if (!context) {
    throw new Error("useColorPicker must be used within a ColorPickerProvider")
  }

  return context
}

export type ColorPickerProps = HTMLAttributes<HTMLDivElement> & {
  value?: Parameters<typeof Color>[0]
  defaultValue?: Parameters<typeof Color>[0]
  onColorChange?: (value: ColorInstance) => void // Renamed from onChange to onColorChange
}

export const ColorPicker = ({
  value,
  defaultValue = "#000000",
  onColorChange,
  className,
  ...props
}: ColorPickerProps) => {
  const defaultColor = Color(defaultValue)

  // Initialize with value prop if available, otherwise use defaultValue
  const initialColor = value ? Color(value) : defaultColor
  const [hue, setHue] = useState(initialColor.hue() || 0)
  const [saturation, setSaturation] = useState(initialColor.saturationl() || 100)
  const [lightness, setLightness] = useState(initialColor.lightness() || 50)
  const [alpha, setAlpha] = useState((initialColor.alpha() || 1) * 100)
  const [mode, setMode] = useState("hex")

  // Track if this is the first render
  const isFirstRender = useRef(true)

  // Update color when controlled value changes
  useEffect(() => {
    // Skip if value is undefined or null
    if (!value) return

    try {
      const color = Color(value)
      const h = color.hue() || 0
      const s = color.saturationl() || 100
      const l = color.lightness() || 50
      const a = (color.alpha() || 1) * 100

      // Always update on first render or if values are different
      if (isFirstRender.current || h !== hue || s !== saturation || l !== lightness || a !== alpha) {
        setHue(h)
        setSaturation(s)
        setLightness(l)
        setAlpha(a)
      }
    } catch (error) {
      console.error("Invalid color value:", error)
    }

    // No longer first render after first effect run
    isFirstRender.current = false
  }, [value, hue, saturation, lightness, alpha])

  // Second useEffect - handle onColorChange with a debounce mechanism
  useEffect(() => {
    // Skip the first render
    const timeoutId = setTimeout(() => {
      if (onColorChange) {
        try {
          const color = Color.hsl(hue, saturation, lightness).alpha(alpha / 100)
          const rgba = color.rgb().array()
          onColorChange(color)
        } catch (error) {
          console.error("Error converting color:", error)
        }
      }
    }, 50) // Small debounce to prevent rapid updates

    return () => clearTimeout(timeoutId)
  }, [hue, saturation, lightness, alpha, onColorChange])

  return (
    <ColorPickerContext.Provider
      value={{
        hue,
        saturation,
        lightness,
        alpha,
        mode,
        setHue,
        setSaturation,
        setLightness,
        setAlpha,
        setMode,
      }}
    >
      <div className={cn("grid w-full gap-4", className)} {...props} />
    </ColorPickerContext.Provider>
  )
}

export type ColorPickerSelectionProps = HTMLAttributes<HTMLDivElement>

export const ColorPickerSelection = ({ className, ...props }: ColorPickerSelectionProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 1, y: 0 }) // Default to full saturation
  const { hue, saturation, lightness, setSaturation, setLightness } = useColorPicker()

  // Initialize position based on current saturation and lightness
  useEffect(() => {
    // Skip position updates when dragging to prevent loops
    if (!isDragging) {
      const x = saturation / 100
      // Calculate y position from lightness and saturation
      const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x)
      const y = topLightness > 0 ? 1 - lightness / topLightness : 0

      setPosition({ x, y })
    }
  }, [saturation, lightness, isDragging])

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      if (!isDragging || !containerRef.current) {
        return
      }
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
      setPosition({ x, y })
      setSaturation(x * 100)
      const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x)
      const lightness = topLightness * (1 - y)

      setLightness(lightness)
    },
    [isDragging, setSaturation, setLightness],
  )

  useEffect(() => {
    const handlePointerUp = () => setIsDragging(false)

    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove)
      window.addEventListener("pointerup", handlePointerUp)
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [isDragging, handlePointerMove])

  return (
    <div
      ref={containerRef}
      className={cn("relative aspect-[4/3] w-full cursor-crosshair rounded", className)}
      style={{
        background: `linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0)),
                     linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0)),
                     hsl(${hue}, 100%, 50%)`,
      }}
      onPointerDown={(e) => {
        e.preventDefault()
        setIsDragging(true)
        handlePointerMove(e.nativeEvent as unknown as PointerEvent)
      }}
      {...props}
    >
      <div
        className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
        style={{
          left: `${position.x * 100}%`,
          top: `${position.y * 100}%`,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
        }}
      />
    </div>
  )
}

export type ColorPickerHueProps = ComponentProps<typeof Root>

export const ColorPickerHue = ({ className, ...props }: ColorPickerHueProps) => {
  const { hue, setHue } = useColorPicker()
  const [localHue, setLocalHue] = useState(hue)

  // Sync with context value when it changes externally
  useEffect(() => {
    if (hue !== localHue) {
      setLocalHue(hue)
    }
  }, [hue, localHue])

  // Handle value change from slider
  const handleValueChange = useCallback(
    (values: number[]) => {
      const newHue = values[0]
      setLocalHue(newHue)
      setHue(newHue)
    },
    [setHue],
  )

  return (
    <Root
      value={[localHue]}
      max={360}
      step={1}
      className={cn("relative flex h-4 w-full touch-none", className)}
      onValueChange={handleValueChange}
      {...props}
    >
      <Track className="relative my-0.5 h-3 w-full grow rounded-full bg-[linear-gradient(90deg,#FF0000,#FFFF00,#00FF00,#00FFFF,#0000FF,#FF00FF,#FF0000)]">
        <Range className="absolute h-full" />
      </Track>
      <Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </Root>
  )
}

export type ColorPickerAlphaProps = ComponentProps<typeof Root>

export const ColorPickerAlpha = ({ className, ...props }: ColorPickerAlphaProps) => {
  const { alpha, setAlpha, hue, saturation, lightness } = useColorPicker()
  const [localAlpha, setLocalAlpha] = useState(alpha)
  const color = Color.hsl(hue, saturation, lightness).hex()

  // Sync with context value when it changes externally
  useEffect(() => {
    if (alpha !== localAlpha) {
      setLocalAlpha(alpha)
    }
  }, [alpha, localAlpha])

  // Handle value change from slider
  const handleValueChange = useCallback(
    (values: number[]) => {
      const newAlpha = values[0]
      setLocalAlpha(newAlpha)
      setAlpha(newAlpha)
    },
    [setAlpha],
  )

  return (
    <Root
      value={[localAlpha]}
      max={100}
      step={1}
      className={cn("relative flex h-4 w-full touch-none", className)}
      onValueChange={handleValueChange}
      {...props}
    >
      <Track
        className="relative my-0.5 h-3 w-full grow rounded-full"
        style={{
          background:
            'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==") left center',
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${color})` }}
        />
        <Range className="absolute h-full rounded-full bg-transparent" />
      </Track>
      <Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </Root>
  )
}

export type ColorPickerEyeDropperProps = ComponentProps<typeof Button>

export const ColorPickerEyeDropper = ({ className, ...props }: ColorPickerEyeDropperProps) => {
  const { setHue, setSaturation, setLightness, setAlpha } = useColorPicker()
  const [isSupported, setIsSupported] = useState(false)

  // Check if EyeDropper API is supported
  useEffect(() => {
    // @ts-ignore - EyeDropper API is experimental
    setIsSupported(typeof window !== "undefined" && "EyeDropper" in window)
  }, [])

  const handleEyeDropper = async () => {
    try {
      // @ts-ignore - EyeDropper API is experimental
      const eyeDropper = new EyeDropper()
      const result = await eyeDropper.open()
      const color = Color(result.sRGBHex)
      const [h, s, l] = color.hsl().array()

      setHue(h || 0)
      setSaturation(s || 0)
      setLightness(l || 0)
      setAlpha(100)
    } catch (error) {
      console.error("EyeDropper failed:", error)
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleEyeDropper}
      className={cn("shrink-0 text-muted-foreground", className)}
      {...props}
    >
      <PipetteIcon size={16} />
    </Button>
  )
}

export type ColorPickerOutputProps = ComponentProps<typeof SelectTrigger>

const formats = ["hex", "rgb", "css", "hsl"]

export const ColorPickerOutput = ({ className, ...props }: ColorPickerOutputProps) => {
  const { mode, setMode } = useColorPicker()

  return (
    <Select value={mode} onValueChange={setMode}>
      <SelectTrigger className="h-8 w-[4.5rem] shrink-0 text-xs" {...props}>
        <SelectValue placeholder="Mode" />
      </SelectTrigger>
      <SelectContent>
        {formats.map((format) => (
          <SelectItem key={format} value={format} className="text-xs">
            {format.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

type PercentageInputProps = ComponentProps<typeof Input>

const PercentageInput = ({
  className,
  value,
  onPercentChange,
  ...props
}: PercentageInputProps & { onPercentChange?: (value: number) => void }) => {
  const [inputValue, setInputValue] = useState(value?.toString() || "")
  const prevValueRef = useRef(value)

  // Update local state when external value changes
  useEffect(() => {
    if (value !== prevValueRef.current) {
      setInputValue(value?.toString() || "")
      prevValueRef.current = value
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Only update parent if it's a valid number
    if (onPercentChange && newValue !== "") {
      const parsedValue = Number.parseInt(newValue, 10)
      if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100) {
        onPercentChange(parsedValue)
      }
    } else if (onPercentChange && newValue === "") {
      // When field is cleared, set to 0
      onPercentChange(0)
    }
  }

  const handleBlur = () => {
    // On blur, if empty, set to 0
    if (inputValue === "" && onPercentChange) {
      setInputValue("0")
      onPercentChange(0)
    }
  }

  return (
    <div className="relative">
      <Input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
        className={cn("h-8 w-[3.25rem] rounded-l-none bg-secondary px-2 text-xs shadow-none", className)}
      />
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
    </div>
  )
}

export type ColorPickerFormatProps = HTMLAttributes<HTMLDivElement> & { alphaInput?: boolean }

export const ColorPickerFormat = ({ className, alphaInput = true, ...props }: ColorPickerFormatProps) => {
  const { hue, saturation, lightness, alpha, mode, setHue, setSaturation, setLightness, setAlpha } = useColorPicker()

  // Calculate hex color string only once per render
  const hexString = Color.hsl(hue, saturation, lightness)
    .alpha(alpha / 100)
    .hex()

  // Local state for hex input
  const [localHexValue, setLocalHexValue] = useState(hexString)
  const prevHexRef = useRef(hexString)

  // Local state for RGB inputs
  const [localRgbValues, setLocalRgbValues] = useState<string[]>([])
  const rgbValuesRef = useRef<string[]>([])

  // Local state for HSL inputs
  const [localHslValues, setLocalHslValues] = useState<string[]>([])
  const hslValuesRef = useRef<string[]>([])

  // Update local hex value when color changes externally
  useEffect(() => {
    if (mode === "hex" && hexString !== prevHexRef.current) {
      setLocalHexValue(hexString)
      prevHexRef.current = hexString
    }
  }, [hexString, mode])

  // Update local RGB values when color changes externally
  useEffect(() => {
    if (mode === "rgb") {
      const rgb = Color.hsl(hue, saturation, lightness)
        .rgb()
        .array()
        .map((value) => Math.round(value || 0).toString())

      // Check if values have actually changed
      if (JSON.stringify(rgb) !== JSON.stringify(rgbValuesRef.current)) {
        setLocalRgbValues(rgb)
        rgbValuesRef.current = rgb
      }
    }
  }, [hue, saturation, lightness, mode])

  // Update local HSL values when color changes externally
  useEffect(() => {
    if (mode === "hsl") {
      const hsl = [Math.round(hue).toString(), Math.round(saturation).toString(), Math.round(lightness).toString()]

      // Check if values have actually changed
      if (JSON.stringify(hsl) !== JSON.stringify(hslValuesRef.current)) {
        setLocalHslValues(hsl)
        hslValuesRef.current = hsl
      }
    }
  }, [hue, saturation, lightness, mode])

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalHexValue(value)

    // Only update the actual color if it's a valid hex
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(value)) {
      try {
        const newColor = Color(value)
        const [h, s, l] = newColor.hsl().array()
        setHue(h || 0)
        setSaturation(s || 0)
        setLightness(l || 0)
      } catch (error) {
        // Invalid hex
      }
    }
  }

  const handleRgbChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Update local state
    const newValues = [...localRgbValues]
    newValues[index] = value
    setLocalRgbValues(newValues)

    // Only update the actual color if it's a valid number
    if (value !== "") {
      const parsedValue = Number.parseInt(value, 10)
      if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 255) {
        try {
          const rgb = Color.hsl(hue, saturation, lightness)
            .rgb()
            .array()
            .map((v, i) => (i === index ? parsedValue : Math.round(v || 0)))

          const newColor = Color.rgb(rgb)
          const [h, s, l] = newColor.hsl().array()
          setHue(h || 0)
          setSaturation(s || 0)
          setLightness(l || 0)
        } catch (error) {
          // Invalid RGB
        }
      }
    } else {
      // When field is cleared, set to 0
      try {
        const rgb = Color.hsl(hue, saturation, lightness)
          .rgb()
          .array()
          .map((v, i) => (i === index ? 0 : Math.round(v || 0)))

        const newColor = Color.rgb(rgb)
        const [h, s, l] = newColor.hsl().array()
        setHue(h || 0)
        setSaturation(s || 0)
        setLightness(l || 0)
      } catch (error) {
        // Invalid RGB
      }
    }
  }

  const handleHslChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Update local state
    const newValues = [...localHslValues]
    newValues[index] = value
    setLocalHslValues(newValues)

    // Only update the actual color if it's a valid number
    if (value !== "") {
      const parsedValue = Number.parseInt(value, 10)
      if (!isNaN(parsedValue)) {
        // Validate range based on HSL component
        if (
          (index === 0 && parsedValue >= 0 && parsedValue <= 360) ||
          ((index === 1 || index === 2) && parsedValue >= 0 && parsedValue <= 100)
        ) {
          if (index === 0) setHue(parsedValue)
          if (index === 1) setSaturation(parsedValue)
          if (index === 2) setLightness(parsedValue)
        }
      }
    } else {
      // When field is cleared, set to 0
      if (index === 0) setHue(0)
      if (index === 1) setSaturation(0)
      if (index === 2) setLightness(0)
    }
  }

  const handleRgbBlur = (index: number) => {
    // On blur, if empty, set to 0
    if (localRgbValues[index] === "") {
      const newValues = [...localRgbValues]
      newValues[index] = "0"
      setLocalRgbValues(newValues)
    }
  }

  const handleHslBlur = (index: number) => {
    // On blur, if empty, set to 0
    if (localHslValues[index] === "") {
      const newValues = [...localHslValues]
      newValues[index] = "0"
      setLocalHslValues(newValues)
    }
  }

  const handleHexBlur = () => {
    // On blur, reset to valid hex if current value is invalid
    if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(localHexValue)) {
      setLocalHexValue(hexString)
    }
  }

  if (mode === "hex") {
    return (
      <div className={cn("-space-x-px relative flex items-center shadow-sm", !alphaInput && "w-full", className)} {...props}>
        <Input
          type="text"
          value={localHexValue}
          onChange={handleHexInputChange}
          onBlur={handleHexBlur}
          className={cn("h-8 rounded-r-none bg-secondary px-2 text-xs shadow-none", !alphaInput && "rounded-r-md")}
        />
        {alphaInput && (
          <PercentageInput value={Math.round(alpha)} onPercentChange={setAlpha} />
        )}
      </div>
    )
  }

  if (mode === "rgb") {
    // Initialize RGB values if they're empty
    if (localRgbValues.length === 0) {
      const rgb = Color.hsl(hue, saturation, lightness)
        .rgb()
        .array()
        .map((value) => Math.round(value || 0).toString())

      setLocalRgbValues(rgb)
      rgbValuesRef.current = rgb
    }

    return (
      <div className={cn("-space-x-px flex items-center shadow-sm", className)} {...props}>
        {localRgbValues.map((value, index) => (
          <Input
            key={index}
            type="text"
            value={value}
            onChange={(e) => handleRgbChange(index, e)}
            onBlur={() => handleRgbBlur(index)}
            className={cn(
              "h-8 rounded-none bg-secondary px-2 text-xs shadow-none",
              index === 0 && "rounded-l",
              className,
            )}
          />
        ))}
        {alphaInput && (
          <PercentageInput value={Math.round(alpha)} onPercentChange={setAlpha} />
        )}
      </div>
    )
  }

  if (mode === "css") {
    const rgb = Color.hsl(hue, saturation, lightness)
      .rgb()
      .array()
      .map((value) => Math.round(value || 0))

    return (
      <div className={cn("w-full shadow-sm", className)} {...props}>
        <Input
          type="text"
          className="h-8 w-full bg-secondary px-2 text-xs shadow-none"
          value={`rgba(${rgb.join(", ")}, ${(alpha / 100).toFixed(2)})`}
          readOnly
          {...props}
        />
      </div>
    )
  }

  if (mode === "hsl") {
    // Initialize HSL values if they're empty
    if (localHslValues.length === 0) {
      const hsl = [Math.round(hue).toString(), Math.round(saturation).toString(), Math.round(lightness).toString()]

      setLocalHslValues(hsl)
      hslValuesRef.current = hsl
    }

    return (
      <div className={cn("-space-x-px flex items-center shadow-sm", className)} {...props}>
        {localHslValues.map((value, index) => (
          <Input
            key={index}
            type="text"
            value={value}
            onChange={(e) => handleHslChange(index, e)}
            onBlur={() => handleHslBlur(index)}
            className={cn(
              "h-8 rounded-none bg-secondary px-2 text-xs shadow-none",
              index === 0 && "rounded-l",
              className,
            )}
          />
        ))}
        {alphaInput && (
          <PercentageInput value={Math.round(alpha)} onPercentChange={setAlpha} />
        )}
      </div>
    )
  }

  return null
}

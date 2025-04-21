import {
	ColorPicker as ColorPickerPrimitive,
	ColorPickerFormat,
	ColorPickerHue,
	ColorPickerSelection
} from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ColorInstance } from "color";

export default function ColorPicker({ value, setValue }: { value: ColorInstance, setValue: (color: ColorInstance) => void }) {
	const handleColorChange = (newColor: ColorInstance) => {
		setValue(newColor)
	}

	// Convert RGB array to CSS color string
	const colorString = `rgba(${value.red()}, ${value.green()}, ${value.blue()}, ${value.alpha()})`

	return (
		<>
			<Popover>
				<div className="flex flex-row gap-0">
					<PopoverTrigger asChild>
						<button className="size-[36px] rounded-l border" style={{ backgroundColor: colorString }} />
					</PopoverTrigger>
					<Input className="rounded-l-none border-l-0 focus-visible:ring-0" value={value.hex()} readOnly />
				</div>
				<PopoverContent>
					<ColorPickerPrimitive className="w-full rounded-md bg-background shadow-sm" onColorChange={handleColorChange} defaultValue={value.rgb().string()}>
						<ColorPickerSelection />
						<div className="flex items-center gap-4">
							<div className="w-full grid gap-1">
								<ColorPickerHue />
							</div>
						</div>
						<div className="flex items-center gap-2">
							{/* <ColorPickerOutput /> */}
							<ColorPickerFormat alphaInput={false} />
						</div>
					</ColorPickerPrimitive>
				</PopoverContent>
			</Popover>
		</>
	)
}
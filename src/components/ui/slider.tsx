import * as SliderPrimitive from "@radix-ui/react-slider";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Slider({
  className,
  ...props
}: ComponentProps<typeof SliderPrimitive.Root>) {
  const thumbs = props.value ?? props.defaultValue ?? [0];
  return (
    <SliderPrimitive.Root
      className={cn(
        "relative flex w-full touch-none select-none items-center",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-navy-elevated">
        <SliderPrimitive.Range className="absolute h-full bg-gold" />
      </SliderPrimitive.Track>
      {thumbs.map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className="block size-5 rounded-full border-2 border-gold bg-cream shadow-panel focus-visible:outline-none"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-cream text-navy hover:bg-cream-muted active:scale-[0.98]",
        gold: "bg-gold text-navy hover:bg-gold/90 active:scale-[0.98]",
        bmc: "bg-bmc text-bmc-ink hover:bg-bmc/90 active:scale-[0.98]",
        outline:
          "border border-line bg-transparent text-cream hover:bg-navy-elevated",
        ghost: "text-cream hover:bg-navy-elevated",
        danger: "bg-red text-cream hover:bg-red/90",
        green: "bg-green text-cream hover:bg-green/90",
      },
      size: {
        default: "min-h-11 px-4 py-2 text-sm",
        sm: "min-h-9 px-3 text-sm",
        lg: "min-h-12 px-5 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

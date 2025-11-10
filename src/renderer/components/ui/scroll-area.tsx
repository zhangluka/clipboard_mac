import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "../../lib/utils";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar
      orientation="vertical"
      className="flex touch-none select-none transition-colors duration-200 ease-out data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col"
    >
      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-border transition-colors duration-200 ease-out hover:bg-muted" />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Scrollbar
      orientation="horizontal"
      className="flex touch-none select-none transition-colors duration-200 ease-out data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col"
    >
      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-full bg-border transition-colors duration-200 ease-out hover:bg-muted" />
    </ScrollAreaPrimitive.Scrollbar>
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollAreaViewport = ScrollAreaPrimitive.Viewport;
const ScrollAreaScrollbar = ScrollAreaPrimitive.Scrollbar;
const ScrollAreaThumb = ScrollAreaPrimitive.Thumb;

export { ScrollArea, ScrollAreaViewport, ScrollAreaScrollbar, ScrollAreaThumb };

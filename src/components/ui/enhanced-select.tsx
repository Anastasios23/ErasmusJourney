import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedSelectProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  disabled?: boolean;
  disabledMessage?: string;
  error?: string;
  className?: string;
  children?: React.ReactNode;
}

interface EnhancedSelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  disabledMessage?: string;
  error?: string;
}

interface EnhancedSelectValueProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value> {
  placeholder?: string;
  disabledMessage?: string;
  disabled?: boolean;
}

const EnhancedSelect = SelectPrimitive.Root;

const EnhancedSelectGroup = SelectPrimitive.Group;

const EnhancedSelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  EnhancedSelectValueProps
>(({ placeholder, disabledMessage, disabled, ...props }, ref) => (
  <SelectPrimitive.Value
    ref={ref}
    placeholder={disabled && disabledMessage ? disabledMessage : placeholder}
    {...props}
  />
));
EnhancedSelectValue.displayName = "EnhancedSelectValue";

const EnhancedSelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  EnhancedSelectTriggerProps
>(({ className, children, disabledMessage, error, ...props }, ref) => (
  <div className="relative">
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        // Enhanced disabled styling
        "disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200",
        // Error styling
        error && "border-red-500 focus:ring-red-500",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          className={cn("h-4 w-4 opacity-50", props.disabled && "opacity-30")}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>

    {/* Error message with proper spacing */}
    {error && (
      <p className="mt-1.5 text-sm text-red-500 leading-relaxed">{error}</p>
    )}
  </div>
));
EnhancedSelectTrigger.displayName = "EnhancedSelectTrigger";

const EnhancedSelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4 rotate-180" />
  </SelectPrimitive.ScrollUpButton>
));
EnhancedSelectScrollUpButton.displayName = "EnhancedSelectScrollUpButton";

const EnhancedSelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
EnhancedSelectScrollDownButton.displayName = "EnhancedSelectScrollDownButton";

const EnhancedSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <EnhancedSelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <EnhancedSelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
EnhancedSelectContent.displayName = "EnhancedSelectContent";

const EnhancedSelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
));
EnhancedSelectLabel.displayName = "EnhancedSelectLabel";

const EnhancedSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
EnhancedSelectItem.displayName = "EnhancedSelectItem";

const EnhancedSelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
EnhancedSelectSeparator.displayName = "EnhancedSelectSeparator";

export {
  EnhancedSelect,
  EnhancedSelectGroup,
  EnhancedSelectValue,
  EnhancedSelectTrigger,
  EnhancedSelectContent,
  EnhancedSelectLabel,
  EnhancedSelectItem,
  EnhancedSelectSeparator,
  EnhancedSelectScrollUpButton,
  EnhancedSelectScrollDownButton,
};

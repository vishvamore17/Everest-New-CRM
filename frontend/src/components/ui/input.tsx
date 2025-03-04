import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react"; // Import a close icon

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & {
    startContent?: React.ReactNode;
    isClearable?: boolean;
    onClear?: () => void;
  }
>(({ className, type, startContent, isClearable, onClear, value, ...props }, ref) => {
  const handleClear = () => {
    if (onClear) onClear();
  };

  return (
    <div className="relative flex items-center">
      {startContent && (
        <div className="absolute left-3 flex items-center pointer-events-none">
          {startContent}
        </div>
      )}
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          startContent && "pl-10", // Add padding to the left if startContent is present
          isClearable && "pr-10", // Add padding to the right if isClearable is true
          className
        )}
        ref={ref}
        value={value}
        {...props}
      />
      {isClearable && value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 flex items-center text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
});

Input.displayName = "Input";

export { Input };
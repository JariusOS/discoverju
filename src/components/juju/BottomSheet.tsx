import type { ReactNode } from "react";
import { X } from "lucide-react";

/** Map-anchored detail sheet. */
export function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-x-0 bottom-0 z-20 max-h-[62%] overflow-y-auto border-t border-hairline bg-background/97 backdrop-blur sm:inset-x-auto sm:right-3 sm:bottom-3 sm:w-96 sm:border">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close details"
        className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-foreground"
      >
        <X className="size-4" />
      </button>
      {children}
    </div>
  );
}

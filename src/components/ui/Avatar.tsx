import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
  lg: "size-11 text-base",
};

export function Avatar({
  name,
  colorHex,
  size = "md",
  className,
}: {
  name: string;
  colorHex: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-surface",
        SIZES[size],
        className,
      )}
      style={{ backgroundColor: colorHex }}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

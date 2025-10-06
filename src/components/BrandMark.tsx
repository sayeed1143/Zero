import { cn } from "@/lib/utils";

type BrandMarkSize = "sm" | "md" | "lg";

const sizeStyles: Record<BrandMarkSize, { icon: string; dot: string; gap: string; title: string; tagline: string }> = {
  sm: {
    icon: "h-9 w-9 border",
    dot: "h-1.5 w-1.5 shadow-[0_0_6px_rgba(17,17,17,0.35)]",
    gap: "gap-3",
    title: "text-base",
    tagline: "text-[0.7rem]",
  },
  md: {
    icon: "h-12 w-12 border-[1.5px]",
    dot: "h-2 w-2 shadow-[0_0_10px_rgba(17,17,17,0.3)]",
    gap: "gap-4",
    title: "text-2xl",
    tagline: "text-sm",
  },
  lg: {
    icon: "h-16 w-16 border-2",
    dot: "h-2.5 w-2.5 shadow-[0_0_14px_rgba(17,17,17,0.28)]",
    gap: "gap-5",
    title: "text-4xl",
    tagline: "text-base",
  },
};

interface BrandMarkProps {
  size?: BrandMarkSize;
  className?: string;
  titleClassName?: string;
  taglineClassName?: string;
  showTagline?: boolean;
}

const BrandMark = ({
  size = "md",
  className,
  titleClassName,
  taglineClassName,
  showTagline = true,
}: BrandMarkProps) => {
  const styles = sizeStyles[size];

  return (
    <div className={cn("flex items-center", styles.gap, className)}>
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            "flex items-center justify-center rounded-full border-foreground/70 bg-transparent",
            styles.icon,
          )}
        >
          <span
            className={cn(
              "rounded-full bg-foreground",
              styles.dot,
            )}
          />
        </div>
        <span className="pointer-events-none absolute inset-0 rounded-full border border-foreground/20" aria-hidden />
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            "font-semibold tracking-[0.35em] text-foreground leading-tight",
            styles.title,
            titleClassName,
          )}
        >
          SHUNYA&nbsp;AI
        </span>
        {showTagline ? (
          <span
            className={cn(
              "text-muted-foreground/80 italic tracking-[0.08em]",
              styles.tagline,
              taglineClassName,
            )}
          >
            the beginning of infinite intelligence
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default BrandMark;

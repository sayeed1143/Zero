type Props = { size?: number; className?: string };

export default function BrandLogo({ size = 40, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="EduVoice AI logo"
      className={className}
    >
      {/* Open book */}
      <defs>
        <linearGradient id="bookGrad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--glow-primary))" stopOpacity="0.25" />
          <stop offset="100%" stopColor="hsl(var(--glow-secondary))" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* Left page */}
      <path
        d="M8 18c8-4 16-6 24-6v34c-8 0-16 2-24 6V18z"
        fill="url(#bookGrad)"
        stroke="hsl(var(--foreground))"
        strokeOpacity="0.25"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      {/* Right page */}
      <path
        d="M56 18c-8-4-16-6-24-6v34c8 0 16 2 24 6V18z"
        fill="url(#bookGrad)"
        stroke="hsl(var(--foreground))"
        strokeOpacity="0.25"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      {/* Center spine */}
      <line x1="32" y1="12" x2="32" y2="46" stroke="hsl(var(--foreground))" strokeOpacity="0.3" strokeWidth="1.5" />

      {/* Microphone above the book with float and waves */}
      <g className="logo-float" transform="translate(0,0)">
        {/* Waves behind mic */}
        <circle cx="32" cy="12" r="7" fill="none" stroke="hsl(var(--foreground))" strokeOpacity="0.25" strokeWidth="1.5" className="logo-wave wave1" />
        <circle cx="32" cy="12" r="10" fill="none" stroke="hsl(var(--foreground))" strokeOpacity="0.18" strokeWidth="1.5" className="logo-wave wave2" />
        {/* Mic body */}
        <rect x="28" y="4" width="8" height="12" rx="4" fill="hsl(var(--foreground))" />
        {/* Mic grill lines */}
        <line x1="30" y1="7" x2="34" y2="7" stroke="hsl(var(--background))" strokeOpacity="0.6" strokeWidth="1" />
        <line x1="30" y1="10" x2="34" y2="10" stroke="hsl(var(--background))" strokeOpacity="0.6" strokeWidth="1" />
        {/* Short stem that ends just above the book */}
        <path d="M32 16v4" stroke="hsl(var(--foreground))" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

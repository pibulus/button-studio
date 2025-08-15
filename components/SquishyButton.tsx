import { JSX } from "preact";

interface SquishyButtonProps {
  children: JSX.Element | string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  color?: "pink" | "yellow" | "cyan" | "lime" | "orange";
  disabled?: boolean;
  className?: string;
}

/**
 * Neo-brutalist squishy button with tactile press effects
 * Uses pure CSS for the squishy effect (no state needed!)
 */
export function SquishyButton({
  children,
  onClick,
  size = "md",
  color = "pink",
  disabled = false,
  className = "",
}: SquishyButtonProps) {
  // Color palettes for neo-brutalism
  const colors = {
    pink: {
      bg: "bg-pink-300",
      hover: "hover:bg-pink-400",
      active: "active:bg-pink-500",
      glow: "hover:drop-shadow-[0_0_25px_rgba(236,72,153,0.5)]",
    },
    yellow: {
      bg: "bg-yellow-300",
      hover: "hover:bg-yellow-400",
      active: "active:bg-yellow-500",
      glow: "hover:drop-shadow-[0_0_25px_rgba(234,179,8,0.5)]",
    },
    cyan: {
      bg: "bg-cyan-300",
      hover: "hover:bg-cyan-400",
      active: "active:bg-cyan-500",
      glow: "hover:drop-shadow-[0_0_25px_rgba(6,182,212,0.5)]",
    },
    lime: {
      bg: "bg-lime-300",
      hover: "hover:bg-lime-400",
      active: "active:bg-lime-500",
      glow: "hover:drop-shadow-[0_0_25px_rgba(163,230,53,0.5)]",
    },
    orange: {
      bg: "bg-orange-300",
      hover: "hover:bg-orange-400",
      active: "active:bg-orange-500",
      glow: "hover:drop-shadow-[0_0_25px_rgba(251,146,60,0.5)]",
    },
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const colorConfig = colors[color];

  return (
    <button
      className={`
        ${colorConfig.bg}
        ${!disabled && colorConfig.hover}
        ${!disabled && colorConfig.active}
        ${!disabled && colorConfig.glow}
        ${sizes[size]}
        border-4 border-black
        font-bold
        uppercase
        tracking-wider
        cursor-pointer
        select-none
        transition-all
        duration-100
        ease-out
        relative
        shadow-[4px_4px_0px_rgba(0,0,0,1)]
        hover:shadow-[6px_6px_0px_rgba(0,0,0,1)]
        active:shadow-[0px_0px_0px_rgba(0,0,0,1)]
        active:translate-x-[4px]
        active:translate-y-[4px]
        ${disabled ? "opacity-50 cursor-not-allowed !shadow-[2px_2px_0px_rgba(0,0,0,0.5)]" : ""}
        ${className}
      `}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

/**
 * Ultra-squishy variant with elastic bounce effect
 * Pure CSS animation triggered by active state
 */
export function UltraSquishyButton({
  children,
  onClick,
  size = "md",
  color = "pink",
  disabled = false,
  className = "",
}: SquishyButtonProps) {
  const colors = {
    pink: "bg-gradient-to-br from-pink-300 to-pink-400",
    yellow: "bg-gradient-to-br from-yellow-300 to-yellow-400",
    cyan: "bg-gradient-to-br from-cyan-300 to-cyan-400",
    lime: "bg-gradient-to-br from-lime-300 to-lime-400",
    orange: "bg-gradient-to-br from-orange-300 to-orange-400",
  };

  const sizes = {
    sm: "px-6 py-3 text-sm",
    md: "px-8 py-4 text-base",
    lg: "px-10 py-5 text-lg",
  };

  // Get color-specific glow for active state
  const glowColors = {
    pink: "255, 105, 180",  // Hot pink glow
    yellow: "255, 215, 0",  // Gold glow
    cyan: "0, 255, 255",    // Cyan glow
    lime: "50, 205, 50",    // Lime green glow
    orange: "255, 140, 0",  // Dark orange glow
  };

  return (
    <>
      <style>{`
        @keyframes ultra-squish-bounce {
          0% { 
            transform: scale(1) scaleY(1);
          }
          15% { 
            transform: scale(0.9) scaleY(0.85);  /* Squish down more vertically */
          }
          30% { 
            transform: scale(1.15) scaleY(1.1);  /* Bounce up with stretch */
          }
          45% { 
            transform: scale(0.95) scaleY(0.92);
          }
          60% { 
            transform: scale(1.08) scaleY(1.05);
          }
          75% { 
            transform: scale(0.98) scaleY(0.98);
          }
          90% { 
            transform: scale(1.02) scaleY(1.01);
          }
          100% { 
            transform: scale(1) scaleY(1);
          }
        }
        
        .ultra-squishy {
          box-shadow: 
            inset -3px -3px 8px rgba(255,255,255,0.5),
            8px 8px 0px black;
          transform: scale(1) scaleY(1);
          transition: all 0.08s ease-out;
        }
        
        .ultra-squishy:active {
          box-shadow: 
            inset 6px 6px 12px rgba(0,0,0,0.4),
            0px 0px 0px black,
            0px 0px 40px rgba(${glowColors[color]}, 0.8),
            0px 0px 80px rgba(${glowColors[color]}, 0.4);
          transform: scale(0.92) scaleY(0.85);  /* More vertical squish */
          filter: brightness(1.2);
        }
        
        .ultra-squishy:active:not(:disabled) {
          animation: ultra-squish-bounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        
        .ultra-squishy:hover:not(:active):not(:disabled) {
          box-shadow: 
            inset -3px -3px 8px rgba(255,255,255,0.5),
            10px 10px 0px black,
            0px 0px 20px rgba(${glowColors[color]}, 0.2);
          transform: scale(1.03) scaleY(1.01);
        }
        
        .ultra-squishy:active span {
          transform: scaleY(0.9);  /* Inner content also squishes */
        }
      `}</style>
      
      <button
        className={`
          ultra-squishy
          ${colors[color]}
          ${sizes[size]}
          border-4 border-black
          rounded-full
          font-black
          uppercase
          tracking-wider
          cursor-pointer
          select-none
          relative
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${className}
        `}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
      >
        <span className="block pointer-events-none transition-transform duration-100">
          {children}
        </span>
      </button>
    </>
  );
}
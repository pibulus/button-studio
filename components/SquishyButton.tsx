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
      type="button"
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
        ${
        disabled
          ? "opacity-50 cursor-not-allowed !shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
          : ""
      }
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

  return (
    <>
      <style>
        {`
        @keyframes jello-bounce {
          0% { 
            transform: scale(1, 1);
          }
          30% { 
            transform: scale(1.25, 0.75);
          }
          40% { 
            transform: scale(0.75, 1.25);
          }
          50% { 
            transform: scale(1.15, 0.85);
          }
          65% { 
            transform: scale(0.95, 1.05);
          }
          75% { 
            transform: scale(1.05, 0.95);
          }
          100% { 
            transform: scale(1, 1);
          }
        }
        
        .ultra-squishy {
          box-shadow: 6px 6px 0px rgba(0,0,0,1);
          transform: translate(0px, 0px);
          transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          will-change: transform, box-shadow;
        }
        
        /* Inner glow overlay */
        .ultra-squishy::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: inherit;
          background: linear-gradient(145deg, 
            rgba(255,255,255,0.4) 0%, 
            transparent 60%);
          opacity: 0;
          transition: opacity 0.15s ease-out;
          pointer-events: none;
        }
        
        .ultra-squishy:active {
          box-shadow: 2px 2px 0px rgba(0,0,0,0.8);
          transform: translate(4px, 4px) scale(0.97);
          transition: all 0.034s ease-out;  /* Super fast press - 2 frames */
        }
        
        .ultra-squishy:active::after {
          opacity: 1;  /* Light up with inner glow */
        }
        
        .ultra-squishy:active:not(:disabled) {
          animation: jello-bounce 0.5s ease-out;
        }
        
        .ultra-squishy:hover:not(:active):not(:disabled) {
          box-shadow: 8px 8px 0px rgba(0,0,0,1);
          transform: translate(-1px, -1px) scale(1.02) rotate(0.5deg);
        }
      `}
      </style>

      <button
        type="button"
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
        <span className="block pointer-events-none">
          {children}
        </span>
      </button>
    </>
  );
}

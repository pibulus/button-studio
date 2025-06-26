import { Options } from "twind";

export default {
  selfURL: import.meta.url,
  theme: {
    extend: {
      // Custom fonts for chunky typography
      fontFamily: {
        'brutalist': ['Inter', 'system-ui', 'sans-serif'],
        'chunky': ['Inter Black', 'Inter', 'system-ui', 'sans-serif'],
      },
      
      // Enhanced font weights
      fontWeight: {
        'chunky': '900',
        'thick': '800',
        'bold': '700',
        'medium': '500',
        'normal': '400',
      },
      
      // Generous letter spacing for brutalist feel
      letterSpacing: {
        'chunky': '0.05em',
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em',
      },
      
      // Enhanced size scale for chonky elements
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '26': '6.5rem',   // 104px
        '30': '7.5rem',   // 120px
        '34': '8.5rem',   // 136px
        '38': '9.5rem',   // 152px
      },
      
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'breathe': 'breathe 3s ease-in-out infinite',
        'recording-pulse': 'recording-pulse 1s ease-in-out infinite',
        'success-pop': 'success-pop 0.6s ease-out',
        'error-shake': 'error-shake 0.5s ease-in-out',
        'waveform': 'waveform 0.8s ease-in-out infinite alternate',
        'flamingo-glow': 'flamingo-glow 4s ease-in-out infinite',
        'sunset-pulse': 'sunset-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
      },
      
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        'breathe': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'recording-pulse': {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.08)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'success-pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        'error-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        'waveform': {
          '0%': { transform: 'scaleY(0.3)' },
          '100%': { transform: 'scaleY(1)' },
        },
        'flamingo-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 40px rgba(255, 105, 180, 0.3), 0 0 80px rgba(255, 182, 193, 0.2)' 
          },
          '50%': { 
            boxShadow: '0 0 60px rgba(255, 105, 180, 0.5), 0 0 120px rgba(255, 182, 193, 0.3)' 
          },
        },
        'sunset-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.02)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      
      colors: {
        // NEW: Soft Stack Theme 🧁 (Warm, Chonky, Friendly)
        soft: {
          // Backgrounds
          cream: '#fffaf5',      // Main background - warm cream
          paper: '#fefbf7',      // Card backgrounds - slightly warmer
          mist: '#f8f4f0',       // Subtle section dividers
          
          // Text colors
          charcoal: '#1e1e1e',   // Primary text - friendly dark
          slate: '#4a4a4a',      // Secondary text
          quiet: '#6b6b6b',      // Muted text
          
          // Accent colors (chonky gradients)
          peach: '#fda085',      // Warm peach
          coral: '#fd9892',      // Soft coral  
          sunset: '#f6d365',     // Golden sunset
          lavender: '#e1d7fb',   // Soft purple
          mint: '#a8e6cf',       // Gentle mint
          
          // Interaction colors
          glow: '#ff6b9d',       // Pink glow for highlights
          success: '#22c55e',    // Success actions
          warning: '#f59e0b',    // Warning states
        },
        
        // Pablo's Original Amber Theme (preserved)
        voice: {
          primary: '#f59e0b',    // amber-500
          secondary: '#fbbf24',  // amber-400  
          accent: '#d97706',     // amber-600
          light: '#fef3c7',      // amber-100
          dark: '#92400e',       // amber-800
        },
        
        // NEW: Flamingo Chill Theme 🦩🌅 (Warmer & Friendlier)
        flamingo: {
          // Core peachy-purple palette (softened)
          primary: '#FF8FA3',     // Softer coral pink (was hot pink)
          secondary: '#FFB8CC',   // Warmer peachy pink
          accent: '#FF9575',      // Gentle sunset coral
          
          // Warmer purple accents
          purple: '#B19CD9',      // Softer lavender purple
          lavender: '#E0C3E0',    // Even gentler lavender
          violet: '#D4AFDD',      // Warm light violet
          
          // Sunset oranges/peaches (warmer)
          peach: '#FFBFA3',       // Warmer soft peach
          coral: '#FF8B6B',       // Friendlier coral
          sunset: '#FFA58C',      // Warmer sunset orange
          
          // Friendlier contrast colors
          cream: '#FFFAF5',       // Warmer cream background
          concrete: '#F8F6F3',    // Warmer concrete gray
          charcoal: '#4A4A4A',    // Softer charcoal (less harsh)
          
          // Gentler neon accents
          neon: '#FF6B9D',        // Softer electric pink
          glow: '#FF91B8',        // Gentler pink glow
        },
        
        // Additional themes (preserved)
        neon: {
          cyan: '#00ffff',
          magenta: '#ff00ff', 
          green: '#00ff00',
          dark: '#0a0a0a',
        },
        organic: {
          forest: '#059669',
          amber: '#d97706',
          earth: '#dc2626',
          cream: '#f9fafb',
        }
      },
      
      // Enhanced shadows for brutalist depth
      boxShadow: {
        // NEW: Soft Stack Shadows 🧁 (Chonky but friendly)
        'soft-card': '0 8px 32px rgba(30, 30, 30, 0.08), 0 2px 8px rgba(30, 30, 30, 0.04)',
        'soft-hover': '0 12px 40px rgba(30, 30, 30, 0.12), 0 4px 16px rgba(30, 30, 30, 0.06)',
        'soft-glow': '0 0 0 1px rgba(255, 107, 157, 0.1), 0 0 32px rgba(255, 107, 157, 0.15)',
        'chonky': '8px 8px 0px rgba(30, 30, 30, 0.15)',
        'chonky-hover': '12px 12px 0px rgba(30, 30, 30, 0.2)',
        'button-primary': '0 4px 20px rgba(253, 160, 133, 0.4), 0 2px 8px rgba(253, 160, 133, 0.2)',
        'button-surprise': '0 4px 20px rgba(255, 107, 157, 0.4), 0 2px 8px rgba(255, 107, 157, 0.2)',
        
        // Original shadows (preserved)
        'voice-glow': '0 0 20px rgba(245, 158, 11, 0.4)',
        'voice-press': '0 2px 8px rgba(245, 158, 11, 0.3)',
        'neon-glow': '0 0 30px rgba(0, 255, 255, 0.5)',
        
        // NEW: Flamingo brutalist shadows
        'flamingo-glow': '0 0 40px rgba(255, 105, 180, 0.4), 0 0 80px rgba(255, 182, 193, 0.2)',
        'flamingo-press': '0 8px 25px rgba(255, 107, 157, 0.3)',
        'brutalist-chunky': '8px 8px 0px rgba(44, 44, 44, 0.8)',
        'brutalist-float': '12px 12px 24px rgba(255, 107, 157, 0.3), 0 0 40px rgba(255, 182, 193, 0.2)',
        'sunset-halo': '0 0 60px rgba(255, 149, 117, 0.4), 0 0 120px rgba(255, 171, 145, 0.2)',
        
        // Chunky card shadows
        'card-chunky': '6px 6px 0px rgba(44, 44, 44, 0.1)',
        'card-float': '0 20px 40px rgba(255, 107, 157, 0.15)',
      },
      
      // Enhanced border radius for soft brutalism
      borderRadius: {
        'chunky': '12px',
        'brutalist': '8px',
        'soft': '16px',
        'extra-soft': '24px',
      },
      
      backdropBlur: {
        'voice': '12px',
        'flamingo': '16px',
      },
      
      // Custom border widths for chunky elements
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '5': '5px',
        '6': '6px',
      },
    },
  },
  // Custom styles for our design studio
  preflight: {
    '.slider-flamingo::-webkit-slider-thumb': {
      'appearance': 'none',
      'height': '20px',
      'width': '20px', 
      'border-radius': '6px',
      'background': '#FF8FA3',
      'border': '2px solid #4A4A4A',
      'cursor': 'pointer',
      'box-shadow': '2px 2px 0px rgba(74, 74, 74, 0.5)',
    },
    '.slider-flamingo::-webkit-slider-thumb:hover': {
      'background': '#FF6B9D',
      'transform': 'scale(1.1)',
    },
    '.slider-flamingo::-moz-range-thumb': {
      'height': '20px',
      'width': '20px',
      'border-radius': '6px', 
      'background': '#FF8FA3',
      'border': '2px solid #4A4A4A',
      'cursor': 'pointer',
      'box-shadow': '2px 2px 0px rgba(74, 74, 74, 0.5)',
    },
    
    // NEW: Soft Stack Slider Styling
    '.slider-soft::-webkit-slider-thumb': {
      'appearance': 'none',
      'height': '24px',
      'width': '24px', 
      'border-radius': '12px',
      'background': '#ff6b9d',
      'border': '3px solid #ffffff',
      'cursor': 'pointer',
      'box-shadow': '0 4px 12px rgba(255, 107, 157, 0.3)',
      'transition': 'all 0.2s ease',
    },
    '.slider-soft::-webkit-slider-thumb:hover': {
      'background': '#ff4d8a',
      'transform': 'scale(1.1)',
      'box-shadow': '0 6px 20px rgba(255, 107, 157, 0.4)',
    },
    '.slider-soft::-moz-range-thumb': {
      'height': '24px',
      'width': '24px',
      'border-radius': '12px', 
      'background': '#ff6b9d',
      'border': '3px solid #ffffff',
      'cursor': 'pointer',
      'box-shadow': '0 4px 12px rgba(255, 107, 157, 0.3)',
    },
  },
} as Options;
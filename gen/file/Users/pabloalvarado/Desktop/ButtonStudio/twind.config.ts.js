export default {
  selfURL: import.meta.url,
  theme: {
    extend: {
      // Custom fonts for chunky typography
      fontFamily: {
        'brutalist': [
          'Inter',
          'system-ui',
          'sans-serif'
        ],
        'chunky': [
          'Inter Black',
          'Inter',
          'system-ui',
          'sans-serif'
        ]
      },
      // Enhanced font weights
      fontWeight: {
        'chunky': '900',
        'thick': '800',
        'bold': '700',
        'medium': '500',
        'normal': '400'
      },
      // Generous letter spacing for brutalist feel
      letterSpacing: {
        'chunky': '0.05em',
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em'
      },
      // Enhanced size scale for chonky elements
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem'
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
        'slide-down': 'slide-down 0.3s ease-out'
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)'
          },
          '50%': {
            opacity: '0.8',
            transform: 'scale(1.02)'
          }
        },
        'breathe': {
          '0%, 100%': {
            transform: 'scale(1)'
          },
          '50%': {
            transform: 'scale(1.05)'
          }
        },
        'recording-pulse': {
          '0%': {
            opacity: '1',
            transform: 'scale(1)'
          },
          '50%': {
            opacity: '0.7',
            transform: 'scale(1.08)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          }
        },
        'success-pop': {
          '0%': {
            transform: 'scale(1)'
          },
          '50%': {
            transform: 'scale(1.2)'
          },
          '100%': {
            transform: 'scale(1)'
          }
        },
        'error-shake': {
          '0%, 100%': {
            transform: 'translateX(0)'
          },
          '25%': {
            transform: 'translateX(-5px)'
          },
          '75%': {
            transform: 'translateX(5px)'
          }
        },
        'waveform': {
          '0%': {
            transform: 'scaleY(0.3)'
          },
          '100%': {
            transform: 'scaleY(1)'
          }
        },
        'flamingo-glow': {
          '0%, 100%': {
            boxShadow: '0 0 40px rgba(255, 105, 180, 0.3), 0 0 80px rgba(255, 182, 193, 0.2)'
          },
          '50%': {
            boxShadow: '0 0 60px rgba(255, 105, 180, 0.5), 0 0 120px rgba(255, 182, 193, 0.3)'
          }
        },
        'sunset-pulse': {
          '0%, 100%': {
            transform: 'scale(1)',
            opacity: '0.9'
          },
          '50%': {
            transform: 'scale(1.02)',
            opacity: '1'
          }
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px)'
          },
          '50%': {
            transform: 'translateY(-10px)'
          }
        },
        'slide-in-right': {
          '0%': {
            transform: 'translateX(100%)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateX(0)',
            opacity: '1'
          }
        },
        'slide-down': {
          '0%': {
            transform: 'translateY(-10px)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1'
          }
        }
      },
      colors: {
        // NEW: Soft Stack Theme 🧁 (Warm, Chonky, Friendly)
        soft: {
          // Backgrounds
          cream: '#fffaf5',
          paper: '#fefbf7',
          mist: '#f8f4f0',
          // Text colors
          charcoal: '#1e1e1e',
          slate: '#4a4a4a',
          quiet: '#6b6b6b',
          // Accent colors (chonky gradients)
          peach: '#fda085',
          coral: '#fd9892',
          sunset: '#f6d365',
          lavender: '#e1d7fb',
          mint: '#a8e6cf',
          // Interaction colors
          glow: '#ff6b9d',
          success: '#22c55e',
          warning: '#f59e0b'
        },
        // Pablo's Original Amber Theme (preserved)
        voice: {
          primary: '#f59e0b',
          secondary: '#fbbf24',
          accent: '#d97706',
          light: '#fef3c7',
          dark: '#92400e'
        },
        // NEW: Flamingo Chill Theme 🦩🌅 (Warmer & Friendlier)
        flamingo: {
          // Core peachy-purple palette (softened)
          primary: '#FF8FA3',
          secondary: '#FFB8CC',
          accent: '#FF9575',
          // Warmer purple accents
          purple: '#B19CD9',
          lavender: '#E0C3E0',
          violet: '#D4AFDD',
          // Sunset oranges/peaches (warmer)
          peach: '#FFBFA3',
          coral: '#FF8B6B',
          sunset: '#FFA58C',
          // Friendlier contrast colors
          cream: '#FFFAF5',
          concrete: '#F8F6F3',
          charcoal: '#4A4A4A',
          // Gentler neon accents
          neon: '#FF6B9D',
          glow: '#FF91B8'
        },
        // Additional themes (preserved)
        neon: {
          cyan: '#00ffff',
          magenta: '#ff00ff',
          green: '#00ff00',
          dark: '#0a0a0a'
        },
        organic: {
          forest: '#059669',
          amber: '#d97706',
          earth: '#dc2626',
          cream: '#f9fafb'
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
        'card-float': '0 20px 40px rgba(255, 107, 157, 0.15)'
      },
      // Enhanced border radius for soft brutalism
      borderRadius: {
        'chunky': '12px',
        'brutalist': '8px',
        'soft': '16px',
        'extra-soft': '24px'
      },
      backdropBlur: {
        'voice': '12px',
        'flamingo': '16px'
      },
      // Custom border widths for chunky elements
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '5': '5px',
        '6': '6px'
      }
    }
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
      'box-shadow': '2px 2px 0px rgba(74, 74, 74, 0.5)'
    },
    '.slider-flamingo::-webkit-slider-thumb:hover': {
      'background': '#FF6B9D',
      'transform': 'scale(1.1)'
    },
    '.slider-flamingo::-moz-range-thumb': {
      'height': '20px',
      'width': '20px',
      'border-radius': '6px',
      'background': '#FF8FA3',
      'border': '2px solid #4A4A4A',
      'cursor': 'pointer',
      'box-shadow': '2px 2px 0px rgba(74, 74, 74, 0.5)'
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
      'transition': 'all 0.2s ease'
    },
    '.slider-soft::-webkit-slider-thumb:hover': {
      'background': '#ff4d8a',
      'transform': 'scale(1.1)',
      'box-shadow': '0 6px 20px rgba(255, 107, 157, 0.4)'
    },
    '.slider-soft::-moz-range-thumb': {
      'height': '24px',
      'width': '24px',
      'border-radius': '12px',
      'background': '#ff6b9d',
      'border': '3px solid #ffffff',
      'cursor': 'pointer',
      'box-shadow': '0 4px 12px rgba(255, 107, 157, 0.3)'
    }
  }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vVXNlcnMvcGFibG9hbHZhcmFkby9EZXNrdG9wL0J1dHRvblN0dWRpby90d2luZC5jb25maWcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgT3B0aW9ucyB9IGZyb20gXCJ0d2luZFwiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHNlbGZVUkw6IGltcG9ydC5tZXRhLnVybCxcbiAgdGhlbWU6IHtcbiAgICBleHRlbmQ6IHtcbiAgICAgIC8vIEN1c3RvbSBmb250cyBmb3IgY2h1bmt5IHR5cG9ncmFwaHlcbiAgICAgIGZvbnRGYW1pbHk6IHtcbiAgICAgICAgJ2JydXRhbGlzdCc6IFsnSW50ZXInLCAnc3lzdGVtLXVpJywgJ3NhbnMtc2VyaWYnXSxcbiAgICAgICAgJ2NodW5reSc6IFsnSW50ZXIgQmxhY2snLCAnSW50ZXInLCAnc3lzdGVtLXVpJywgJ3NhbnMtc2VyaWYnXSxcbiAgICAgIH0sXG4gICAgICBcbiAgICAgIC8vIEVuaGFuY2VkIGZvbnQgd2VpZ2h0c1xuICAgICAgZm9udFdlaWdodDoge1xuICAgICAgICAnY2h1bmt5JzogJzkwMCcsXG4gICAgICAgICd0aGljayc6ICc4MDAnLFxuICAgICAgICAnYm9sZCc6ICc3MDAnLFxuICAgICAgICAnbWVkaXVtJzogJzUwMCcsXG4gICAgICAgICdub3JtYWwnOiAnNDAwJyxcbiAgICAgIH0sXG4gICAgICBcbiAgICAgIC8vIEdlbmVyb3VzIGxldHRlciBzcGFjaW5nIGZvciBicnV0YWxpc3QgZmVlbFxuICAgICAgbGV0dGVyU3BhY2luZzoge1xuICAgICAgICAnY2h1bmt5JzogJzAuMDVlbScsXG4gICAgICAgICd3aWRlJzogJzAuMDI1ZW0nLFxuICAgICAgICAnd2lkZXInOiAnMC4wNWVtJyxcbiAgICAgICAgJ3dpZGVzdCc6ICcwLjFlbScsXG4gICAgICB9LFxuICAgICAgXG4gICAgICAvLyBFbmhhbmNlZCBzaXplIHNjYWxlIGZvciBjaG9ua3kgZWxlbWVudHNcbiAgICAgIHNwYWNpbmc6IHtcbiAgICAgICAgJzE4JzogJzQuNXJlbScsICAgLy8gNzJweFxuICAgICAgICAnMjInOiAnNS41cmVtJywgICAvLyA4OHB4XG4gICAgICAgICcyNic6ICc2LjVyZW0nLCAgIC8vIDEwNHB4XG4gICAgICAgICczMCc6ICc3LjVyZW0nLCAgIC8vIDEyMHB4XG4gICAgICAgICczNCc6ICc4LjVyZW0nLCAgIC8vIDEzNnB4XG4gICAgICAgICczOCc6ICc5LjVyZW0nLCAgIC8vIDE1MnB4XG4gICAgICB9LFxuICAgICAgXG4gICAgICBhbmltYXRpb246IHtcbiAgICAgICAgJ3B1bHNlLWdsb3cnOiAncHVsc2UtZ2xvdyAycyBlYXNlLWluLW91dCBpbmZpbml0ZScsXG4gICAgICAgICdicmVhdGhlJzogJ2JyZWF0aGUgM3MgZWFzZS1pbi1vdXQgaW5maW5pdGUnLFxuICAgICAgICAncmVjb3JkaW5nLXB1bHNlJzogJ3JlY29yZGluZy1wdWxzZSAxcyBlYXNlLWluLW91dCBpbmZpbml0ZScsXG4gICAgICAgICdzdWNjZXNzLXBvcCc6ICdzdWNjZXNzLXBvcCAwLjZzIGVhc2Utb3V0JyxcbiAgICAgICAgJ2Vycm9yLXNoYWtlJzogJ2Vycm9yLXNoYWtlIDAuNXMgZWFzZS1pbi1vdXQnLFxuICAgICAgICAnd2F2ZWZvcm0nOiAnd2F2ZWZvcm0gMC44cyBlYXNlLWluLW91dCBpbmZpbml0ZSBhbHRlcm5hdGUnLFxuICAgICAgICAnZmxhbWluZ28tZ2xvdyc6ICdmbGFtaW5nby1nbG93IDRzIGVhc2UtaW4tb3V0IGluZmluaXRlJyxcbiAgICAgICAgJ3N1bnNldC1wdWxzZSc6ICdzdW5zZXQtcHVsc2UgM3MgZWFzZS1pbi1vdXQgaW5maW5pdGUnLFxuICAgICAgICAnZmxvYXQnOiAnZmxvYXQgNnMgZWFzZS1pbi1vdXQgaW5maW5pdGUnLFxuICAgICAgICAnc2xpZGUtaW4tcmlnaHQnOiAnc2xpZGUtaW4tcmlnaHQgMC4zcyBlYXNlLW91dCcsXG4gICAgICAgICdzbGlkZS1kb3duJzogJ3NsaWRlLWRvd24gMC4zcyBlYXNlLW91dCcsXG4gICAgICB9LFxuICAgICAgXG4gICAgICBrZXlmcmFtZXM6IHtcbiAgICAgICAgJ3B1bHNlLWdsb3cnOiB7XG4gICAgICAgICAgJzAlLCAxMDAlJzogeyBvcGFjaXR5OiAnMScsIHRyYW5zZm9ybTogJ3NjYWxlKDEpJyB9LFxuICAgICAgICAgICc1MCUnOiB7IG9wYWNpdHk6ICcwLjgnLCB0cmFuc2Zvcm06ICdzY2FsZSgxLjAyKScgfSxcbiAgICAgICAgfSxcbiAgICAgICAgJ2JyZWF0aGUnOiB7XG4gICAgICAgICAgJzAlLCAxMDAlJzogeyB0cmFuc2Zvcm06ICdzY2FsZSgxKScgfSxcbiAgICAgICAgICAnNTAlJzogeyB0cmFuc2Zvcm06ICdzY2FsZSgxLjA1KScgfSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3JlY29yZGluZy1wdWxzZSc6IHtcbiAgICAgICAgICAnMCUnOiB7IG9wYWNpdHk6ICcxJywgdHJhbnNmb3JtOiAnc2NhbGUoMSknIH0sXG4gICAgICAgICAgJzUwJSc6IHsgb3BhY2l0eTogJzAuNycsIHRyYW5zZm9ybTogJ3NjYWxlKDEuMDgpJyB9LFxuICAgICAgICAgICcxMDAlJzogeyBvcGFjaXR5OiAnMScsIHRyYW5zZm9ybTogJ3NjYWxlKDEpJyB9LFxuICAgICAgICB9LFxuICAgICAgICAnc3VjY2Vzcy1wb3AnOiB7XG4gICAgICAgICAgJzAlJzogeyB0cmFuc2Zvcm06ICdzY2FsZSgxKScgfSxcbiAgICAgICAgICAnNTAlJzogeyB0cmFuc2Zvcm06ICdzY2FsZSgxLjIpJyB9LFxuICAgICAgICAgICcxMDAlJzogeyB0cmFuc2Zvcm06ICdzY2FsZSgxKScgfSxcbiAgICAgICAgfSxcbiAgICAgICAgJ2Vycm9yLXNoYWtlJzoge1xuICAgICAgICAgICcwJSwgMTAwJSc6IHsgdHJhbnNmb3JtOiAndHJhbnNsYXRlWCgwKScgfSxcbiAgICAgICAgICAnMjUlJzogeyB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKC01cHgpJyB9LFxuICAgICAgICAgICc3NSUnOiB7IHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVgoNXB4KScgfSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3dhdmVmb3JtJzoge1xuICAgICAgICAgICcwJSc6IHsgdHJhbnNmb3JtOiAnc2NhbGVZKDAuMyknIH0sXG4gICAgICAgICAgJzEwMCUnOiB7IHRyYW5zZm9ybTogJ3NjYWxlWSgxKScgfSxcbiAgICAgICAgfSxcbiAgICAgICAgJ2ZsYW1pbmdvLWdsb3cnOiB7XG4gICAgICAgICAgJzAlLCAxMDAlJzogeyBcbiAgICAgICAgICAgIGJveFNoYWRvdzogJzAgMCA0MHB4IHJnYmEoMjU1LCAxMDUsIDE4MCwgMC4zKSwgMCAwIDgwcHggcmdiYSgyNTUsIDE4MiwgMTkzLCAwLjIpJyBcbiAgICAgICAgICB9LFxuICAgICAgICAgICc1MCUnOiB7IFxuICAgICAgICAgICAgYm94U2hhZG93OiAnMCAwIDYwcHggcmdiYSgyNTUsIDEwNSwgMTgwLCAwLjUpLCAwIDAgMTIwcHggcmdiYSgyNTUsIDE4MiwgMTkzLCAwLjMpJyBcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICAnc3Vuc2V0LXB1bHNlJzoge1xuICAgICAgICAgICcwJSwgMTAwJSc6IHsgdHJhbnNmb3JtOiAnc2NhbGUoMSknLCBvcGFjaXR5OiAnMC45JyB9LFxuICAgICAgICAgICc1MCUnOiB7IHRyYW5zZm9ybTogJ3NjYWxlKDEuMDIpJywgb3BhY2l0eTogJzEnIH0sXG4gICAgICAgIH0sXG4gICAgICAgICdmbG9hdCc6IHtcbiAgICAgICAgICAnMCUsIDEwMCUnOiB7IHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVkoMHB4KScgfSxcbiAgICAgICAgICAnNTAlJzogeyB0cmFuc2Zvcm06ICd0cmFuc2xhdGVZKC0xMHB4KScgfSxcbiAgICAgICAgfSxcbiAgICAgICAgJ3NsaWRlLWluLXJpZ2h0Jzoge1xuICAgICAgICAgICcwJSc6IHsgdHJhbnNmb3JtOiAndHJhbnNsYXRlWCgxMDAlKScsIG9wYWNpdHk6ICcwJyB9LFxuICAgICAgICAgICcxMDAlJzogeyB0cmFuc2Zvcm06ICd0cmFuc2xhdGVYKDApJywgb3BhY2l0eTogJzEnIH0sXG4gICAgICAgIH0sXG4gICAgICAgICdzbGlkZS1kb3duJzoge1xuICAgICAgICAgICcwJSc6IHsgdHJhbnNmb3JtOiAndHJhbnNsYXRlWSgtMTBweCknLCBvcGFjaXR5OiAnMCcgfSxcbiAgICAgICAgICAnMTAwJSc6IHsgdHJhbnNmb3JtOiAndHJhbnNsYXRlWSgwKScsIG9wYWNpdHk6ICcxJyB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIFxuICAgICAgY29sb3JzOiB7XG4gICAgICAgIC8vIE5FVzogU29mdCBTdGFjayBUaGVtZSDwn6eBIChXYXJtLCBDaG9ua3ksIEZyaWVuZGx5KVxuICAgICAgICBzb2Z0OiB7XG4gICAgICAgICAgLy8gQmFja2dyb3VuZHNcbiAgICAgICAgICBjcmVhbTogJyNmZmZhZjUnLCAgICAgIC8vIE1haW4gYmFja2dyb3VuZCAtIHdhcm0gY3JlYW1cbiAgICAgICAgICBwYXBlcjogJyNmZWZiZjcnLCAgICAgIC8vIENhcmQgYmFja2dyb3VuZHMgLSBzbGlnaHRseSB3YXJtZXJcbiAgICAgICAgICBtaXN0OiAnI2Y4ZjRmMCcsICAgICAgIC8vIFN1YnRsZSBzZWN0aW9uIGRpdmlkZXJzXG4gICAgICAgICAgXG4gICAgICAgICAgLy8gVGV4dCBjb2xvcnNcbiAgICAgICAgICBjaGFyY29hbDogJyMxZTFlMWUnLCAgIC8vIFByaW1hcnkgdGV4dCAtIGZyaWVuZGx5IGRhcmtcbiAgICAgICAgICBzbGF0ZTogJyM0YTRhNGEnLCAgICAgIC8vIFNlY29uZGFyeSB0ZXh0XG4gICAgICAgICAgcXVpZXQ6ICcjNmI2YjZiJywgICAgICAvLyBNdXRlZCB0ZXh0XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gQWNjZW50IGNvbG9ycyAoY2hvbmt5IGdyYWRpZW50cylcbiAgICAgICAgICBwZWFjaDogJyNmZGEwODUnLCAgICAgIC8vIFdhcm0gcGVhY2hcbiAgICAgICAgICBjb3JhbDogJyNmZDk4OTInLCAgICAgIC8vIFNvZnQgY29yYWwgIFxuICAgICAgICAgIHN1bnNldDogJyNmNmQzNjUnLCAgICAgLy8gR29sZGVuIHN1bnNldFxuICAgICAgICAgIGxhdmVuZGVyOiAnI2UxZDdmYicsICAgLy8gU29mdCBwdXJwbGVcbiAgICAgICAgICBtaW50OiAnI2E4ZTZjZicsICAgICAgIC8vIEdlbnRsZSBtaW50XG4gICAgICAgICAgXG4gICAgICAgICAgLy8gSW50ZXJhY3Rpb24gY29sb3JzXG4gICAgICAgICAgZ2xvdzogJyNmZjZiOWQnLCAgICAgICAvLyBQaW5rIGdsb3cgZm9yIGhpZ2hsaWdodHNcbiAgICAgICAgICBzdWNjZXNzOiAnIzIyYzU1ZScsICAgIC8vIFN1Y2Nlc3MgYWN0aW9uc1xuICAgICAgICAgIHdhcm5pbmc6ICcjZjU5ZTBiJywgICAgLy8gV2FybmluZyBzdGF0ZXNcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIC8vIFBhYmxvJ3MgT3JpZ2luYWwgQW1iZXIgVGhlbWUgKHByZXNlcnZlZClcbiAgICAgICAgdm9pY2U6IHtcbiAgICAgICAgICBwcmltYXJ5OiAnI2Y1OWUwYicsICAgIC8vIGFtYmVyLTUwMFxuICAgICAgICAgIHNlY29uZGFyeTogJyNmYmJmMjQnLCAgLy8gYW1iZXItNDAwICBcbiAgICAgICAgICBhY2NlbnQ6ICcjZDk3NzA2JywgICAgIC8vIGFtYmVyLTYwMFxuICAgICAgICAgIGxpZ2h0OiAnI2ZlZjNjNycsICAgICAgLy8gYW1iZXItMTAwXG4gICAgICAgICAgZGFyazogJyM5MjQwMGUnLCAgICAgICAvLyBhbWJlci04MDBcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIC8vIE5FVzogRmxhbWluZ28gQ2hpbGwgVGhlbWUg8J+mqfCfjIUgKFdhcm1lciAmIEZyaWVuZGxpZXIpXG4gICAgICAgIGZsYW1pbmdvOiB7XG4gICAgICAgICAgLy8gQ29yZSBwZWFjaHktcHVycGxlIHBhbGV0dGUgKHNvZnRlbmVkKVxuICAgICAgICAgIHByaW1hcnk6ICcjRkY4RkEzJywgICAgIC8vIFNvZnRlciBjb3JhbCBwaW5rICh3YXMgaG90IHBpbmspXG4gICAgICAgICAgc2Vjb25kYXJ5OiAnI0ZGQjhDQycsICAgLy8gV2FybWVyIHBlYWNoeSBwaW5rXG4gICAgICAgICAgYWNjZW50OiAnI0ZGOTU3NScsICAgICAgLy8gR2VudGxlIHN1bnNldCBjb3JhbFxuICAgICAgICAgIFxuICAgICAgICAgIC8vIFdhcm1lciBwdXJwbGUgYWNjZW50c1xuICAgICAgICAgIHB1cnBsZTogJyNCMTlDRDknLCAgICAgIC8vIFNvZnRlciBsYXZlbmRlciBwdXJwbGVcbiAgICAgICAgICBsYXZlbmRlcjogJyNFMEMzRTAnLCAgICAvLyBFdmVuIGdlbnRsZXIgbGF2ZW5kZXJcbiAgICAgICAgICB2aW9sZXQ6ICcjRDRBRkREJywgICAgICAvLyBXYXJtIGxpZ2h0IHZpb2xldFxuICAgICAgICAgIFxuICAgICAgICAgIC8vIFN1bnNldCBvcmFuZ2VzL3BlYWNoZXMgKHdhcm1lcilcbiAgICAgICAgICBwZWFjaDogJyNGRkJGQTMnLCAgICAgICAvLyBXYXJtZXIgc29mdCBwZWFjaFxuICAgICAgICAgIGNvcmFsOiAnI0ZGOEI2QicsICAgICAgIC8vIEZyaWVuZGxpZXIgY29yYWxcbiAgICAgICAgICBzdW5zZXQ6ICcjRkZBNThDJywgICAgICAvLyBXYXJtZXIgc3Vuc2V0IG9yYW5nZVxuICAgICAgICAgIFxuICAgICAgICAgIC8vIEZyaWVuZGxpZXIgY29udHJhc3QgY29sb3JzXG4gICAgICAgICAgY3JlYW06ICcjRkZGQUY1JywgICAgICAgLy8gV2FybWVyIGNyZWFtIGJhY2tncm91bmRcbiAgICAgICAgICBjb25jcmV0ZTogJyNGOEY2RjMnLCAgICAvLyBXYXJtZXIgY29uY3JldGUgZ3JheVxuICAgICAgICAgIGNoYXJjb2FsOiAnIzRBNEE0QScsICAgIC8vIFNvZnRlciBjaGFyY29hbCAobGVzcyBoYXJzaClcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBHZW50bGVyIG5lb24gYWNjZW50c1xuICAgICAgICAgIG5lb246ICcjRkY2QjlEJywgICAgICAgIC8vIFNvZnRlciBlbGVjdHJpYyBwaW5rXG4gICAgICAgICAgZ2xvdzogJyNGRjkxQjgnLCAgICAgICAgLy8gR2VudGxlciBwaW5rIGdsb3dcbiAgICAgICAgfSxcbiAgICAgICAgXG4gICAgICAgIC8vIEFkZGl0aW9uYWwgdGhlbWVzIChwcmVzZXJ2ZWQpXG4gICAgICAgIG5lb246IHtcbiAgICAgICAgICBjeWFuOiAnIzAwZmZmZicsXG4gICAgICAgICAgbWFnZW50YTogJyNmZjAwZmYnLCBcbiAgICAgICAgICBncmVlbjogJyMwMGZmMDAnLFxuICAgICAgICAgIGRhcms6ICcjMGEwYTBhJyxcbiAgICAgICAgfSxcbiAgICAgICAgb3JnYW5pYzoge1xuICAgICAgICAgIGZvcmVzdDogJyMwNTk2NjknLFxuICAgICAgICAgIGFtYmVyOiAnI2Q5NzcwNicsXG4gICAgICAgICAgZWFydGg6ICcjZGMyNjI2JyxcbiAgICAgICAgICBjcmVhbTogJyNmOWZhZmInLFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXG4gICAgICAvLyBFbmhhbmNlZCBzaGFkb3dzIGZvciBicnV0YWxpc3QgZGVwdGhcbiAgICAgIGJveFNoYWRvdzoge1xuICAgICAgICAvLyBORVc6IFNvZnQgU3RhY2sgU2hhZG93cyDwn6eBIChDaG9ua3kgYnV0IGZyaWVuZGx5KVxuICAgICAgICAnc29mdC1jYXJkJzogJzAgOHB4IDMycHggcmdiYSgzMCwgMzAsIDMwLCAwLjA4KSwgMCAycHggOHB4IHJnYmEoMzAsIDMwLCAzMCwgMC4wNCknLFxuICAgICAgICAnc29mdC1ob3Zlcic6ICcwIDEycHggNDBweCByZ2JhKDMwLCAzMCwgMzAsIDAuMTIpLCAwIDRweCAxNnB4IHJnYmEoMzAsIDMwLCAzMCwgMC4wNiknLFxuICAgICAgICAnc29mdC1nbG93JzogJzAgMCAwIDFweCByZ2JhKDI1NSwgMTA3LCAxNTcsIDAuMSksIDAgMCAzMnB4IHJnYmEoMjU1LCAxMDcsIDE1NywgMC4xNSknLFxuICAgICAgICAnY2hvbmt5JzogJzhweCA4cHggMHB4IHJnYmEoMzAsIDMwLCAzMCwgMC4xNSknLFxuICAgICAgICAnY2hvbmt5LWhvdmVyJzogJzEycHggMTJweCAwcHggcmdiYSgzMCwgMzAsIDMwLCAwLjIpJyxcbiAgICAgICAgJ2J1dHRvbi1wcmltYXJ5JzogJzAgNHB4IDIwcHggcmdiYSgyNTMsIDE2MCwgMTMzLCAwLjQpLCAwIDJweCA4cHggcmdiYSgyNTMsIDE2MCwgMTMzLCAwLjIpJyxcbiAgICAgICAgJ2J1dHRvbi1zdXJwcmlzZSc6ICcwIDRweCAyMHB4IHJnYmEoMjU1LCAxMDcsIDE1NywgMC40KSwgMCAycHggOHB4IHJnYmEoMjU1LCAxMDcsIDE1NywgMC4yKScsXG4gICAgICAgIFxuICAgICAgICAvLyBPcmlnaW5hbCBzaGFkb3dzIChwcmVzZXJ2ZWQpXG4gICAgICAgICd2b2ljZS1nbG93JzogJzAgMCAyMHB4IHJnYmEoMjQ1LCAxNTgsIDExLCAwLjQpJyxcbiAgICAgICAgJ3ZvaWNlLXByZXNzJzogJzAgMnB4IDhweCByZ2JhKDI0NSwgMTU4LCAxMSwgMC4zKScsXG4gICAgICAgICduZW9uLWdsb3cnOiAnMCAwIDMwcHggcmdiYSgwLCAyNTUsIDI1NSwgMC41KScsXG4gICAgICAgIFxuICAgICAgICAvLyBORVc6IEZsYW1pbmdvIGJydXRhbGlzdCBzaGFkb3dzXG4gICAgICAgICdmbGFtaW5nby1nbG93JzogJzAgMCA0MHB4IHJnYmEoMjU1LCAxMDUsIDE4MCwgMC40KSwgMCAwIDgwcHggcmdiYSgyNTUsIDE4MiwgMTkzLCAwLjIpJyxcbiAgICAgICAgJ2ZsYW1pbmdvLXByZXNzJzogJzAgOHB4IDI1cHggcmdiYSgyNTUsIDEwNywgMTU3LCAwLjMpJyxcbiAgICAgICAgJ2JydXRhbGlzdC1jaHVua3knOiAnOHB4IDhweCAwcHggcmdiYSg0NCwgNDQsIDQ0LCAwLjgpJyxcbiAgICAgICAgJ2JydXRhbGlzdC1mbG9hdCc6ICcxMnB4IDEycHggMjRweCByZ2JhKDI1NSwgMTA3LCAxNTcsIDAuMyksIDAgMCA0MHB4IHJnYmEoMjU1LCAxODIsIDE5MywgMC4yKScsXG4gICAgICAgICdzdW5zZXQtaGFsbyc6ICcwIDAgNjBweCByZ2JhKDI1NSwgMTQ5LCAxMTcsIDAuNCksIDAgMCAxMjBweCByZ2JhKDI1NSwgMTcxLCAxNDUsIDAuMiknLFxuICAgICAgICBcbiAgICAgICAgLy8gQ2h1bmt5IGNhcmQgc2hhZG93c1xuICAgICAgICAnY2FyZC1jaHVua3knOiAnNnB4IDZweCAwcHggcmdiYSg0NCwgNDQsIDQ0LCAwLjEpJyxcbiAgICAgICAgJ2NhcmQtZmxvYXQnOiAnMCAyMHB4IDQwcHggcmdiYSgyNTUsIDEwNywgMTU3LCAwLjE1KScsXG4gICAgICB9LFxuICAgICAgXG4gICAgICAvLyBFbmhhbmNlZCBib3JkZXIgcmFkaXVzIGZvciBzb2Z0IGJydXRhbGlzbVxuICAgICAgYm9yZGVyUmFkaXVzOiB7XG4gICAgICAgICdjaHVua3knOiAnMTJweCcsXG4gICAgICAgICdicnV0YWxpc3QnOiAnOHB4JyxcbiAgICAgICAgJ3NvZnQnOiAnMTZweCcsXG4gICAgICAgICdleHRyYS1zb2Z0JzogJzI0cHgnLFxuICAgICAgfSxcbiAgICAgIFxuICAgICAgYmFja2Ryb3BCbHVyOiB7XG4gICAgICAgICd2b2ljZSc6ICcxMnB4JyxcbiAgICAgICAgJ2ZsYW1pbmdvJzogJzE2cHgnLFxuICAgICAgfSxcbiAgICAgIFxuICAgICAgLy8gQ3VzdG9tIGJvcmRlciB3aWR0aHMgZm9yIGNodW5reSBlbGVtZW50c1xuICAgICAgYm9yZGVyV2lkdGg6IHtcbiAgICAgICAgJzMnOiAnM3B4JyxcbiAgICAgICAgJzQnOiAnNHB4JyxcbiAgICAgICAgJzUnOiAnNXB4JyxcbiAgICAgICAgJzYnOiAnNnB4JyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgLy8gQ3VzdG9tIHN0eWxlcyBmb3Igb3VyIGRlc2lnbiBzdHVkaW9cbiAgcHJlZmxpZ2h0OiB7XG4gICAgJy5zbGlkZXItZmxhbWluZ286Oi13ZWJraXQtc2xpZGVyLXRodW1iJzoge1xuICAgICAgJ2FwcGVhcmFuY2UnOiAnbm9uZScsXG4gICAgICAnaGVpZ2h0JzogJzIwcHgnLFxuICAgICAgJ3dpZHRoJzogJzIwcHgnLCBcbiAgICAgICdib3JkZXItcmFkaXVzJzogJzZweCcsXG4gICAgICAnYmFja2dyb3VuZCc6ICcjRkY4RkEzJyxcbiAgICAgICdib3JkZXInOiAnMnB4IHNvbGlkICM0QTRBNEEnLFxuICAgICAgJ2N1cnNvcic6ICdwb2ludGVyJyxcbiAgICAgICdib3gtc2hhZG93JzogJzJweCAycHggMHB4IHJnYmEoNzQsIDc0LCA3NCwgMC41KScsXG4gICAgfSxcbiAgICAnLnNsaWRlci1mbGFtaW5nbzo6LXdlYmtpdC1zbGlkZXItdGh1bWI6aG92ZXInOiB7XG4gICAgICAnYmFja2dyb3VuZCc6ICcjRkY2QjlEJyxcbiAgICAgICd0cmFuc2Zvcm0nOiAnc2NhbGUoMS4xKScsXG4gICAgfSxcbiAgICAnLnNsaWRlci1mbGFtaW5nbzo6LW1vei1yYW5nZS10aHVtYic6IHtcbiAgICAgICdoZWlnaHQnOiAnMjBweCcsXG4gICAgICAnd2lkdGgnOiAnMjBweCcsXG4gICAgICAnYm9yZGVyLXJhZGl1cyc6ICc2cHgnLCBcbiAgICAgICdiYWNrZ3JvdW5kJzogJyNGRjhGQTMnLFxuICAgICAgJ2JvcmRlcic6ICcycHggc29saWQgIzRBNEE0QScsXG4gICAgICAnY3Vyc29yJzogJ3BvaW50ZXInLFxuICAgICAgJ2JveC1zaGFkb3cnOiAnMnB4IDJweCAwcHggcmdiYSg3NCwgNzQsIDc0LCAwLjUpJyxcbiAgICB9LFxuICAgIFxuICAgIC8vIE5FVzogU29mdCBTdGFjayBTbGlkZXIgU3R5bGluZ1xuICAgICcuc2xpZGVyLXNvZnQ6Oi13ZWJraXQtc2xpZGVyLXRodW1iJzoge1xuICAgICAgJ2FwcGVhcmFuY2UnOiAnbm9uZScsXG4gICAgICAnaGVpZ2h0JzogJzI0cHgnLFxuICAgICAgJ3dpZHRoJzogJzI0cHgnLCBcbiAgICAgICdib3JkZXItcmFkaXVzJzogJzEycHgnLFxuICAgICAgJ2JhY2tncm91bmQnOiAnI2ZmNmI5ZCcsXG4gICAgICAnYm9yZGVyJzogJzNweCBzb2xpZCAjZmZmZmZmJyxcbiAgICAgICdjdXJzb3InOiAncG9pbnRlcicsXG4gICAgICAnYm94LXNoYWRvdyc6ICcwIDRweCAxMnB4IHJnYmEoMjU1LCAxMDcsIDE1NywgMC4zKScsXG4gICAgICAndHJhbnNpdGlvbic6ICdhbGwgMC4ycyBlYXNlJyxcbiAgICB9LFxuICAgICcuc2xpZGVyLXNvZnQ6Oi13ZWJraXQtc2xpZGVyLXRodW1iOmhvdmVyJzoge1xuICAgICAgJ2JhY2tncm91bmQnOiAnI2ZmNGQ4YScsXG4gICAgICAndHJhbnNmb3JtJzogJ3NjYWxlKDEuMSknLFxuICAgICAgJ2JveC1zaGFkb3cnOiAnMCA2cHggMjBweCByZ2JhKDI1NSwgMTA3LCAxNTcsIDAuNCknLFxuICAgIH0sXG4gICAgJy5zbGlkZXItc29mdDo6LW1vei1yYW5nZS10aHVtYic6IHtcbiAgICAgICdoZWlnaHQnOiAnMjRweCcsXG4gICAgICAnd2lkdGgnOiAnMjRweCcsXG4gICAgICAnYm9yZGVyLXJhZGl1cyc6ICcxMnB4JywgXG4gICAgICAnYmFja2dyb3VuZCc6ICcjZmY2YjlkJyxcbiAgICAgICdib3JkZXInOiAnM3B4IHNvbGlkICNmZmZmZmYnLFxuICAgICAgJ2N1cnNvcic6ICdwb2ludGVyJyxcbiAgICAgICdib3gtc2hhZG93JzogJzAgNHB4IDEycHggcmdiYSgyNTUsIDEwNywgMTU3LCAwLjMpJyxcbiAgICB9LFxuICB9LFxufSBhcyBPcHRpb25zOyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxlQUFlO0VBQ2IsU0FBUyxZQUFZLEdBQUc7RUFDeEIsT0FBTztJQUNMLFFBQVE7TUFDTixxQ0FBcUM7TUFDckMsWUFBWTtRQUNWLGFBQWE7VUFBQztVQUFTO1VBQWE7U0FBYTtRQUNqRCxVQUFVO1VBQUM7VUFBZTtVQUFTO1VBQWE7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
// denoCacheMetadata=7785103379720730009,8344120338191375617
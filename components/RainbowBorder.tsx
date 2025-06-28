// Flowing Rainbow Border Component for Ultimate Satisfaction
import { useEffect, useRef } from 'preact/hooks'

interface RainbowBorderProps {
  children: any
  isActive?: boolean
  borderRadius?: number
}

export default function RainbowBorder({ children, isActive = true, borderRadius = 16 }: RainbowBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  return (
    <div 
      ref={containerRef}
      class={`relative ${isActive ? 'rainbow-border-container' : ''}`}
      style={{
        borderRadius: `${borderRadius}px`
      }}
    >
      {/* Flowing rainbow background */}
      {isActive && (
        <div 
          class="absolute inset-0 -z-10 p-[4px]"
          style={{
            background: 'linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000)',
            backgroundSize: '400% 400%',
            animation: 'rainbow-flow 3s linear infinite',
            borderRadius: `${borderRadius + 4}px`
          }}
        >
          <div 
            class="w-full h-full bg-transparent"
            style={{
              borderRadius: `${borderRadius}px`
            }}
          />
        </div>
      )}
      
      {children}
      
      <style jsx>{`
        @keyframes rainbow-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .rainbow-border-container {
          background: linear-gradient(45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
          background-size: 400% 400%;
          animation: rainbow-flow 3s linear infinite;
          padding: 4px;
        }
      `}</style>
    </div>
  )
}
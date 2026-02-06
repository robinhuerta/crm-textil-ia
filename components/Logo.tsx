
import React from 'react';

interface LogoProps {
  className?: string;
  isIcon?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "w-full", isIcon = false }) => {
  // Usamos IDs únicos para evitar conflictos si hay varios logos en pantalla
  const gradientId = isIcon ? "brandGradientIcon" : "brandGradientFull";
  const starGradientId = isIcon ? "starGradientIcon" : "starGradientFull";

  return (
    <div className={`${className} flex items-center justify-center select-none filter drop-shadow-xl`}>
      <svg 
        viewBox={isIcon ? "0 0 500 500" : "0 0 900 350"} 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-auto overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#a3cf33', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#4DD0E1', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#29B6F6', stopOpacity: 1 }} />
          </linearGradient>

          <linearGradient id={starGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" style={{ stopColor: '#455A64', stopOpacity: 1 }} />
             <stop offset="100%" style={{ stopColor: '#263238', stopOpacity: 1 }} />
          </linearGradient>
          
          <filter id="glowEffect">
             <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
             <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
             </feMerge>
          </filter>
        </defs>

        {isIcon ? (
           /* --- VERSIÓN ICONO (Cuadrada) --- */
           <g>
              <circle cx="250" cy="250" r="240" fill="#05080f" stroke={`url(#${gradientId})`} strokeWidth="15" />
              
              {/* Fondo Estrella */}
              <path 
                d="M250 80 L300 180 L420 180 L330 260 L370 380 L250 310 L130 380 L170 260 L80 180 L200 180 Z" 
                fill={`url(#${starGradientId})`} 
                stroke="#3fb4e5"
                strokeWidth="2"
                opacity="0.8"
              />
              
              {/* Texto 5:40 - TRIPLE CAPA con espaciado mejorado */}
              <text x="250" y="320" textAnchor="middle" fontFamily="'Arial Black', 'Roboto', sans-serif" fontWeight="900" fontSize="160" fill="none" stroke="#000" strokeWidth="25" paintOrder="stroke" style={{ letterSpacing: '5px' }}>
                5:40
              </text>
              <text x="250" y="320" textAnchor="middle" fontFamily="'Arial Black', 'Roboto', sans-serif" fontWeight="900" fontSize="160" fill="white" style={{ letterSpacing: '5px' }}>
                5:40
              </text>
              <text x="250" y="320" textAnchor="middle" fontFamily="'Arial Black', 'Roboto', sans-serif" fontWeight="900" fontSize="160" fill={`url(#${gradientId})`} style={{ letterSpacing: '5px' }}>
                5:40
              </text>
           </g>
        ) : (
           /* --- VERSIÓN COMPLETA (Horizontal) --- */
           <g transform="translate(10, 20)">
              {/* Estrella Dinámica Izquierda */}
              <g transform="translate(20, 40) rotate(-10)">
                 <path d="M40 140 L160 140 L100 155 Z" fill="#3fb4e5" opacity="0.6" />
                 <path d="M30 180 L180 180 L120 195 Z" fill="#a3cf33" opacity="0.6" />
                 
                 <path 
                   d="M160 60 L195 145 L280 145 L215 200 L240 285 L160 230 L80 285 L105 200 L40 145 L125 145 Z" 
                   fill={`url(#${starGradientId})`} 
                   stroke="#a3cf33" 
                   strokeWidth="3"
                   filter="url(#glowEffect)"
                 />
              </g>

              {/* Grupo de Textos */}
              <g transform="translate(300, 0)">
                 {/* LA NUEVA */}
                 <text x="200" y="90" textAnchor="middle" fontFamily="'Arial', sans-serif" fontStyle="italic" fontWeight="900" fontSize="55" fill="white" style={{ letterSpacing: '4px' }}>
                    LA NUEVA
                 </text>
                 <circle cx="360" cy="70" r="6" fill="#3fb4e5" />
                 <circle cx="380" cy="70" r="6" fill="#a3cf33" />

                 {/* --- TEXTO 5:40 GIGANTE CON ESPACIADO --- */}
                 <text x="200" y="235" textAnchor="middle" fontFamily="'Arial Black', 'Roboto', sans-serif" fontWeight="900" fontSize="180" stroke="#000" strokeWidth="25" fill="none" style={{ letterSpacing: '10px' }}>
                    5:40
                 </text>
                 <text x="200" y="235" textAnchor="middle" fontFamily="'Arial Black', 'Roboto', sans-serif" fontWeight="900" fontSize="180" stroke="white" strokeWidth="8" fill="none" style={{ letterSpacing: '10px' }}>
                    5:40
                 </text>
                 <text x="200" y="235" textAnchor="middle" fontFamily="'Arial Black', 'Roboto', sans-serif" fontWeight="900" fontSize="180" fill={`url(#${gradientId})`} style={{ letterSpacing: '10px' }}>
                    5:40
                 </text>
                 
                 {/* RADIO Label */}
                 <g transform="translate(480, 160) rotate(-5)">
                    <rect x="0" y="0" width="140" height="50" rx="10" fill="white" />
                    <text x="70" y="38" textAnchor="middle" fontFamily="'Arial Black', sans-serif" fontWeight="900" fontSize="30" fill="#05080f">
                       RADIO
                    </text>
                 </g>
              </g>

              {/* Slogan */}
              <text x="450" y="330" textAnchor="middle" fontFamily="'Arial Black', sans-serif" fontWeight="900" fontSize="32" fill="#a3cf33" style={{ letterSpacing: '5px' }}>
                 ¡EL RITMO QUE TE MUEVE!
              </text>
           </g>
        )}
      </svg>
    </div>
  );
};

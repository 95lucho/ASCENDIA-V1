interface SaoAvatarProps {
  className?: string;
  floating?: boolean;
}

export function SaoAvatar({ className = "", floating = false }: SaoAvatarProps) {
  return (
    <div className={`${floating ? "animate-sao-float" : ""} inline-flex items-center justify-center ${className}`}>
      <svg
        width="160"
        height="140"
        viewBox="0 0 220 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Avatar SAO, sombrero de saó cruceño guía de ASCENDIA"
        className="w-full h-auto max-w-[160px]"
      >
        {/* Sombra suave inferior */}
        <ellipse cx="110" cy="158" rx="78" ry="10" fill="#1E3A5F" fillOpacity="0.12" />

        {/* Ala ancha trasera del sombrero de saó */}
        <path
          d="M18 112C18 92 59 78 110 78C161 78 202 92 202 112C202 132 161 146 110 146C59 146 18 132 18 112Z"
          fill="#DFC183"
          stroke="#9A7434"
          strokeWidth="3"
        />

        {/* Detalles de trenzado en el ala */}
        <path
          d="M32 112C48 124 78 131 110 131C142 131 172 124 188 112"
          stroke="#B88E46"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="6 5"
        />
        <path
          d="M26 105C45 117 76 123 110 123C144 123 175 117 194 105"
          stroke="#F6E8C6"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="4 6"
        />

        {/* Copa del sombrero de saó */}
        <path
          d="M62 104L68 48C70 30 88 20 110 20C132 20 150 30 152 48L158 104C142 111 78 111 62 104Z"
          fill="#F3E1B6"
          stroke="#9A7434"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Trama de tejido cruceño en la copa */}
        <path
          d="M74 38C96 43 124 43 146 38"
          stroke="#C49E59"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="5 4"
        />
        <path
          d="M70 52C95 57 125 57 150 52"
          stroke="#C49E59"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="5 4"
        />
        <path
          d="M67 66C94 71 126 71 153 66"
          stroke="#C49E59"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="5 4"
        />

        {/* Cinta institucional UAGRM (Azul y Rojo) */}
        <path
          d="M63 91C86 98 134 98 157 91L159 104C135 111 85 111 61 104L63 91Z"
          fill="#1E3A5F"
        />
        <path d="M62 98C86 105 134 105 158 98" stroke="#8B1E24" strokeWidth="3.5" />

        {/* Rostro amigable de SAO en la copa */}
        {/* Cejas */}
        <path
          d="M86 58C90 55 96 55 99 58"
          stroke="#6E4E1E"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M121 58C124 55 130 55 134 58"
          stroke="#6E4E1E"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Ojos */}
        <circle cx="93" cy="68" r="6" fill="#1E3A5F" />
        <circle cx="95" cy="66" r="2" fill="#FFFFFF" />

        <circle cx="127" cy="68" r="6" fill="#1E3A5F" />
        <circle cx="129" cy="66" r="2" fill="#FFFFFF" />

        {/* Mejillas cálidas */}
        <ellipse cx="82" cy="76" rx="5" ry="3" fill="#D97757" fillOpacity="0.35" />
        <ellipse cx="138" cy="76" rx="5" ry="3" fill="#D97757" fillOpacity="0.35" />

        {/* Sonrisa */}
        <path
          d="M101 77C105 83 115 83 119 77"
          stroke="#6E4E1E"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Borde frontal luminoso del ala */}
        <path
          d="M22 114C42 135 178 135 198 114"
          stroke="#F8ECCB"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

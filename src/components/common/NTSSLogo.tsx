import React from 'react';

interface NTSSLogoProps {
  className?: string;
  variant?: 'teal' | 'white' | 'dark' | 'auto';
  layout?: 'horizontal' | 'horizontal-reverse' | 'vertical' | 'emblem-only' | 'text-only';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

/**
 * Authentic NTSS (National Technical Science Schools - المدارس الوطنية للعلوم التقنية) Official Logo
 * Exactly faithful to the official emblem geometry and bilingual typography.
 */
export const NTSSEmblem: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-12 h-12',
  color = 'currentColor',
}) => {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="NTSS Emblem"
    >
      {/* Top Center Vertical Ray */}
      <rect x="54" y="16" width="12" height="34" fill={color} />

      {/* Top Left Diagonal Ray (-45 deg) */}
      <polygon points="27,24 36,15 62,41 53,50" fill={color} />

      {/* Top Right Diagonal Ray (+45 deg) */}
      <polygon points="93,24 84,15 58,41 67,50" fill={color} />

      {/* Middle Horizontal Bar */}
      <rect x="14" y="50" width="92" height="12" fill={color} />

      {/* Bottom Semicircle Arc (Bowl / Smile) */}
      <path
        d="M 21 72 A 39 39 0 0 0 99 72"
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="butt"
      />
    </svg>
  );
};

export const NTSSLogo: React.FC<NTSSLogoProps> = ({
  className = '',
  variant = 'teal',
  layout = 'horizontal',
  size = 'md',
  showSubtitle = true,
}) => {
  // Color configuration
  const colorMap = {
    teal: '#00908E',
    white: '#FFFFFF',
    dark: '#0F172A',
    auto: 'currentColor',
  };

  const currentColor = colorMap[variant] || colorMap.teal;

  // Sizing definitions
  const sizeConfig = {
    xs: {
      emblem: 'w-7 h-7',
      title: 'text-base font-black tracking-tight',
      enSubtitle: 'text-[7px] leading-tight font-extrabold tracking-wider',
      arSubtitle: 'text-[8px] leading-tight font-extrabold',
      gap: 'gap-2',
    },
    sm: {
      emblem: 'w-9 h-9',
      title: 'text-xl font-black tracking-tight',
      enSubtitle: 'text-[8px] leading-tight font-extrabold tracking-wider',
      arSubtitle: 'text-[9px] leading-tight font-extrabold',
      gap: 'gap-2.5',
    },
    md: {
      emblem: 'w-12 h-12',
      title: 'text-2xl sm:text-3xl font-black tracking-tight',
      enSubtitle: 'text-[9px] sm:text-[10px] leading-tight font-extrabold tracking-widest uppercase',
      arSubtitle: 'text-[11px] sm:text-xs leading-tight font-extrabold',
      gap: 'gap-3 sm:gap-4',
    },
    lg: {
      emblem: 'w-16 h-16',
      title: 'text-3xl sm:text-4xl font-black tracking-tight',
      enSubtitle: 'text-xs leading-tight font-extrabold tracking-widest uppercase',
      arSubtitle: 'text-sm leading-tight font-extrabold',
      gap: 'gap-4 sm:gap-5',
    },
    xl: {
      emblem: 'w-24 h-24',
      title: 'text-5xl sm:text-6xl font-black tracking-tight',
      enSubtitle: 'text-base leading-tight font-extrabold tracking-widest uppercase',
      arSubtitle: 'text-xl leading-tight font-extrabold',
      gap: 'gap-6',
    },
  };

  const currentSize = sizeConfig[size] || sizeConfig.md;

  if (layout === 'emblem-only') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <NTSSEmblem className={currentSize.emblem} color={currentColor} />
      </div>
    );
  }

  const textBlock = (
    <div
      className="flex flex-col justify-center text-left select-none"
      style={{ color: currentColor }}
    >
      <div className={`${currentSize.title} font-sans leading-none tracking-normal font-black`}>
        NTSS
      </div>
      {showSubtitle && (
        <div className="mt-1 space-y-0.5">
          <div className={`${currentSize.enSubtitle} opacity-95`}>
            NATIONAL TECHNICAL
          </div>
          <div className={`${currentSize.enSubtitle} opacity-95`}>
            SCIENCE SCHOOLS
          </div>
          <div
            className={`${currentSize.arSubtitle} text-right mt-1 opacity-95 font-bold`}
            dir="rtl"
          >
            المدارس الوطنية للعلوم التقنية
          </div>
        </div>
      )}
    </div>
  );

  if (layout === 'text-only') {
    return <div className={`inline-flex ${className}`}>{textBlock}</div>;
  }

  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center gap-3 ${className}`}>
        <NTSSEmblem className={currentSize.emblem} color={currentColor} />
        {textBlock}
      </div>
    );
  }

  // Exact matching layout with the official image:
  // Text block on Left, Emblem on Right (standard horizontal)
  if (layout === 'horizontal') {
    return (
      <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
        {textBlock}
        <div className="shrink-0">
          <NTSSEmblem className={currentSize.emblem} color={currentColor} />
        </div>
      </div>
    );
  }

  // Horizontal Reverse: Emblem on Left, Text block on Right
  return (
    <div className={`inline-flex items-center ${currentSize.gap} ${className}`}>
      <div className="shrink-0">
        <NTSSEmblem className={currentSize.emblem} color={currentColor} />
      </div>
      {textBlock}
    </div>
  );
};

export default NTSSLogo;

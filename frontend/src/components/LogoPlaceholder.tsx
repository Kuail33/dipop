import React, { useState } from 'react';

interface LogoPlaceholderProps {
  className?: string;
  width?: string;
  height?: string;
  variant?: 'compact' | 'standard' | 'large' | 'xlarge' | 'xxlarge';
}

// Drop a logo file at frontend/public/assets/logo.png (or .svg/.jpg) and it
// shows up automatically — no code change needed. Falls back to the gray
// placeholder box if no logo file is present yet.
const LOGO_SRC = '/assets/logo.png';

export const LogoPlaceholder: React.FC<LogoPlaceholderProps> = ({
  className = '',
  variant = 'standard',
}) => {
  const [logoFailed, setLogoFailed] = useState(false);

  const sizeClasses =
    variant === 'compact'
      ? 'w-16 h-8 text-xs'
      : variant === 'large'
      ? 'w-28 h-12 text-sm'
      : variant === 'xlarge'
      ? 'w-36 h-14 text-base'
      : variant === 'xxlarge'
      ? 'w-48 h-20 text-base'
      : 'w-20 h-9 text-xs';

  if (!logoFailed) {
    return (
      <img
        src={LOGO_SRC}
        alt="dipop logo"
        onError={() => setLogoFailed(true)}
        className={`object-contain select-none ${sizeClasses} ${className}`}
      />
    );
  }

  return (
    <div
      className={`border border-[#E1E6EF] bg-[#F1F4F9] text-[#6B7280] flex items-center justify-center font-medium select-none tracking-wide ${sizeClasses} ${className}`}
      aria-label="Logo placeholder"
      role="img"
    >
      Logo
    </div>
  );
};

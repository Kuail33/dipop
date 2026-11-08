import React from 'react';

interface MaterialIconProps {
  name: string;
  filled?: boolean;
  className?: string;
  size?: number | string;
  ariaLabel?: string;
}

export const MaterialIcon: React.FC<MaterialIconProps> = ({
  name,
  filled = false,
  className = '',
  size = 20,
  ariaLabel,
}) => {
  return (
    <span
      className={`material-symbols-outlined ${filled ? 'filled' : ''} ${className}`}
      style={{
        fontSize: typeof size === 'number' ? `${size}px` : size,
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
    >
      {name}
    </span>
  );
};

import React from 'react';

export default function MatIcon({
  name,
  size = 20,
  filled = false,
  className = '',
  style = {},
  ...props
}) {
  return (
    <span
      className={`material-symbols-rounded ${className}`}
      style={{
        fontSize: `${size}px`,
        width: `${size}px`,
        height: `${size}px`,
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        verticalAlign: 'middle',
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' ${Math.min(48, Math.max(20, size))}`,
        ...style
      }}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  );
}

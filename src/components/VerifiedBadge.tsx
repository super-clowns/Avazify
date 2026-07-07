import React from 'react';

interface VerifiedBadgeProps {
  size?: number;
  color?: string;
  tooltip?: string;
}

export default function VerifiedBadge({ 
  size = 16, 
  color = '#1d9bf0', 
  tooltip = 'هنرمند تایید شده پلتفرم' 
}: VerifiedBadgeProps) {
  return (
    <span 
      title={tooltip} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: `${size}px`, 
        height: `${size}px`,
        color: color,
        verticalAlign: 'middle',
        cursor: 'help',
        flexShrink: 0
      }}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '100%', height: '100%' }}>
        <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.941.1-1.358.273C14.77 2.525 13.5 1.5 12 1.5s-2.77 1.025-3.412 2.283C7.17 3.6 7.71 3.5 7.23 3.5 5.122 3.5 3.41 5.28 3.41 7.49c0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .941-.1 1.358-.273C9.23 21.475 10.5 22.5 12 22.5s2.77-1.025 3.412-2.283c.417.173.878.273 1.358.273 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.5 4L6 12.5l1.41-1.42L10 13.67l6.59-6.59L18 8.5l-8 8z"/>
      </svg>
    </span>
  );
}
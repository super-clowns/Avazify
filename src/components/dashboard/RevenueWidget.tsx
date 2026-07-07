import React from 'react';

interface RevenueWidgetProps {
  title: string;
  amount: string;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
}

export default function RevenueWidget({ title, amount, borderColor, backgroundColor, textColor }: RevenueWidgetProps) {
  return (
    <div 
      style={{ 
        flex: 1, 
        padding: '20px', 
        backgroundColor: backgroundColor, 
        borderRight: `5px solid ${borderColor}`, 
        borderRadius: '6px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        direction: 'rtl',
        transition: 'transform 0.2s',
        cursor: 'default'
      }}
    >
      <span style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '8px' }}>
        {title}
      </span>
      <h2 style={{ margin: 0, color: textColor, fontSize: '22px', fontWeight: 'bold' }}>
        {amount}
      </h2>
    </div>
  );
}
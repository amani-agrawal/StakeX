import React from 'react';

interface DemandValueBadgeProps {
  value?: number;
  className?: string;
}

export const DemandValueBadge: React.FC<DemandValueBadgeProps> = ({ value, className = "" }) => {
  if (!Number.isFinite(value)) return null;
  
  return (
    <div className={`demand-value-badge ${className}`} style={{ 
      color: '#ff6b35', 
      fontWeight: 'bold', 
      fontSize: '14px',
      marginTop: '4px'
    }}>
      Demand Value: ${value!.toFixed(2)}
    </div>
  );
};

export default DemandValueBadge;

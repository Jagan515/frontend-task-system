import React from 'react';
import './Badge.css';

interface BadgeProps {
  label: string;
  type?: string;
  variant?: 'status' | 'priority' | 'role';
}

export const Badge: React.FC<BadgeProps> = ({ 
  label, 
  type = 'default', 
  variant = 'status' 
}) => {
  const className = `badge ${variant}-${type.toLowerCase().replace(/_/g, '-')}`;
  
  return (
    <span className={className}>
      {label}
    </span>
  );
};

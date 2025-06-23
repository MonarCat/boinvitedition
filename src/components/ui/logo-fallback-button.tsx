
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LogoFallbackButtonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LogoFallbackButton: React.FC<LogoFallbackButtonProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const navigate = useNavigate();

  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12'
  };

  return (
    <Button
      variant="ghost"
      onClick={() => navigate('/')}
      className={`p-2 hover:bg-gray-100 ${className}`}
    >
      <img 
        src="/lovable-uploads/307c9897-7d4d-4c72-9525-71af1ea5c02f.png" 
        alt="Boinvit Logo" 
        className={`${sizeClasses[size]} w-auto`}
      />
    </Button>
  );
};

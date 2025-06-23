
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

  const handleClick = () => {
    console.log('Logo clicked - navigating to home');
    navigate('/');
  };

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={`p-2 hover:bg-gray-100 transition-colors ${className}`}
    >
      <img 
        src="/lovable-uploads/307c9897-7d4d-4c72-9525-71af1ea5c02f.png" 
        alt="Boinvit Logo" 
        className={`${sizeClasses[size]} w-auto`}
        onError={(e) => {
          console.error('Logo failed to load');
          e.currentTarget.style.display = 'none';
        }}
        onLoad={() => {
          console.log('Logo loaded successfully');
        }}
      />
    </Button>
  );
};

import React from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ content, children, position = 'top', className = '' }: TooltipProps) {
  const positionClasses = {
    top: '-top-9 left-1/2 -translate-x-1/2',
    bottom: '-bottom-9 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2'
  };

  const arrowClasses = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2',
    left: 'right-[-4px] top-1/2 -translate-y-1/2',
    right: 'left-[-4px] top-1/2 -translate-y-1/2'
  };

  return (
    <div className={`relative group flex items-center justify-center ${className}`}>
      {children}
      <div className={`absolute pointer-events-none z-[60] px-2.5 py-1.5 text-xs font-medium text-white bg-black rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap ${positionClasses[position]}`}>
        {content}
        <div className={`absolute w-2 h-2 bg-black transform rotate-45 ${arrowClasses[position]}`} />
      </div>
    </div>
  );
}

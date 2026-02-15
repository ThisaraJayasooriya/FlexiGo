import React from 'react';

export default function LoadingWave() {
  return (
    <div className="flex items-center justify-center gap-2 h-full min-h-[150px]">
      <div 
        className="w-4 h-4 rounded-full animate-wave-color" 
        style={{ animationDelay: '0s' }}
      ></div>
      <div 
        className="w-4 h-4 rounded-full animate-wave-color" 
        style={{ animationDelay: '0.2s' }}
      ></div>
      <div 
        className="w-4 h-4 rounded-full animate-wave-color" 
        style={{ animationDelay: '0.4s' }}
      ></div>
    </div>
  );
}

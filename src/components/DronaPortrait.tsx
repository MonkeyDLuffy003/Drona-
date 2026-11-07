import React from 'react';

interface DronaPortraitProps {
  isSpeaking?: boolean;
  isListening?: boolean;
  className?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const DRONA_CHARACTER_IMG = '/assets/aistudio/file_0000000081148208b0396e1156607bc3_4c785c10.png';
export const DRONA_HOMESCREEN_BG = '/assets/aistudio/file_00000000d6448208aac02023dde1bb1f_8a4a040d.png';

export const DronaPortrait: React.FC<DronaPortraitProps> = ({
  isSpeaking = false,
  isListening = false,
  className = '',
  onClick,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-full',
    md: 'w-12 h-12 rounded-2xl',
    lg: 'w-20 h-20 rounded-3xl',
    full: 'w-full h-full rounded-2xl',
  };

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden cursor-pointer border-2 transition-all duration-300 select-none bg-slate-900 ${
        isSpeaking
          ? 'border-purple-400 ring-2 ring-purple-500/60 shadow-lg shadow-purple-500/40 animate-pulse'
          : isListening
          ? 'border-amber-400 ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/30'
          : 'border-purple-500/40 hover:border-purple-400 shadow-md shadow-purple-900/20'
      } ${sizeClasses[size]} ${className}`}
    >
      {/* Background ambient neon glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-slate-900 to-transparent opacity-80" />

      {/* Drona Character Image (Focus on handsome face & cyber jacket) */}
      <img
        src={DRONA_CHARACTER_IMG}
        alt="Drona AI Chess Coach"
        className="relative z-10 w-full h-full object-cover object-[50%_12%] transition-transform duration-300 hover:scale-105"
      />

      {/* Speaking neon pulse ring */}
      {isSpeaking && (
        <div className="absolute inset-0 ring-2 ring-inset ring-purple-400/70 z-20 pointer-events-none animate-ping opacity-30" />
      )}
    </div>
  );
};

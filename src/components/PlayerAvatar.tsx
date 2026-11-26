import React, { useEffect, useState } from 'react';

interface PlayerAvatarProps {
  name: string;
  teamCode?: string | null;
  photoUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const TEAM_ACCENT_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  RCB: { bg: 'from-[#3B0F1A] to-[#1A1A1A]', border: 'border-[#E11D48]/50', text: 'text-[#C6FF00]' },
  MI: { bg: 'from-[#0B39E8] to-[#061C73]', border: 'border-[#4C73FF]/60', text: 'text-[#C6FF00]' },
  CSK: { bg: 'from-[#3A3006] to-[#1A1A1A]', border: 'border-[#C6FF00]/50', text: 'text-[#C6FF00]' },
  KKR: { bg: 'from-[#2D1650] to-[#171717]', border: 'border-[#8B5CF6]/55', text: 'text-[#C6FF00]' },
  SRH: { bg: 'from-[#5A240B] to-[#1A1A1A]', border: 'border-[#F97316]/55', text: 'text-[#FFFFFF]' },
  RR: { bg: 'from-[#4F1344] to-[#1A1A1A]', border: 'border-[#EC4899]/50', text: 'text-[#FFFFFF]' },
  DC: { bg: 'from-[#0B39E8] to-[#28122E]', border: 'border-[#4C73FF]/55', text: 'text-[#FFFFFF]' },
  PBKS: { bg: 'from-[#4E141D] to-[#1A1A1A]', border: 'border-[#EF4444]/50', text: 'text-[#FFFFFF]' },
  GT: { bg: 'from-[#162844] to-[#141414]', border: 'border-[#38BDF8]/45', text: 'text-[#C6FF00]' },
  LSG: { bg: 'from-[#0F3859] to-[#141414]', border: 'border-[#38BDF8]/50', text: 'text-[#FFFFFF]' },
};

const DEFAULT_STYLE = {
  bg: 'from-[#242424] to-[#161616]',
  border: 'border-[#383838]',
  text: 'text-[#D4D4D4]',
};

const SIZE_CLASSES: Record<NonNullable<PlayerAvatarProps['size']>, string> = {
  sm: 'w-9 h-9 text-sm rounded-lg',
  md: 'w-11 h-11 text-base rounded-xl',
  lg: 'w-16 h-16 text-xl rounded-xl',
  xl: 'w-20 h-20 text-3xl rounded-2xl',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'PL';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  name,
  teamCode,
  photoUrl,
  size = 'md',
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [photoUrl]);

  const style = (teamCode && TEAM_ACCENT_STYLES[teamCode]) || DEFAULT_STYLE;
  const sizeClass = SIZE_CLASSES[size];

  if (photoUrl && !imgFailed) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden border ${style.border} bg-[#1A1A1A] ${sizeClass}`}
      >
        <img
          src={photoUrl}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover object-top"
        />
      </div>
    );
  }

  return (
    <div
      aria-label={`${name} avatar`}
      className={`flex shrink-0 items-center justify-center border bg-gradient-to-br font-display font-extrabold tracking-wide ${style.bg} ${style.border} ${style.text} ${sizeClass}`}
    >
      {getInitials(name)}
    </div>
  );
};

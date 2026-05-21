import { useState } from 'react';

type ChipSize = 's' | 'm' | 'l' | 'xl';
type ChipKind = 'company' | 'person';

interface Props {
  size: ChipSize;
  kind: ChipKind;
  name: string;
  domain?: string | null;
  photo?: string | null;
  seed?: string;
  round?: boolean;
}

const SIZE_MAP: Record<ChipSize, { px: number; font: number; radius: number }> = {
  s:  { px: 26, font: 10, radius: 5 },
  m:  { px: 30, font: 11, radius: 6 },
  l:  { px: 32, font: 11, radius: 6 },
  xl: { px: 54, font: 18, radius: 9 },
};

function initials(name: string) {
  const clean = name.replace(/[^A-Za-z가-힣 ]/g, '');
  const parts = clean.split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (name.slice(0, 2)).toUpperCase();
}

export default function Chip({ size, kind, name, domain, photo, seed, round }: Props) {
  const [stage, setStage] = useState(0);
  const { px, font, radius } = SIZE_MAP[size];
  const borderRadius = round ? '50%' : radius;

  const containerStyle: React.CSSProperties = {
    width: px, height: px, borderRadius,
    background: 'var(--bg)', border: '1px solid var(--line-2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', flexShrink: 0,
    fontFamily: 'var(--mono)', fontWeight: 600, fontSize: font,
    color: 'var(--white)',
  };

  let src: string | null = null;

  if (kind === 'company') {
    if (stage === 0 && domain) src = `https://logo.clearbit.com/${domain}`;
  } else {
    if (stage === 0 && photo) src = photo;
    else if (stage <= 1) {
      src = `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(seed ?? name)}&backgroundColor=18181b`;
    }
  }

  if (src) {
    return (
      <div style={containerStyle}>
        <img
          src={src}
          alt={initials(name)}
          onError={() => setStage((s) => s + 1)}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    );
  }

  return <div style={containerStyle}>{initials(name)}</div>;
}

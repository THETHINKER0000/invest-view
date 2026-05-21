interface Props {
  children: React.ReactNode;
  highlight?: string;
  first?: boolean;
}

export default function SectionLabel({ children, highlight, first }: Props) {
  return (
    <div style={{
      fontSize: 10, letterSpacing: '.24em', color: 'var(--gray-d)',
      textTransform: 'uppercase', margin: first ? '0 0 14px' : '38px 0 14px',
      display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600,
      fontFamily: 'var(--mono)',
    }}>
      {children}
      {highlight && <span style={{ color: 'var(--white)' }}>{highlight}</span>}
      <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
    </div>
  );
}

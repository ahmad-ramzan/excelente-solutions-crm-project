import FlowerLogo from './FlowerLogo';

interface LogoProps {
  variant?: 'light' | 'dark';
  subtext?: string;
  size?: number;
}

export default function Logo({
  variant = 'light',
  subtext = 'International Recruitment · Since 1991',
  size = 34,
}: LogoProps) {
  const nameColor = variant === 'dark' ? '#fff' : 'inherit';
  const subColor = variant === 'dark' ? '#7d8d93' : 'var(--muted)';

  return (
    <div className="logo">
      <FlowerLogo size={size} />
      <div>
        <div className="name" style={{ color: nameColor }}>
          Excelente Solutions
        </div>
        {subtext && (
          <div className="sub" style={{ color: subColor }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}

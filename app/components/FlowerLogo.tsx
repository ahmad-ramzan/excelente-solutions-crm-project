import Image from 'next/image';

// Brand mark — renders the Excelente Solutions logo (public/logo.jpeg).
// Kept the FlowerLogo name/props so every existing usage swaps automatically.
export default function FlowerLogo({
  size = 34,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo.jpeg"
      alt="Excelente Solutions logo"
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: '50%', objectFit: 'cover' }}
    />
  );
}

import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  variant?: 'white' | 'black' | 'gold' | 'charcoal';
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean;
}

const sizeMap = {
  sm: { width: 40, height: 40 },
  md: { width: 60, height: 60 },
  lg: { width: 80, height: 80 },
};

export function Logo({ variant = 'gold', size = 'md', withText = true }: LogoProps) {
  const logoMap = {
    white: '/assets/logo/White.png',
    black: '/assets/logo/Black.png',
    gold: '/assets/logo/Gold.png',
    charcoal: '/assets/logo/Charcoal.png',
  };

  const dimensions = sizeMap[size];

  return (
    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
      <Image
        src={logoMap[variant]}
        alt="Foal Rider Logo"
        width={dimensions.width}
        height={dimensions.height}
        priority
      />
      {withText && (
        <span className="text-2xl font-bold tracking-tight" style={{ color: '#C5A572', fontFamily: 'Playfair Display, serif' }}>
          FOAL RIDER
        </span>
      )}
    </Link>
  );
}

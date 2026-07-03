import type { Metadata } from 'next';
import { Fraunces, Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz'],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-ibm-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Excelente Solutions — International Recruitment',
  description:
    'For over three decades, Excelente Solutions has connected vetted candidates with employers across Russia, Greece, Poland and Romania — handling recruitment, documentation and visa processing end to end.',
  keywords: 'international recruitment, workforce solutions, visa processing, employment agency',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${fraunces.variable} ${ibmPlexMono.variable}`}>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

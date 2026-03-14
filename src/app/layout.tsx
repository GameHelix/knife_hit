import type { Metadata } from 'next';
import { Orbitron } from 'next/font/google';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['400', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Knife Hit — Precision Throwing Game',
  description: 'Throw knives at a spinning log without hitting other knives. A precision timing browser game built with Next.js.',
  keywords: ['knife hit', 'game', 'browser game', 'precision', 'timing'],
  openGraph: {
    title: 'Knife Hit — Precision Throwing Game',
    description: 'Test your precision and timing in this addictive knife throwing game!',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={orbitron.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0a0a1a" />
      </head>
      <body
        className={`${orbitron.className} bg-[#0a0a1a] text-white antialiased`}
        style={{ touchAction: 'none' }}
      >
        {children}
      </body>
    </html>
  );
}

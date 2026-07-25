import type { Metadata } from 'next';
import { Inter, Hanken_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Login | Field Protocol',
  description: 'NABS Field Service Management Platform Admin Portal',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${hankenGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface-studio text-on-surface-variant font-sans selection:bg-slate-200">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

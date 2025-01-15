import type { Metadata } from 'next';
import { Quicksand } from 'next/font/google';
import '../../globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '../../components/theme-provider';

const quicksand = Quicksand({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FlyTracker',
  description: 'A simple fly fishing logbook',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${quicksand.className} antialiased bg-background min-h-svh`}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

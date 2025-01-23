import type { Metadata } from 'next';
import { Quicksand } from 'next/font/google';
import '../globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '../components/header';
import { ThemeProvider } from '../components/theme-provider';
import Footer from '../components/footer';

const quicksand = Quicksand({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The Catch Chronicles',
  description: 'A simple fly fishing logbook',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={cn(
          `${quicksand.className} antialiased bg-background min-h-svh`
        )}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
          <Toaster />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Header } from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google'
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})


export const metadata: Metadata = {
  title: 'CarePilot',
  description: 'Book your appointments with ease using our AI assistant.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head />
      <body className="font-sans antialiased flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 w-full">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}


'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Logo = () => (
    <div className="bg-primary rounded-full p-2">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
);


export function Header() {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <Logo />
          <span className="font-bold text-xl text-gray-800">
            CarePilot
          </span>
        </Link>
        <nav className="flex items-center space-x-4 sm:space-x-6 text-sm font-medium">
            <Link
                href="/history"
                className="transition-colors text-foreground/80 hover:text-foreground"
            >
                History
            </Link>
            <Button asChild size="sm">
                <Link href="/admin/login">Admin</Link>
            </Button>
        </nav>
      </div>
    </header>
  );
}

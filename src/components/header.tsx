
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#0091FF"/>
    <path d="M16.948 11.232C18.156 11.232 19.232 11.7 20.048 12.516C20.864 13.332 21.332 14.412 21.332 15.62C21.332 16.828 20.864 17.908 20.048 18.724C19.232 19.54 18.156 20.008 16.948 20.008H11.884V11.232H16.948ZM16.948 12.96H13.612V18.28H16.948C17.62 18.28 18.22 18.02 18.664 17.564C19.108 17.108 19.348 16.4 19.348 15.62C19.348 14.84 19.108 14.148 18.664 13.692C18.22 13.236 17.62 12.96 16.948 12.96Z" fill="white"/>
  </svg>
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
                Features
            </Link>
            <Button asChild size="sm">
                <Link href="/admin/login">Admin</Link>
            </Button>
        </nav>
      </div>
    </header>
  );
}

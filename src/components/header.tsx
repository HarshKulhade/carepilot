
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';


const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.163 0 0 7.163 0 16C0 24.837 7.163 32 16 32C24.837 32 32 24.837 32 16C32 7.163 24.837 0 16 0ZM22.163 20.325L19.238 23.25L14.7 18.713L10.163 23.25L7.238 20.325L11.775 15.788L7.238 11.25L10.163 8.325L14.7 12.863L19.238 8.325L22.163 11.25L17.625 15.788L22.163 20.325Z" fill="#0091FF"/>
  </svg>
);

export function Header() {
    const isMobile = useIsMobile();
    const [isSheetOpen, setSheetOpen] = useState(false);

  return (
    <header className="bg-transparent">
      <div className="container mx-auto flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <Logo />
          <span className="font-bold text-xl text-gray-800">
            CarePilot
          </span>
        </Link>
        {isMobile ? (
            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                     <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Open Menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-3/4">
                    <SheetHeader>
                         <Link href="/" className="flex items-center space-x-3" onClick={() => setSheetOpen(false)}>
                            <Logo />
                            <span className="font-bold text-xl text-gray-800">
                                CarePilot
                            </span>
                        </Link>
                    </SheetHeader>
                    <div className="flex flex-col space-y-4 py-8">
                         <Link
                            href="/history"
                            className="transition-colors text-foreground/80 hover:text-foreground text-lg"
                            onClick={() => setSheetOpen(false)}
                        >
                            My Appointments
                        </Link>
                         <Button asChild onClick={() => setSheetOpen(false)}>
                            <Link href="/admin/login">Admin</Link>
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        ) : (
            <nav className="flex items-center space-x-8 text-sm font-medium">
                <Link
                    href="/history"
                    className="transition-colors text-foreground/80 hover:text-foreground"
                >
                    My Appointments
                </Link>
                <Button asChild>
                    <Link href="/admin/login">Admin</Link>
                </Button>
            </nav>
        )}
      </div>
    </header>
  );
}

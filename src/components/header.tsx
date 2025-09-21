import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Logo = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#0091FF"/>
  </svg>
);

export function Header() {
  return (
    <header className="bg-transparent">
      <div className="container mx-auto flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <Logo />
          <span className="font-bold text-xl text-gray-800">
            CarePilot
          </span>
        </Link>
        <nav className="flex items-center space-x-8 text-sm font-medium">
          <Link
            href="#"
            className="transition-colors text-foreground/80 hover:text-foreground"
          >
            Features
          </Link>
          <Button asChild>
            <Link href="#">Admin</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

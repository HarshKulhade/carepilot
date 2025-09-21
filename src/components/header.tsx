import Link from 'next/link';
import { Stethoscope } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Stethoscope className="h-6 w-6 text-primary" />
          <span className="font-bold sm:inline-block font-headline">
            MediAI Chat
          </span>
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            href="/book"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Book Appointment
          </Link>
          <Link
            href="/history"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Appointment History
          </Link>
        </nav>
      </div>
    </header>
  );
}

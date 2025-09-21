
import Link from 'next/link';
import { MessageSquare, Mic, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Chatbot } from '@/components/chatbot';

export default function Home() {
  return (
    <div className="container mx-auto py-8 lg:py-12 px-4 md:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24">
        {/* Left Column */}
        <div className="flex flex-col">
          <div className="space-y-4 mb-10 text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              AI-Integrated <br /> Patient Manager
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              Book appointments via chat or voice, view history, and manage patient interactions with a friendly, clinic-grade experience.
            </p>
          </div>

          <div className="space-y-4 mb-12">
            <Link href="/book" className="h-full">
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Book via Chat</h3>
                    <p className="text-sm text-muted-foreground">Fast & guided</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="#" className="h-full">
               <Card className="h-full hover:shadow-lg transition-shadow opacity-50 cursor-not-allowed">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Mic className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Book via Voice</h3>
                    <p className="text-sm text-muted-foreground">Hands-free</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/history" className="h-full">
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <History className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">History</h3>
                    <p className="text-sm text-muted-foreground">All bookings</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Right Column */}
        <div className="relative">
          <Chatbot />
        </div>
      </div>
    </div>
  );
}

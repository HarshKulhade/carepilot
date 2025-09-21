
import Link from 'next/link';
import { MessageSquare, Mic, History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Chatbot } from '@/components/chatbot';
import { AppointmentHistoryTable } from '@/components/appointment-history-table';

export default function Home() {
  return (
    <div className="container mx-auto py-8 lg:py-12 px-4 md:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-24">
        {/* Left Column */}
        <div className="flex flex-col">
          <div className="space-y-4 mb-10 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
              AI-Integrated <br /> Patient Manager
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground mx-auto lg:mx-0">
              Book appointments via chat or voice, view history, and manage patient interactions with a friendly, clinic-grade experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            <Link href="/book" className="h-full">
              <Card className="h-full text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-2">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Book via Chat</h3>
                  <p className="text-sm text-muted-foreground">Fast & guided</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="#" className="h-full">
               <Card className="h-full text-center hover:shadow-lg transition-shadow opacity-50 cursor-not-allowed">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-2">
                    <Mic className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Book via Voice</h3>
                  <p className="text-sm text-muted-foreground">Hands-free</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/history" className="h-full">
              <Card className="h-full text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-2">
                    <History className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">History</h3>
                  <p className="text-sm text-muted-foreground">All bookings</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <AppointmentHistoryTable />
        </div>

        {/* Right Column */}
        <div className="relative">
          <Chatbot />
        </div>
      </div>
    </div>
  );
}

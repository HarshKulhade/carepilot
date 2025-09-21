import Image from 'next/image';
import Link from 'next/link';
import { MessageSquare, Calendar } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');

  return (
    <div className="flex flex-col items-center">
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                  Effortless Appointment Booking
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Welcome to MediAI Chat. Use our intelligent assistant to book your next appointment or manage your schedule.
                </p>
              </div>
            </div>
            {heroImage && (
              <div className="mx-auto flex justify-center">
                <Image
                  alt="Hero"
                  className="overflow-hidden rounded-xl object-cover"
                  src={heroImage.imageUrl}
                  width={600}
                  height={338}
                  data-ai-hint={heroImage.imageHint}
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">What would you like to do?</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Choose an option below to get started.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-2 mt-12">
            <Link href="/book" className="h-full">
              <Card className="h-full transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-headline">Book via Chat</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Use our AI-powered chatbot to find a time that works for you and book your appointment in minutes.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
            <Link href="/history" className="h-full">
              <Card className="h-full transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="bg-accent/10 p-3 rounded-full">
                      <Calendar className="h-8 w-8 text-accent" />
                    </div>
                    <CardTitle className="text-2xl font-headline">View History</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Review your past and upcoming appointments. Manage your schedule with ease.
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

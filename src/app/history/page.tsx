'use client';

import { useEffect, useState } from 'react';
import { AppointmentHistory } from '@/components/appointment-history';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Appointment } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryPage() {
  const [appointments] = useLocalStorage<Appointment[]>('appointments', []);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-8">
          <div className="text-center">
            <Skeleton className="h-10 w-1/2 mx-auto" />
            <Skeleton className="h-6 w-3/4 mx-auto mt-2" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <AppointmentHistory appointments={appointments} />
    </div>
  );
}

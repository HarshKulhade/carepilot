'use client';

import { useParams } from 'next/navigation';
import { Appointment } from '@/lib/types';
import { ConfirmationCard } from '@/components/confirmation-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { getAppointmentById } from '@/lib/firestore';

export default function ConfirmationPage() {
  const params = useParams();
  const { id } = params;
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof id !== 'string') return;

    const fetchAppointment = async () => {
      try {
        const fetchedAppointment = await getAppointmentById(id);
        setAppointment(fetchedAppointment);
      } catch (error) {
        console.error("Failed to fetch appointment:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();

  }, [id]);

  if (isLoading) {
    return (
        <div className="container mx-auto py-12 flex justify-center">
            <div className="w-full max-w-2xl space-y-4">
                <Skeleton className="h-16 w-16 mx-auto rounded-full" />
                <Skeleton className="h-10 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto" />
                <Skeleton className="h-40 w-full" />
            </div>
        </div>
    )
  }

  if (!appointment) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold">Appointment Not Found</h2>
        <p className="text-muted-foreground mt-2">
          The appointment ID could not be found.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 flex justify-center">
      <ConfirmationCard appointment={appointment} />
    </div>
  );
}

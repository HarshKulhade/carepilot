'use client';

import { useParams } from 'next/navigation';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Appointment } from '@/lib/types';
import { ConfirmationCard } from '@/components/confirmation-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';

export default function ConfirmationPage() {
  const params = useParams();
  const { id } = params;
  const [appointments] = useLocalStorage<Appointment[]>('appointments', []);
  const [appointment, setAppointment] = useState<Appointment | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // We need to wait for appointments to be loaded from localStorage
    if (appointments.length > 0 || localStorage.getItem('appointments')) {
      const foundAppointment = appointments.find((appt) => appt.id === id);
      setAppointment(foundAppointment);
      setIsLoading(false);
    } else if (localStorage.getItem('appointments') === '[]') {
      setIsLoading(false);
    }
  }, [appointments, id]);

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
    return <div className="container mx-auto py-12 text-center"><h2>Appointment not found.</h2><p>It might still be processing. Please check your history later.</p></div>;
  }

  return (
    <div className="container mx-auto py-12 flex justify-center">
      <ConfirmationCard appointment={appointment} />
    </div>
  );
}

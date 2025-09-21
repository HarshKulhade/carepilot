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
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('appointments', []);
  const [appointment, setAppointment] = useState<Appointment | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // We can't rely on the state being updated in time after a redirect.
    // Instead, we'll read directly from localStorage first.
    let foundAppointment: Appointment | undefined;
    try {
        const storedAppointments = window.localStorage.getItem('appointments');
        if (storedAppointments) {
            const parsedAppointments: Appointment[] = JSON.parse(storedAppointments);
            foundAppointment = parsedAppointments.find((appt) => appt.id === id);
        }
    } catch (e) {
        console.error("Failed to parse appointments from localStorage", e);
    }

    if (foundAppointment) {
        setAppointment(foundAppointment);
        // If we found it in localStorage, we can sync our main hook's state
        if (JSON.stringify(appointments) !== localStorage.getItem('appointments')) {
          setAppointments(JSON.parse(localStorage.getItem('appointments') || '[]'));
        }
    } else if (appointments.length > 0) {
      // Fallback to the hook's state if not found in direct read (e.g., navigating from history page)
      foundAppointment = appointments.find((appt) => appt.id === id);
      setAppointment(foundAppointment);
    }
    setIsLoading(false);

  }, [id, appointments, setAppointments]);

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
          The appointment ID could not be found. It might still be processing, or the link may be incorrect.
          <br />
          Please check your appointment history later.
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

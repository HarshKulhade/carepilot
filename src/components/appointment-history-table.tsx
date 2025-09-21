
'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { getAppointments } from '@/lib/firestore';
import type { Appointment } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

export function AppointmentHistoryTable({isAdmin = false}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localAppointments] = useLocalStorage<Appointment[]>('appointments', []);

  useEffect(() => {
    async function fetchAppointments() {
        if (isAdmin) {
            try {
                const fetchedAppointments = await getAppointments();
                setAppointments(fetchedAppointments);
            } catch (error) {
                console.error("Failed to fetch appointments:", error);
            } finally {
                setIsLoading(false);
            }
        } else {
            // For non-admin, use local storage
            setAppointments(localAppointments);
            setIsLoading(false);
        }
    }
    fetchAppointments();
  }, [isAdmin, localAppointments]);


  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Appointment History</h2>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Recent Appointments</h2>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Concern</TableHead>
              <TableHead>Preferred Time</TableHead>
              <TableHead>Booked Via</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length > 0 ? (
              appointments.map((appt) => (
                <TableRow key={appt.id}>
                  <TableCell className="font-medium">{appt.patientName}</TableCell>
                  <TableCell>{appt.phoneNumber}</TableCell>
                  <TableCell>{appt.problem}</TableCell>
                  <TableCell>{appt.preferredTimeSlot}</TableCell>
                  <TableCell>{appt.bookedVia}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No appointments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

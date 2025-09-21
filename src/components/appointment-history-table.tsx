
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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Circle } from 'lucide-react';
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
              {isAdmin && <TableHead>Appointment ID</TableHead>}
              <TableHead>Patient</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Concern</TableHead>
              <TableHead>Preferred Time</TableHead>
              <TableHead>Booked Via</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length > 0 ? (
              appointments.map((appt) => (
                <TableRow key={appt.appointmentId}>
                  {isAdmin && <TableCell className="font-mono text-xs">{appt.appointmentId}</TableCell>}
                  <TableCell className="font-medium">{appt.patientName}</TableCell>
                  <TableCell>{appt.phoneNumber}</TableCell>
                  <TableCell>{appt.problem}</TableCell>
                  <TableCell>{appt.preferredTimeSlot}</TableCell>
                  <TableCell>{appt.bookedVia}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => alert(`Viewing details for ${appt.appointmentId}`)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Circle className="mr-2 h-3 w-3 text-green-500 fill-green-500" />
                            Appointed
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                             <Circle className="mr-2 h-3 w-3 text-yellow-500 fill-yellow-500" />
                            On Hold
                          </DropdownMenuItem>
                           <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                             <Circle className="mr-2 h-3 w-3 text-red-500 fill-red-500" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 5} className="h-24 text-center">
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

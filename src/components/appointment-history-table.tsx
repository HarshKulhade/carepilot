
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
import { getAppointments, deleteAppointment, updateAppointmentStatus } from '@/lib/firestore';
import type { Appointment, AppointmentStatus } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function AppointmentHistoryTable({isAdmin = false}) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localAppointments] = useLocalStorage<Appointment[]>('appointments', []);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchAppointments() {
        if (isAdmin) {
            try {
                const fetchedAppointments = await getAppointments();
                setAppointments(fetchedAppointments);
            } catch (error) {
                console.error("Failed to fetch appointments:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to fetch appointments.',
                });
            } finally {
                setIsLoading(false);
            }
        } else {
            setAppointments(localAppointments);
            setIsLoading(false);
        }
    }
    fetchAppointments();
  }, [isAdmin, localAppointments, toast]);

  const handleUpdateStatus = async (id: string, status: AppointmentStatus) => {
    try {
        await updateAppointmentStatus(id, status);
        setAppointments(prev => prev.map(appt => appt.id === id ? { ...appt, status } : appt));
        toast({
            title: 'Success',
            description: `Appointment status updated to "${status}".`,
        });
    } catch (error) {
        console.error("Failed to update status:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to update appointment status.',
        });
    }
  };

  const handleDelete = async (id: string) => {
    try {
        await deleteAppointment(id);
        setAppointments(prev => prev.filter(appt => appt.id !== id));
        toast({
            title: 'Success',
            description: 'Appointment has been removed.',
        });
    } catch (error) {
        console.error("Failed to delete appointment:", error);
         toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to remove appointment.',
        });
    }
  };


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
               {isAdmin && <TableHead>Status</TableHead>}
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
                   {isAdmin && (
                    <TableCell>
                      <Badge
                        className={cn({
                          'bg-green-100 text-green-800 hover:bg-green-200': appt.status === 'appointed',
                          'bg-yellow-100 text-yellow-800 hover:bg-yellow-200': appt.status === 'on hold',
                          'bg-gray-100 text-gray-800 hover:bg-gray-200': appt.status === 'pending',
                        })}
                      >
                        {appt.status}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>{appt.bookedVia || 'N/A'}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleUpdateStatus(appt.id, 'appointed')}>
                            <Circle className="mr-2 h-3 w-3 text-green-500 fill-green-500" />
                            Appointed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(appt.id, 'on hold')}>
                             <Circle className="mr-2 h-3 w-3 text-yellow-500 fill-yellow-500" />
                            On Hold
                          </DropdownMenuItem>
                           <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDelete(appt.id)}>
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
                <TableCell colSpan={isAdmin ? 8 : 5} className="h-24 text-center">
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

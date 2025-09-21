import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, Phone, Stethoscope, FileText, CalendarOff } from 'lucide-react';
import type { Appointment } from '@/lib/types';
import { format } from 'date-fns';

export function AppointmentHistory({ appointments }: { appointments: Appointment[] }) {

  const sortedAppointments = [...appointments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 rounded-lg border-2 border-dashed">
        <CalendarOff className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Appointments Found</h2>
        <p className="text-muted-foreground mb-6">You haven't booked any appointments yet.</p>
        <Button asChild>
          <Link href="/book">Book an Appointment</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your Appointments</h1>
        <p className="mt-2 text-lg text-muted-foreground">Here is a list of your past and upcoming appointments.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedAppointments.map((appt) => (
          <Card key={appt.appointmentId} className="flex flex-col shadow-md hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Appointment Details</span>
              </CardTitle>
              <CardDescription>ID: {appt.appointmentId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>{appt.patientName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span>{appt.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-3">
                <Stethoscope className="h-5 w-5 text-muted-foreground" />
                <span className="truncate">{appt.problem}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>{appt.preferredTimeSlot}</span>
              </div>
            </CardContent>
             <div className="p-6 pt-0">
                <p className="text-xs text-muted-foreground">
                  Booked on {format(new Date(appt.createdAt), 'PPP p')}
                </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

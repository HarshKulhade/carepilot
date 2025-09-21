import type { Appointment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, User, Phone, Stethoscope, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

export function ConfirmationCard({ appointment }: { appointment: Appointment }) {
  return (
    <Card className="w-full max-w-2xl animate-fade-in-up opacity-0 shadow-lg" style={{ animationFillMode: 'forwards', animationDelay: '0.2s' }}>
      <CardHeader className="items-center text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
        <CardTitle className="text-3xl font-headline">Appointment Confirmed!</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">Your booking is complete.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <p className="text-muted-foreground bg-muted p-4 rounded-lg">
          {appointment.confirmationMessage}
        </p>
        <div className="border-t pt-6 space-y-4 text-left">
          <h3 className="text-lg font-semibold text-center mb-4">Appointment Summary</h3>
           <div className="flex items-start gap-4">
            <User className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div>
                <p className="font-semibold">Name</p>
                <p className="text-muted-foreground">{appointment.patientName}</p>
            </div>
          </div>
           <div className="flex items-start gap-4">
            <Phone className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div>
                <p className="font-semibold">Phone</p>
                <p className="text-muted-foreground">{appointment.phoneNumber}</p>
            </div>
          </div>
           <div className="flex items-start gap-4">
            <Stethoscope className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div>
                <p className="font-semibold">Reason for Visit</p>
                <p className="text-muted-foreground">{appointment.problem}</p>
            </div>
          </div>
           <div className="flex items-start gap-4">
            <Calendar className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div>
                <p className="font-semibold">Preferred Time</p>
                <p className="text-muted-foreground">{appointment.preferredTimeSlot}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Clock className="h-5 w-5 text-primary mt-1 shrink-0" />
            <div>
                <p className="font-semibold">Booked On</p>
                <p className="text-muted-foreground">{format(new Date(appointment.createdAt), 'MMMM d, yyyy HH:mm')}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

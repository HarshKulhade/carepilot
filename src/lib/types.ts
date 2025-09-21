export type AppointmentStatus = 'pending' | 'appointed' | 'on hold';

export interface Appointment {
  id: string;
  appointmentId: string;
  patientName: string;
  phoneNumber: string;
  problem: string;
  preferredTimeSlot: string;
  confirmationMessage: string;
  bookedVia?: 'chatbot' | 'voice';
  createdAt: string; // ISO string
  status: AppointmentStatus;
  isEmergency?: boolean;
}

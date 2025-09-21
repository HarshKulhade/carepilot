export interface Appointment {
  id: string;
  patientName: string;
  phoneNumber: string;
  problem: string;
  preferredTimeSlot: string;
  confirmationMessage: string;
  bookedVia: 'chatbot' | 'voice';
  createdAt: string; // ISO string
}

'use server';

/**
 * @fileOverview AI-powered chatbot for booking patient appointments.
 *
 * - chatbotAppointmentBooking - A function to initiate and manage the chatbot appointment booking flow.
 * - ChatbotAppointmentBookingInput - The input type for the chatbotAppointmentBooking function.
 * - ChatbotAppointmentBookingOutput - The return type for the chatbotAppointmentBooking function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatbotAppointmentBookingInputSchema = z.object({
  patientName: z.string().describe('The full name of the patient.'),
  phoneNumber: z
    .string()
    .describe('The patient phone number for contact and confirmation.'),
  problem: z.string().describe('A brief description of the patient medical problem or concern.'),
  preferredTimeSlot: z
    .string()
    .describe('The preferred date and time for the appointment.'),
});

export type ChatbotAppointmentBookingInput = z.infer<
  typeof ChatbotAppointmentBookingInputSchema
>;

const ChatbotAppointmentBookingOutputSchema = z.object({
  confirmationMessage: z
    .string()
    .describe('A confirmation message including the appointment details.'),
  appointmentId: z.string().describe('The unique identifier for the booked appointment.'),
});

export type ChatbotAppointmentBookingOutput = z.infer<
  typeof ChatbotAppointmentBookingOutputSchema
>;

export async function chatbotAppointmentBooking(
  input: ChatbotAppointmentBookingInput
): Promise<ChatbotAppointmentBookingOutput> {
  return chatbotAppointmentBookingFlow(input);
}

const chatbotAppointmentPrompt = ai.definePrompt({
  name: 'chatbotAppointmentPrompt',
  input: {schema: ChatbotAppointmentBookingInputSchema},
  output: {schema: ChatbotAppointmentBookingOutputSchema},
  prompt: `You are a helpful AI assistant designed to book appointments for patients at a clinic.
  Collect the following information from the patient:
  - Patient Name: {{{patientName}}}
  - Phone Number: {{{phoneNumber}}}
  - Problem/Concern: {{{problem}}}
  - Preferred Time Slot: {{{preferredTimeSlot}}}

  Once you have all the information, confirm the booking and generate a unique appointment ID.
  Return a confirmation message with the appointment details and ID.
`,
});

const chatbotAppointmentBookingFlow = ai.defineFlow(
  {
    name: 'chatbotAppointmentBookingFlow',
    inputSchema: ChatbotAppointmentBookingInputSchema,
    outputSchema: ChatbotAppointmentBookingOutputSchema,
  },
  async input => {
    const {output} = await chatbotAppointmentPrompt(input);
    return output!;
  }
);

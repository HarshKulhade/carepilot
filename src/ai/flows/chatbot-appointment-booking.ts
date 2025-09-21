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
import { getAppointments } from '@/lib/firestore';
import { ALL_TIME_SLOTS } from '@/lib/time-slots';

const ChatbotAppointmentBookingInputSchema = z.object({
  patientName: z.string().describe('The full name of the patient.'),
  phoneNumber: z
    .string()
    .length(10, "Phone number must be 10 digits.")
    .describe('The patient\'s 10-digit phone number for contact and confirmation.'),
  problem: z
    .string()
    .describe('A brief description of the patient medical problem or concern.'),
  preferredTimeSlot: z
    .string()

    .describe('The preferred date and time for the appointment.'),
  isEmergency: z.boolean().optional().describe('Whether the appointment is an emergency.'),
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

const ChatbotGetNextQuestionInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).describe('The conversation history so far.'),
  currentData: z.object({
    patientName: z.string().optional(),
    phoneNumber: z.string().optional(),
    problem: z.string().optional(),
    preferredTimeSlot: z.string().optional(),
    isEmergency: z.boolean().optional(),
  }).describe('The data collected from the user so far.'),
});

const ChatbotGetNextQuestionOutputSchema = z.object({
  nextQuestion: z.string().describe('The next question to ask the user to collect the remaining information.'),
  isComplete: z.boolean().describe('Whether all necessary information has been collected.'),
  updatedData: ChatbotAppointmentBookingInputSchema.partial(),
  suggestions: z.array(z.string()).optional().describe('A list of suggested replies for the user.'),
});


export async function chatbotAppointmentBooking(
  input: ChatbotAppointmentBookingInput
): Promise<ChatbotAppointmentBookingOutput> {
  return chatbotAppointmentBookingFlow(input);
}

export async function getNextQuestion(input: z.infer<typeof ChatbotGetNextQuestionInputSchema>): Promise<z.infer<typeof ChatbotGetNextQuestionOutputSchema>> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const context: Record<string, any> = {
        'today': today.toDateString(),
        'tomorrow': tomorrow.toDateString(),
        'day after tomorrow': dayAfterTomorrow.toDateString(),
    };

    // If a date has been provided (in preferredTimeSlot), find available slots for that date.
    if (input.currentData.problem && input.currentData.preferredTimeSlot && !ALL_TIME_SLOTS.some(slot => input.currentData.preferredTimeSlot!.includes(slot))) {
        try {
            const allAppointments = await getAppointments();
            const providedDate = new Date(input.currentData.preferredTimeSlot).toDateString();

            const bookedSlots = allAppointments
                .filter(appt => new Date(appt.preferredTimeSlot).toDateString() === providedDate)
                .map(appt => {
                    // Extract time part from "2:00 PM on Wed Jul 10 2024"
                    const match = appt.preferredTimeSlot.match(/(\d{1,2}:\d{2}\s[AP]M)/);
                    return match ? match[1] : null;
                })
                .filter((slot): slot is string => slot !== null);


            const availableSlots = ALL_TIME_SLOTS.filter(slot => !bookedSlots.includes(slot));
            context.availableSlots = availableSlots;
        } catch (error) {
            console.error("Failed to fetch appointments to check for available slots:", error);
            // If we can't check for slots, we can't proceed with booking for a specific day.
            // Ask to start over or handle the error gracefully.
            return {
                nextQuestion: "I'm having trouble checking our schedule right now. Could you please try again in a few moments?",
                isComplete: false,
                updatedData: input.currentData,
                suggestions: []
            };
        }
    }
    
    const { output } = await getNextQuestionPrompt({
        ...input,
        context
    });
    return output!;
}


const getNextQuestionFlow = ai.defineFlow(
    {
      name: 'getNextQuestionFlow',
      inputSchema: ChatbotGetNextQuestionInputSchema,
      outputSchema: ChatbotGetNextQuestionOutputSchema,
    },
    async (input) => {
      const { output } = await getNextQuestionPrompt(input);
      return output!;
    }
);
  

const getNextQuestionPrompt = ai.definePrompt({
    name: 'getNextQuestionPrompt',
    input: { schema: ChatbotGetNextQuestionInputSchema.extend({
        context: z.record(z.any()).optional(),
    }) },
    output: { schema: ChatbotGetNextQuestionOutputSchema },
    prompt: `You are a friendly AI assistant helping a user book a medical appointment. Your goal is to collect information in a conversational way.

You need to collect the following information in this specific order:
1. Patient Name (patientName)
2. Phone Number (phoneNumber) - Must be exactly 10 digits.
3. Medical Problem/Concern (problem)
4. Preferred Date (which will be stored temporarily in preferredTimeSlot)
5. Preferred Time (which will be combined with the date in preferredTimeSlot)

Current collected data:
{{{json currentData}}}

Conversation history:
{{#each history}}
- {{role}}: {{content}}
{{/each}}

Based on the history and current data, determine the next logical question to ask.
If you have just collected a piece of information, acknowledge it briefly and naturally before asking the next question.
Extract the relevant information from the user's last message and update the 'updatedData' field.

Specific Question Flow:
- If 'patientName' is missing, ask for it.
- If 'patientName' is present but 'phoneNumber' is missing, ask for it. Validate that it's 10 digits. If not, ask again: "Please provide a valid 10-digit phone number."
- If 'phoneNumber' is present but 'problem' is missing, ask for it.
- If 'problem' is present but 'preferredTimeSlot' is missing, ask for the preferred DATE. Do not ask for the time yet. Provide suggestions like "Today", "Tomorrow".
- If the user provides a relative date like "today", "tomorrow", or "day after tomorrow", use the provided context to convert it to a full date string and store it in 'preferredTimeSlot'.
  Context: {{{json context}}}

- If a DATE has just been collected (and is now in 'preferredTimeSlot'):
  - Acknowledge the date.
  - Now, ask for the TIME.
  - Use the 'availableSlots' from the context to suggest available times. For example: "Great, for [Date], we have the following times available: [list of slots]. Which one works for you?"
  - Set the 'suggestions' field in your output to the 'availableSlots' from the context.
  Context with available slots: {{{json context}}}

- If the user selects a time from the suggestions:
  - Combine the selected time with the date already stored in 'preferredTimeSlot'.
  - For example, if the user picks "2:00 PM" and the date was "Wed Jul 10 2024", the final 'preferredTimeSlot' should be "2:00 PM on Wed Jul 10 2024".

- Special handling for emergencies: At any point, if the user's response indicates urgency (e.g., "as soon as possible", "emergency", "urgent"):
  - Set 'isEmergency' to true.
  - Set 'preferredTimeSlot' to "Immediate Emergency".
  - Skip all other questions and proceed to the confirmation step by setting 'isComplete' to true.

- Confirmation Step: Once all information (Name, Phone, Problem, and full Time Slot) is collected, or if it's an emergency:
  - Set 'isComplete' to true.
  - Set 'nextQuestion' to a summary of the collected details, asking for final confirmation.
  - For emergencies: "This seems to be an emergency. I have your name as [Name], phone as [Phone], and reason as [Problem]. I am marking this as an immediate emergency appointment. Is this correct?"
  - For regular appointments: "Great, I have all the details. I've got your name as [Name], phone as [Phone], reason for visit as [Problem], and preferred time as [Time Slot]. Can I go ahead and book this?"

`,
});

const chatbotAppointmentPrompt = ai.definePrompt({
  name: 'chatbotAppointmentPrompt',
  input: {schema: ChatbotAppointmentBookingInputSchema},
  output: {schema: ChatbotAppointmentBookingOutputSchema},
  prompt: `You are a helpful AI assistant designed to book appointments for patients at a clinic.
  You have collected the following information:
  - Patient Name: {{{patientName}}}
  - Phone Number: {{{phoneNumber}}}
  - Problem/Concern: {{{problem}}}
  - Preferred Time Slot: {{{preferredTimeSlot}}}
  {{#if isEmergency}}
  - This is an EMERGENCY appointment.
  {{/if}}

  The user has confirmed these details. Now, book the appointment.
  Generate a unique appointment ID (e.g., a random alphanumeric string like 'appt-xyz123').
  
  If it's an emergency, the confirmation message should be reassuring and clear. For example: "Your emergency appointment for {{{problem}}} has been registered. Please proceed to the clinic immediately. We will be expecting you. Your Appointment ID is [Generated ID]."

  For regular appointments, return a friendly and professional confirmation message. For example: "Your appointment for {{{problem}}} is confirmed for {{{preferredTimeSlot}}}. We will contact you at {{{phoneNumber}}} if there are any changes. Your Appointment ID is [Generated ID]."
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
    // In a real app, you would save this to a database.
    // We are simulating this by generating a random ID.
    if (output && !output.appointmentId) {
        output.appointmentId = `appt-${Math.random().toString(36).substring(2, 9)}`;
    }
    return output!;
  }
);

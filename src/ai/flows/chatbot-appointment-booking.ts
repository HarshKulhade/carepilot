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

    const context: Record<string, string> = {
        'today': today.toDateString(),
        'tomorrow': tomorrow.toDateString(),
        'day after tomorrow': dayAfterTomorrow.toDateString()
    };
    
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
        context: z.record(z.string()).optional(),
    }) },
    output: { schema: ChatbotGetNextQuestionOutputSchema },
    prompt: `You are a friendly AI assistant helping a user book a medical appointment. Your goal is to collect information in a conversational way.

You need to collect the following information:
- Patient Name (patientName)
- Phone Number (phoneNumber)
- Medical Problem/Concern (problem)
- Preferred Time Slot (preferredTimeSlot) - This should include date and time.

Current collected data:
{{{json currentData}}}

Conversation history:
{{#each history}}
- {{role}}: {{content}}
{{/each}}

Based on the history and current data, determine the next logical question to ask to gather the missing information.
If you have just collected a piece of information, acknowledge it briefly and naturally before asking the next question.
If the user provides multiple pieces of information at once, update all of them.
Extract the relevant information from the user's last message and update the 'updatedData' field.

When asking for the 'preferredTimeSlot', first check if the user is expressing urgency (e.g., "as soon as possible", "emergency", "urgent").
If the user's response indicates an emergency:
- Set 'isEmergency' to true.
- Set 'preferredTimeSlot' to "Immediate Emergency".
- Proceed to the confirmation step by setting 'isComplete' to true.

If it is not an emergency, ask for the time. Provide the following suggestions in the 'suggestions' field: "9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM".
Once the user selects a time, update the 'preferredTimeSlot' with their choice and then ask them for the date. Do not provide suggestions for the date.
If the user provides a relative date like "today", "tomorrow", or "day after tomorrow", use the provided context to convert it to a full date string and combine it with the time in 'preferredTimeSlot'.
For example, if the user says "tomorrow" for the date, and the time was "2:00 PM", and the context for tomorrow is "Wed Jul 03 2024", the final 'preferredTimeSlot' should be "2:00 PM on Wed Jul 03 2024".
Context: {{{json context}}}

If all information is collected, set 'isComplete' to true and set 'nextQuestion' to a summary of the collected details, asking for confirmation. 
If it is an emergency, the summary should reflect that. For example: "This seems to be an emergency. I have your name as John Doe, phone as 555-1234, and reason as 'severe chest pain'. I am marking this as an immediate emergency appointment. Is this correct?"
For regular appointments: "Great, I have all the details. I've got your name as John Doe, phone as 555-1234, reason for visit as 'sore throat', and preferred time as '2:00 PM on Wed Jul 03 2024'. Can I go ahead and book this?"

If information is still missing, ask the next question and set 'isComplete' to false.
For example, if 'patientName' is missing, you could ask: "To start, could you please provide your full name?"
If 'patientName' is present but 'phoneNumber' is missing, you could ask: "Thanks, {{currentData.patientName}}. What's the best phone number to reach you at?"
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

    

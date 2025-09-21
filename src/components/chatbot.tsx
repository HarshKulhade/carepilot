'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { chatbotAppointmentBooking, ChatbotAppointmentBookingInput } from '@/ai/flows/chatbot-appointment-booking';
import type { Appointment } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const questions = [
  "To start, could you please provide your full name?",
  "Great. What's the best phone number to reach you at?",
  "Thank you. Could you briefly describe your medical problem or concern?",
  "Understood. What is your preferred date and time for the appointment?",
];

export function Chatbot() {
  const router = useRouter();
  const { toast } = useToast();
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('appointments', []);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: "Hi! I’m your clinic assistant. I can help you book an appointment.",
    },
    {
      id: 'q0',
      role: 'assistant',
      content: questions[0],
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<ChatbotAppointmentBookingInput>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleUserInput = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isTyping) return;

    const userMessage: Message = { id: `user-${Date.now()}`, role: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    
    const currentInput = userInput;
    setUserInput('');

    if (isConfirming) {
        handleConfirmation(currentInput);
        return;
    }
    
    const newFormData = { ...formData };
    const dataKeys: (keyof ChatbotAppointmentBookingInput)[] = ['patientName', 'phoneNumber', 'problem', 'preferredTimeSlot'];
    newFormData[dataKeys[step]] = currentInput;
    setFormData(newFormData);

    const nextStep = step + 1;
    setStep(nextStep);

    setIsTyping(true);
    setTimeout(() => {
      if (nextStep < questions.length) {
        const botMessage: Message = { id: `q-${nextStep}`, role: 'assistant', content: questions[nextStep] };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const fullData = newFormData as ChatbotAppointmentBookingInput;
        const summary = `Okay, I have the following details:\n\nName: ${fullData.patientName}\nPhone: ${fullData.phoneNumber}\nConcern: ${fullData.problem}\nTime: ${fullData.preferredTimeSlot}\n\nShall I go ahead and book this appointment for you? (yes/no)`;
        const botMessage: Message = { id: 'confirm', role: 'assistant', content: summary };
        setMessages(prev => [...prev, botMessage]);
        setIsConfirming(true);
      }
      setIsTyping(false);
    }, 1000);
  };

  const handleConfirmation = async (confirmation: string) => {
    setIsConfirming(false);
    if (confirmation.toLowerCase().trim().startsWith('yes')) {
        setIsTyping(true);
        const processingMessage: Message = { id: 'processing', role: 'assistant', content: "Perfect! Booking your appointment now..." };
        setMessages(prev => [...prev, processingMessage]);

        try {
            const result = await chatbotAppointmentBooking(formData as ChatbotAppointmentBookingInput);
            
            const newAppointment: Appointment = {
                id: result.appointmentId,
                ...(formData as ChatbotAppointmentBookingInput),
                confirmationMessage: result.confirmationMessage,
                bookedVia: 'chatbot',
                createdAt: new Date().toISOString(),
            };
            
            setAppointments(prev => [...prev, newAppointment]);
            
            const finalMessage: Message = { id: `final-${result.appointmentId}`, role: 'assistant', content: `${result.confirmationMessage} I'm redirecting you to the confirmation page.` };
            setMessages(prev => [...prev, finalMessage]);
            
            setTimeout(() => {
                router.push(`/confirmation/${result.appointmentId}`);
            }, 2000);

        } catch (error) {
            console.error('Booking failed:', error);
            const errorMessage: Message = { id: 'error', role: 'assistant', content: "I'm sorry, but something went wrong while booking. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
            toast({
                variant: 'destructive',
                title: 'Booking Failed',
                description: 'Could not complete the appointment booking.',
            });
        } finally {
            setIsTyping(false);
        }
    } else {
        const restartMessage: Message = { id: 'restart', role: 'assistant', content: "No problem. Let's start over." };
        const q0Message: Message = { id: 'q0-restart', role: 'assistant', content: questions[0] };
        setMessages(prev => [...prev, restartMessage, q0Message]);
        setStep(0);
        setFormData({});
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto flex flex-col h-[70vh] min-h-[500px] shadow-2xl">
      <CardHeader className="flex flex-row items-center gap-3">
         <Sparkles className="h-6 w-6 text-primary" />
        <CardTitle className="font-headline">Book with AI Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full p-6 overflow-y-auto" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={cn('flex items-end gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                )}
                <div className={cn('max-w-[85%] rounded-lg p-3 text-sm whitespace-pre-wrap', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                 {message.content}
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex items-end gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback><Bot className="h-5 w-5" /></AvatarFallback>
                </Avatar>
                <div className="max-w-[75%] rounded-lg p-3 bg-muted">
                    <div className="flex items-center gap-1">
                        <span className="text-muted-foreground text-sm">Typing</span>
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleUserInput} className="flex w-full items-center space-x-2">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isTyping}
            aria-label="Chat input"
          />
          <Button type="submit" size="icon" disabled={isTyping || !userInput.trim()}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

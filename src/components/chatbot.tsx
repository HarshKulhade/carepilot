'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { chatbotAppointmentBooking, getNextQuestion, ChatbotAppointmentBookingInput } from '@/ai/flows/chatbot-appointment-booking';
import type { Appointment } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

// Simple utility to create unique enough IDs for this demo
let messageIdCounter = 0;
const getUniqueMessageId = (role: string) => {
    return `${role}-${Date.now()}-${messageIdCounter++}`;
}

export function Chatbot() {
  const router = useRouter();
  const { toast } = useToast();
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('appointments', []);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [formData, setFormData] = useState<Partial<ChatbotAppointmentBookingInput>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, { id: getUniqueMessageId(role), role, content }]);
  };

  useEffect(() => {
    // Initial greeting from the assistant
    const getInitialQuestion = async () => {
        setIsTyping(true);
        try {
            const result = await getNextQuestion({ history: [], currentData: {} });
            addMessage('assistant', "Hi! I’m your clinic assistant. I can help you book an appointment.");
            if (result.nextQuestion) {
                addMessage('assistant', result.nextQuestion);
            }
        } catch (error) {
            console.error("Failed to get initial question:", error);
            addMessage('assistant', "I'm having trouble starting up. Please try refreshing the page.");
        } finally {
            setIsTyping(false);
        }
    };
    getInitialQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleUserInput = async (e: FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isTyping) return;

    const currentInput = userInput;
    addMessage('user', currentInput);
    setUserInput('');
    setIsTyping(true);

    if (isConfirming) {
        handleConfirmation(currentInput);
        return;
    }

    try {
        const history = messages.map(({ role, content }) => ({ role, content }));
        history.push({ role: 'user', content: currentInput });

        const result = await getNextQuestion({ history, currentData: formData });
        
        const newFormData = { ...formData, ...result.updatedData };
        setFormData(newFormData);

        if (result.nextQuestion) {
            addMessage('assistant', result.nextQuestion);
        }

        if (result.isComplete) {
            setIsConfirming(true);
        }

    } catch (error) {
        console.error("Error processing user input:", error);
        addMessage('assistant', "I'm sorry, I'm having trouble understanding. Could you please rephrase?");
    } finally {
        setIsTyping(false);
    }
  };

  const handleConfirmation = async (confirmation: string) => {
    setIsConfirming(false);
    if (confirmation.toLowerCase().trim().startsWith('yes')) {
        addMessage('assistant', "Perfect! Booking your appointment now...");
        setIsTyping(true);

        try {
            const result = await chatbotAppointmentBooking(formData as ChatbotAppointmentBookingInput);
            
            const newAppointment: Appointment = {
                id: result.appointmentId,
                ...(formData as ChatbotAppointmentBookingInput),
                confirmationMessage: result.confirmationMessage,
                bookedVia: 'chatbot',
                createdAt: new Date().toISOString(),
            };
            
            // Directly write to localStorage before redirecting
            const currentAppointments = JSON.parse(localStorage.getItem('appointments') || '[]'));
            localStorage.setItem('appointments', JSON.stringify([...currentAppointments, newAppointment]));
            setAppointments(prev => [...prev, newAppointment]);
            
            addMessage('assistant', `${result.confirmationMessage} I'm redirecting you to the confirmation page.`);
            
            setTimeout(() => {
                router.push(`/confirmation/${result.appointmentId}`);
            }, 2000);

        } catch (error) {
            console.error('Booking failed:', error);
            addMessage('assistant', "I'm sorry, but something went wrong while booking. Please try again later.");
            toast({
                variant: 'destructive',
                title: 'Booking Failed',
                description: 'Could not complete the appointment booking.',
            });
             setIsTyping(false);
        }
    } else {
        addMessage('assistant', "No problem. Let's start over.");
        setFormData({});
        setIsTyping(true);
        // Reset the conversation
        try {
          const result = await getNextQuestion({ history: [], currentData: {} });
          if (result.nextQuestion) {
              addMessage('assistant', result.nextQuestion);
          }
        } catch (error) {
           addMessage('assistant', "Let's try that again. What is your full name?");
        } finally {
            setIsTyping(false);
        }
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
            {messages.length === 0 && !isTyping && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">The AI assistant is getting ready...</p>
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
            disabled={isTyping || messages.length === 0}
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

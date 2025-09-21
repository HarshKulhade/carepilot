'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { chatbotAppointmentBooking, getNextQuestion, ChatbotAppointmentBookingInput } from '@/ai/flows/chatbot-appointment-booking';
import type { Appointment } from '@/lib/types';
import { addAppointment } from '@/lib/firestore';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

let messageIdCounter = 0;
const getUniqueMessageId = (role: string) => {
  const now = Date.now();
  const random = Math.floor(Math.random() * 1000);
  messageIdCounter++;
  return `${role}-${now}-${messageIdCounter}-${random}`;
};

export function Chatbot() {
  const router = useRouter();
  const { toast } = useToast();
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
        addMessage('assistant', "Hi! I'm your clinic assistant. Can I help you book an appointment?");
      } catch (error) {
        console.error("Failed to get initial question:", error);
        addMessage('assistant', "I'm having trouble starting up. Please try refreshing the page.");
      } finally {
        setIsTyping(false);
      }
    };
    if (messages.length === 0) {
      getInitialQuestion();
    }
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
            
            const newAppointment: Omit<Appointment, 'id'> = {
                ...(formData as ChatbotAppointmentBookingInput),
                confirmationMessage: result.confirmationMessage,
                bookedVia: 'chatbot',
                createdAt: new Date().toISOString(),
                appointmentId: result.appointmentId,
            };

            const appointmentId = await addAppointment(newAppointment);
            
            addMessage('assistant', `${result.confirmationMessage} I'll redirect you to the confirmation page.`);
            
            setTimeout(() => {
                router.push(`/confirmation/${appointmentId}`);
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
    <Card className="w-full h-full mx-auto flex flex-col shadow-lg rounded-xl">
      <CardHeader className="p-0 border-b">
         <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-t-xl rounded-b-none h-14">
                <TabsTrigger value="chat" className="rounded-tl-xl text-base h-full">Chat</TabsTrigger>
                <TabsTrigger value="voice" className="rounded-tr-xl text-base h-full" disabled>Voice</TabsTrigger>
            </TabsList>
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-sm font-medium">Clinic Assistant</p>
                </div>
                <p className="text-sm text-muted-foreground">Chatbot</p>
            </div>
         </Tabs>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full p-4 overflow-y-auto" ref={scrollAreaRef} style={{maxHeight: 'calc(100vh - 400px)', minHeight: '300px'}}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn(
                    'max-w-[85%] rounded-lg p-3 text-sm whitespace-pre-wrap', 
                    message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'
                )}>
                 {message.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-start gap-3 justify-start">
                <div className="max-w-[75%] rounded-lg p-3 bg-muted rounded-bl-none">
                    <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-muted-foreground text-sm">Typing...</span>
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
      <CardFooter className="p-4 border-t bg-slate-50 rounded-b-xl">
        <form onSubmit={handleUserInput} className="flex w-full items-center space-x-2">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter your full name"
            disabled={isTyping || messages.length === 0}
            aria-label="Chat input"
            className="border-gray-300 focus-visible:ring-primary"
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

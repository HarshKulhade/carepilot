import { Chatbot } from '@/components/chatbot';

export default function BookAppointmentPage() {
  return (
    <div className="container mx-auto py-8 flex-1 flex flex-col items-center justify-start">
      <div className="w-full max-w-2xl">
        <Chatbot />
      </div>
    </div>
  );
}

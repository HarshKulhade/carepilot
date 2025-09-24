'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppointmentHistoryTable } from '@/components/appointment-history-table';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Users, LogOut, Trash2 } from 'lucide-react';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase'; // Ensure firebase is initialized
import { clearAllAppointments } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';

export default function AdminDashboardPage() {
  const router = useRouter();
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();
  const [, setLocalAppointments] = useLocalStorage('appointments', []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.replace('/admin/login');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
        console.error("Error signing out:", error);
    }
  };

  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
        await clearAllAppointments();
        setLocalAppointments([]); // Clear local storage as well
        setRefreshKey(prev => prev + 1); // Trigger a re-render of the table
        toast({
            title: 'Success',
            description: 'All appointment history has been cleared.',
        });
    } catch (error) {
        console.error("Error clearing history:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to clear appointment history.',
        });
    } finally {
        setIsClearing(false);
    }
  };
  
  if (isLoading || !user) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
            <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
       <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear History
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all
                    appointment records from the database.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearHistory} disabled={isClearing}>
                    {isClearing ? 'Clearing...' : 'Continue'}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Patient Appointments</CardTitle>
        </CardHeader>
        <CardContent>
            <AppointmentHistoryTable key={refreshKey} isAdmin={true} />
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppointmentHistoryTable } from '@/components/appointment-history-table';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, LogOut } from 'lucide-react';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { app } from '@/lib/firebase'; // Ensure firebase is initialized

export default function AdminDashboardPage() {
  const router = useRouter();
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Patient Appointments</CardTitle>
        </CardHeader>
        <CardContent>
            <AppointmentHistoryTable isAdmin={true} />
        </CardContent>
      </Card>
    </div>
  );
}

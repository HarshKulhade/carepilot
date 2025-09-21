'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppointmentHistoryTable } from '@/components/appointment-history-table';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, LogOut } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage('admin-auth', false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, router]);

  const handleSignOut = () => {
    setIsAuthenticated(false);
    router.push('/admin/login');
  };
  
  if (!isClient || !isAuthenticated) {
    // Render a loading state or nothing while checking auth
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
            <AppointmentHistoryTable />
        </CardContent>
      </Card>
    </div>
  );
}

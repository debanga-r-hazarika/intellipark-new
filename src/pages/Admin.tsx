
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import ParkingComplexManager from '@/components/admin/ParkingComplexManager';
import ParkingSpotManager from '@/components/admin/ParkingSpotManager';
import ReservationManager from '@/components/admin/ReservationManager';
import AdminDashboard from '@/components/admin/AdminDashboard';
import VideoFeedManager from '@/components/admin/VideoFeedManager';

const Admin: React.FC = () => {
  const { isLoggedIn } = useAuth();
  
  // You might want to add admin role checking here in the future
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 pt-24 px-4 pb-16">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
            <p>Please log in to access the admin panel.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 pt-24 px-4 pb-16">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="complexes">Parking Complexes</TabsTrigger>
            <TabsTrigger value="spots">Parking Spots</TabsTrigger>
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
            <TabsTrigger value="video-feeds">Computer Vision</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <AdminDashboard />
          </TabsContent>
          
          <TabsContent value="complexes">
            <Card>
              <CardHeader>
                <CardTitle>Manage Parking Complexes</CardTitle>
              </CardHeader>
              <CardContent>
                <ParkingComplexManager />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="spots">
            <Card>
              <CardHeader>
                <CardTitle>Manage Parking Spots</CardTitle>
              </CardHeader>
              <CardContent>
                <ParkingSpotManager />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reservations">
            <Card>
              <CardHeader>
                <CardTitle>Manage Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <ReservationManager />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="video-feeds">
            <Card>
              <CardHeader>
                <CardTitle>Computer Vision - Parking Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <VideoFeedManager />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

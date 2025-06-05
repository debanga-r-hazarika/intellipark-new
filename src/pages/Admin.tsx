
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ParkingComplexManager from '@/components/admin/ParkingComplexManager';
import ParkingSpotManager from '@/components/admin/ParkingSpotManager';
import ReservationManager from '@/components/admin/ReservationManager';
import AdminDashboard from '@/components/admin/AdminDashboard';

const Admin: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 pt-24 px-4 pb-16">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="complexes">Parking Complexes</TabsTrigger>
            <TabsTrigger value="spots">Parking Spots</TabsTrigger>
            <TabsTrigger value="reservations">Reservations</TabsTrigger>
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
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;

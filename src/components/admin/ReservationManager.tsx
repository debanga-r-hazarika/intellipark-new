
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ReservationStatus = 'upcoming' | 'live' | 'past';

interface ReservationData {
  id: string;
  user_id: string;
  spot_id: string;
  parking_complex: string;
  date: string;
  time: string;
  duration: string;
  vehicle_plate: string;
  status: ReservationStatus;
  created_at: string;
  updated_at: string;
}

const ReservationManager: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Type assertion to ensure the data matches our interface
        const typedData = data.map(reservation => ({
          ...reservation,
          status: reservation.status as ReservationStatus
        }));
        setReservations(typedData);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to fetch reservations');
    }
  };

  const handleUpdateReservationStatus = async (reservationId: string, newStatus: ReservationStatus) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', reservationId);

      if (error) throw error;

      toast.success('Reservation status updated successfully');
      fetchReservations();
    } catch (error) {
      console.error('Error updating reservation status:', error);
      toast.error('Failed to update reservation status');
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservationId);

      if (error) throw error;

      toast.success('Reservation cancelled successfully');
      fetchReservations();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast.error('Failed to cancel reservation');
    }
  };

  const filteredReservations = filterStatus === 'all' 
    ? reservations 
    : reservations.filter(reservation => reservation.status === filterStatus);

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'live': return 'bg-green-500';
      case 'past': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex gap-4 items-center">
        <label>Filter by Status:</label>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="past">Past</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reservations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Spot {reservation.spot_id}</CardTitle>
                <Badge className={getStatusColor(reservation.status)}>
                  {reservation.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Complex:</strong> {reservation.parking_complex}</p>
                <p><strong>Date:</strong> {reservation.date}</p>
                <p><strong>Time:</strong> {reservation.time}</p>
                <p><strong>Duration:</strong> {reservation.duration}</p>
                <p><strong>Vehicle:</strong> {reservation.vehicle_plate}</p>
                <p><strong>User ID:</strong> {reservation.user_id.substring(0, 8)}...</p>
              </div>
              <div className="space-y-2 mt-4">
                <Select 
                  value={reservation.status} 
                  onValueChange={(value: ReservationStatus) => handleUpdateReservationStatus(reservation.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleCancelReservation(reservation.id)}
                  className="w-full"
                >
                  Cancel Reservation
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReservationManager;

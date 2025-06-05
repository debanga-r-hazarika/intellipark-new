
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ReservationData {
  id: string;
  user_id: string;
  parking_complex: string;
  spot_id: string;
  vehicle_plate: string;
  date: string;
  time: string;
  duration: string;
  status: 'upcoming' | 'live' | 'past';
  created_at: string;
}

const ReservationManager: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchReservations = async () => {
    try {
      let query = supabase
        .from('reservations')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to load reservations');
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const updateReservationStatus = async (id: string, newStatus: 'upcoming' | 'live' | 'past') => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success('Reservation status updated successfully');
      fetchReservations();
    } catch (error) {
      console.error('Error updating reservation status:', error);
      toast.error('Failed to update reservation status');
    }
  };

  const cancelReservation = async (id: string, spotId: string, parkingComplex: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      // Delete the reservation
      const { error: deleteError } = await supabase
        .from('reservations')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Update spot status to available
      const { error: updateError } = await supabase
        .from('parking_spots')
        .update({ status: 'available' })
        .eq('spot_id', spotId)
        .eq('parking_complex', parkingComplex);

      if (updateError) throw updateError;

      toast.success('Reservation cancelled successfully');
      fetchReservations();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      toast.error('Failed to cancel reservation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-100';
      case 'live': return 'text-green-600 bg-green-100';
      case 'past': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Reservations</h3>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="past">Past</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Complex</TableHead>
            <TableHead>Spot</TableHead>
            <TableHead>Vehicle Plate</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell>{reservation.parking_complex}</TableCell>
              <TableCell className="font-medium">{reservation.spot_id}</TableCell>
              <TableCell>{reservation.vehicle_plate}</TableCell>
              <TableCell>{format(new Date(reservation.date), 'MMM dd, yyyy')}</TableCell>
              <TableCell>{reservation.time}</TableCell>
              <TableCell>{reservation.duration}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(reservation.status)}`}>
                  {reservation.status}
                </span>
              </TableCell>
              <TableCell>{format(new Date(reservation.created_at), 'MMM dd, yyyy')}</TableCell>
              <TableCell className="space-x-2">
                <Select
                  value={reservation.status}
                  onValueChange={(value) => updateReservationStatus(reservation.id, value as 'upcoming' | 'live' | 'past')}
                >
                  <SelectTrigger className="w-28">
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
                  onClick={() => cancelReservation(reservation.id, reservation.spot_id, reservation.parking_complex)}
                >
                  Cancel
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReservationManager;

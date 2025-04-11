
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  spotId: string;
  parkingComplex: string;
  onConfirm: (data: ReservationData) => void;
  vehiclePlate?: string;
}

export interface ReservationData {
  id?: string; // Make id optional to match how it's used in Home.tsx
  spotId: string;
  parkingComplex: string;
  vehiclePlate: string;
  date: Date;
  time: string;
  duration: string;
  userId?: string; // Make userId optional for flexibility
}

const durations = [
  '30 min',
  '1 hour',
  '2 hours',
  '4 hours',
  '8 hours',
  '24 hours' // Changed from 'All day' to '24 hours'
];

// Create time slots in 12-hour format
const timeSlots = [
  '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM', '6:00 AM', '7:00 AM', 
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', 
  '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
];

const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  spotId,
  parkingComplex,
  onConfirm,
  vehiclePlate = ''
}) => {
  // Set current date as fixed date
  const today = new Date();
  
  const [formData, setFormData] = useState<Partial<ReservationData>>({
    spotId,
    parkingComplex,
    vehiclePlate,
    date: today,
    time: '12:00 PM', // Default to noon
    duration: '1 hour',
    userId: ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehiclePlate) {
      toast.error('Please enter your vehicle plate number');
      return;
    }
    
    if (!formData.time) {
      toast.error('Please select a time');
      return;
    }
    
    if (!formData.duration) {
      toast.error('Please select the duration');
      return;
    }
    
    try {
      // Get the current user from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You need to be logged in to make a reservation');
        return;
      }
      
      // Add the user ID to the form data
      const completeData = {
        ...formData,
        date: today, // Always use today's date
        userId: user.id
      } as ReservationData;
      
      onConfirm(completeData);
    } catch (error) {
      toast.error('Failed to process your reservation');
      console.error('Reservation error:', error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] card-glassmorphism animate-fade-in">
        <DialogHeader>
          <DialogTitle className="text-xl">Reserve Your Parking Spot</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parkingComplex">Parking Complex</Label>
                <Input 
                  id="parkingComplex" 
                  value={parkingComplex}
                  readOnly 
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="spotId">Spot Number</Label>
                <Input 
                  id="spotId" 
                  value={spotId}
                  readOnly 
                  className="bg-muted"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vehiclePlate">Vehicle Plate Number</Label>
            <Input
              id="vehiclePlate"
              value={formData.vehiclePlate}
              onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
              placeholder="e.g., ABC123"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              value={format(today, "PPP")}
              readOnly
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Time</Label>
            <Select
              value={formData.time}
              onValueChange={(val) => setFormData({ ...formData, time: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Duration</Label>
            <Select
              value={formData.duration}
              onValueChange={(val) => setFormData({ ...formData, duration: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durations.map((duration) => (
                  <SelectItem key={duration} value={duration}>
                    {duration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="btn-hover-glow">Confirm Booking</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReservationModal;

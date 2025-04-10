
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
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
  spotId: string;
  parkingComplex: string;
  vehiclePlate: string;
  date: Date;
  time: string;
  duration: string;
  userId: string;
}

const durations = [
  '30 min',
  '1 hour',
  '2 hours',
  '4 hours',
  '8 hours',
  'All day'
];

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  spotId,
  parkingComplex,
  onConfirm,
  vehiclePlate = ''
}) => {
  const [formData, setFormData] = useState<Partial<ReservationData>>({
    spotId,
    parkingComplex,
    vehiclePlate,
    date: new Date(),
    time: '12:00',
    duration: '1 hour',
    userId: ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vehiclePlate) {
      toast.error('Please enter your vehicle plate number');
      return;
    }
    
    if (!formData.date) {
      toast.error('Please select a date');
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                  {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => setFormData({ ...formData, date: date || new Date() })}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
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

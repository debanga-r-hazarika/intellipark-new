
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';

interface ReservationData {
  id?: string; // Make id optional to match the data from ReservationModal
  spotId: string;
  parkingComplex: string;
  vehiclePlate: string;
  date: Date; // Changed to Date type to match what's passed from Reserve.tsx
  time: string;
  duration: string;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: ReservationData | null;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  reservation
}) => {
  if (!reservation) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] card-glassmorphism animate-fade-in">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-center text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            Your parking spot has been reserved!
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Booking confirmation details
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="font-semibold">Parking Complex:</div>
            <div>{reservation.parkingComplex}</div>
            
            <div className="font-semibold">Spot Number:</div>
            <div>{reservation.spotId}</div>
            
            <div className="font-semibold">Vehicle Plate:</div>
            <div>{reservation.vehiclePlate}</div>
            
            <div className="font-semibold">Date:</div>
            <div>{format(reservation.date, 'PPP')}</div>
            
            <div className="font-semibold">Time:</div>
            <div>{reservation.time}</div>
            
            <div className="font-semibold">Duration:</div>
            <div>{reservation.duration}</div>
          </div>
          
          <div className="bg-primary/10 p-4 rounded-lg text-center mt-4">
            <p className="text-sm">Your booking reference number:</p>
            <p className="font-mono font-bold tracking-wider">{reservation.id || generateBookingReference()}</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Generate a random booking reference number
function generateBookingReference(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default ConfirmationModal;

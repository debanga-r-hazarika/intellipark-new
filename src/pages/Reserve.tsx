
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ParkingGrid from '@/components/ParkingGrid';
import ReservationModal, { ReservationData } from '@/components/ReservationModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import { SpotStatus } from '@/components/ParkingSpot';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Mock data for parking complexes
const parkingComplexes = [
  'Demo Parking 1',
  'Demo Parking 2'
];

// Generate mock parking spots
const generateParkingSpots = (count: number) => {
  const spots = [];
  const statusOptions: SpotStatus[] = ['available', 'occupied', 'reserved'];
  
  for (let i = 1; i <= count; i++) {
    const id = `A${i.toString().padStart(2, '0')}`;
    // Randomly assign status, but ensure we have some available spots
    const randomStatus = i % 3 === 0 ? 'available' : statusOptions[Math.floor(Math.random() * statusOptions.length)];
    spots.push({ id, status: randomStatus });
  }
  
  return spots;
};

// Mock data for both parking complexes
const parkingData = {
  'Demo Parking 1': generateParkingSpots(18),
  'Demo Parking 2': generateParkingSpots(24)
};

const Reserve: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
  const [selectedComplex, setSelectedComplex] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState<boolean>(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false);
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  
  const navigate = useNavigate();
  
  const handleComplexSelect = (value: string) => {
    setSelectedComplex(value);
  };
  
  const handleSpotClick = (spotId: string) => {
    if (!isLoggedIn) {
      toast.error("Please login to reserve a parking spot", {
        action: {
          label: "Login",
          onClick: () => navigate('/login')
        }
      });
      return;
    }
    
    setSelectedSpot(spotId);
    setIsReservationModalOpen(true);
  };
  
  const handleReservationConfirm = (data: ReservationData) => {
    setReservation(data);
    setIsReservationModalOpen(false);
    setIsConfirmationModalOpen(true);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 pt-24 px-4 pb-16">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Reserve Parking</h1>
        
        <div className="card-glassmorphism rounded-lg p-6 animate-fade-in mb-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-6">Select a Parking Complex</h2>
            
            <Select
              value={selectedComplex || ''}
              onValueChange={handleComplexSelect}
            >
              <SelectTrigger className="w-full mb-6">
                <SelectValue placeholder="Choose a parking complex" />
              </SelectTrigger>
              <SelectContent>
                {parkingComplexes.map((complex) => (
                  <SelectItem key={complex} value={complex}>
                    {complex}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedComplex && (
              <div className="animate-fade-in">
                <h3 className="text-lg font-medium mb-4">Select an Available Parking Spot</h3>
                <ParkingGrid 
                  spots={parkingData[selectedComplex as keyof typeof parkingData]} 
                  onSpotClick={handleSpotClick} 
                />
              </div>
            )}
            
            {!selectedComplex && (
              <div className="text-center py-8 text-muted-foreground">
                Please select a parking complex to view available spots
              </div>
            )}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="card-glassmorphism rounded-lg p-6 animate-fade-in">
          <h3 className="text-xl font-semibold mb-4">How to Reserve a Parking Spot</h3>
          <ol className="list-decimal ml-5 space-y-2">
            <li>Select a parking complex from the dropdown menu above.</li>
            <li>Browse the parking grid to see available spots (shown in green).</li>
            <li>Click on an available spot to begin the reservation process.</li>
            <li>Fill in the required details in the reservation form.</li>
            <li>Confirm your booking and receive a confirmation with all details.</li>
          </ol>
        </div>
      </div>
      
      {/* Reservation Modal */}
      {selectedComplex && (
        <ReservationModal 
          isOpen={isReservationModalOpen}
          onClose={() => setIsReservationModalOpen(false)}
          spotId={selectedSpot || ''}
          parkingComplex={selectedComplex}
          onConfirm={handleReservationConfirm}
        />
      )}
      
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        reservation={reservation}
      />
    </div>
  );
};

export default Reserve;

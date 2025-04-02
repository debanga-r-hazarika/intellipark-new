import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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

const Home: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
  const [selectedComplex, setSelectedComplex] = useState<string>(parkingComplexes[0]);
  const [showParkingGrid, setShowParkingGrid] = useState<boolean>(false);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState<boolean>(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false);
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  
  const navigate = useNavigate();
  
  const handleComplexSelect = (value: string) => {
    setSelectedComplex(value);
    setShowParkingGrid(true);
  };
  
  const handleFindParking = () => {
    navigate('/reserve');
  };
  
  const handleRegisterClick = () => {
    navigate('/register');
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30 pt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Smart Parking, Smarter You
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
                Reserve your parking spot instantly with real-time availability.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={handleFindParking}
                  className="text-lg btn-hover-glow"
                >
                  Find Parking
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleRegisterClick}
                  className="text-lg hover-lift"
                >
                  Register Now
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1604063165585-e17e9c3c3f0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="Smart Parking System" 
                className="rounded-lg shadow-xl hover-lift card-glassmorphism"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Real-time Parking Availability Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-center">Real-time Parking Availability</h2>
            
            <div className="mb-8">
              <label className="block text-sm font-medium mb-2">Select a Parking Complex</label>
              <Select
                value={selectedComplex}
                onValueChange={handleComplexSelect}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a parking complex" />
                </SelectTrigger>
                <SelectContent>
                  {parkingComplexes.map((complex) => (
                    <SelectItem key={complex} value={complex}>
                      {complex}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {showParkingGrid && (
              <div className="animate-fade-in">
                <ParkingGrid 
                  spots={parkingData[selectedComplex as keyof typeof parkingData]} 
                  onSpotClick={handleSpotClick} 
                />
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Reservation Modal */}
      <ReservationModal 
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        spotId={selectedSpot || ''}
        parkingComplex={selectedComplex}
        onConfirm={handleReservationConfirm}
      />
      
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        reservation={reservation}
      />
    </div>
  );
};

export default Home;

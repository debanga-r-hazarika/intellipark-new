
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ParkingGrid from '@/components/ParkingGrid';
import ReservationModal, { ReservationData } from '@/components/ReservationModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  parkingComplexes, 
  fetchParkingSpots,
  updateParkingSpotStatus, 
  addReservation 
} from '@/utils/parkingData';
import { supabase } from '@/integrations/supabase/client';

const Reserve: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
  const [selectedComplex, setSelectedComplex] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState<boolean>(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false);
  const [reservation, setReservation] = useState<any | null>(null);
  const [userVehiclePlate, setUserVehiclePlate] = useState<string>('');
  const [parkingSpots, setParkingSpots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch user profile to get their vehicle plate number
    const fetchUserProfile = async () => {
      if (isLoggedIn) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('vehicle_plate')
              .eq('id', user.id)
              .single();
              
            if (profile && profile.vehicle_plate) {
              setUserVehiclePlate(profile.vehicle_plate);
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    
    fetchUserProfile();
  }, [isLoggedIn]);
  
  useEffect(() => {
    if (selectedComplex) {
      // Fetch parking spots data from Supabase
      const loadParkingSpots = async () => {
        setIsLoading(true);
        try {
          const spots = await fetchParkingSpots(selectedComplex);
          setParkingSpots(spots);
        } catch (error) {
          console.error('Error loading parking spots:', error);
          toast.error('Failed to load parking spots');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadParkingSpots();
    }
  }, [selectedComplex]);
  
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
  
  const handleReservationConfirm = async (data: ReservationData) => {
    // Format the reservation data
    const formattedDate = data.date.toISOString().split('T')[0];
    
    console.log('Confirming reservation for spot:', data.spotId, 'in complex:', data.parkingComplex);
    
    // Create the reservation in Supabase
    const newReservation = await addReservation({
      userId: data.userId || '',
      parkingComplex: data.parkingComplex,
      spotId: data.spotId,
      vehiclePlate: data.vehiclePlate,
      date: formattedDate,
      time: data.time,
      duration: data.duration,
      status: 'upcoming' // Changed from 'live' to 'upcoming' for consistency
    });
    
    if (newReservation) {
      console.log('Reservation created successfully:', newReservation.id);
      
      // Update the spot status directly as a fallback
      try {
        console.log('Ensuring spot status is updated to reserved');
        await updateParkingSpotStatus(data.parkingComplex, data.spotId, 'reserved');
      } catch (error) {
        console.error('Failed to update spot status directly:', error);
      }
      
      // Update local state to reflect the change
      if (selectedComplex) {
        console.log('Refreshing parking spots data after reservation');
        // Force fresh fetch by clearing cache and re-fetching
        try {
          // Fetch the latest parking spots data
          const spots = await fetchParkingSpots(selectedComplex);
          console.log('Updated spots from database:', spots);
          setParkingSpots(spots);
        } catch (error) {
          console.error('Error refreshing spots:', error);
        }
      }
      
      // Store the formatted reservation for display in confirmation modal
      const displayReservation = {
        id: newReservation.id,
        spotId: data.spotId,
        parkingComplex: data.parkingComplex,
        vehiclePlate: data.vehiclePlate,
        date: data.date, // Pass the Date object to the confirmation modal
        time: data.time,
        duration: data.duration
      };
      
      setReservation(displayReservation);
      setIsReservationModalOpen(false);
      setIsConfirmationModalOpen(true);
    }
  };
  
  const handleConfirmationClose = () => {
    setIsConfirmationModalOpen(false);
    toast.success('Your reservation has been confirmed!', {
      description: 'You can view all your reservations in your profile.'
    });
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
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ParkingGrid 
                    spots={parkingSpots} 
                    onSpotClick={handleSpotClick} 
                  />
                )}
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
          vehiclePlate={userVehiclePlate}
        />
      )}
      
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={isConfirmationModalOpen}
        onClose={handleConfirmationClose}
        reservation={reservation}
      />
    </div>
  );
};

export default Reserve;

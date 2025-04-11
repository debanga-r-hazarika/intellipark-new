
import { SpotStatus } from '@/components/ParkingSpot';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ParkingSpotData {
  id: string;
  status: SpotStatus;
}

export interface ReservationData {
  id: string;
  userId: string;
  parkingComplex: string;
  spotId: string;
  vehiclePlate: string;
  date: string;
  time: string;
  duration: string;
  status: 'upcoming' | 'live' | 'past';
  createdAt: string;
}

// Mock data for parking complexes
export const parkingComplexes = [
  'Demo Parking 1',
  'Demo Parking 2'
];

// Temporary cache for parking data when loaded from Supabase
let parkingSpotsCache: {
  [key: string]: ParkingSpotData[];
} = {};

// Function to update the parking spot status in Supabase
export const updateParkingSpotStatus = async (parkingComplex: string, spotId: string, newStatus: SpotStatus): Promise<void> => {
  if (!parkingComplex || !spotId) return;
  
  try {
    // Update in database
    const { error } = await supabase
      .from('parking_spots')
      .update({ status: newStatus })
      .match({ parking_complex: parkingComplex, spot_id: spotId });
    
    if (error) throw error;
    
    // Update local cache
    if (parkingSpotsCache[parkingComplex]) {
      const spotIndex = parkingSpotsCache[parkingComplex].findIndex(spot => spot.id === spotId);
      if (spotIndex !== -1) {
        parkingSpotsCache[parkingComplex][spotIndex].status = newStatus;
      }
    }
    
    console.log(`Updated spot ${spotId} in ${parkingComplex} to ${newStatus}`);
  } catch (error) {
    console.error('Error updating parking spot status:', error);
    toast.error('Failed to update parking spot status');
  }
};

// Function to fetch parking spots from Supabase
export const fetchParkingSpots = async (parkingComplex: string): Promise<ParkingSpotData[]> => {
  try {
    const { data, error } = await supabase
      .from('parking_spots')
      .select('spot_id, status')
      .eq('parking_complex', parkingComplex);
    
    if (error) throw error;
    
    // Transform the data to match our interface
    const transformedData = data.map(spot => ({
      id: spot.spot_id,
      status: spot.status as SpotStatus
    }));
    
    // Update cache
    parkingSpotsCache[parkingComplex] = transformedData;
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching parking spots:', error);
    toast.error('Failed to load parking spots');
    return [];
  }
};

// Function to get all parking spots
export const getAllParkingSpots = async () => {
  const allSpots: { [key: string]: ParkingSpotData[] } = {};
  
  for (const complex of parkingComplexes) {
    allSpots[complex] = await fetchParkingSpots(complex);
  }
  
  return allSpots;
};

// Reservation service functions
export const getReservationsByUserId = async (userId: string): Promise<ReservationData[]> => {
  try {
    console.log('Fetching reservations for user:', userId);
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    console.log('Reservations data from Supabase:', data);
    
    // Transform to our interface
    return data.map(res => ({
      id: res.id,
      userId: res.user_id,
      parkingComplex: res.parking_complex,
      spotId: res.spot_id,
      vehiclePlate: res.vehicle_plate,
      date: res.date,
      time: res.time,
      duration: res.duration,
      status: res.status as 'upcoming' | 'live' | 'past',
      createdAt: res.created_at
    }));
  } catch (error) {
    console.error('Error fetching user reservations:', error);
    toast.error('Failed to load your reservations');
    return [];
  }
};

export const addReservation = async (reservation: Omit<ReservationData, 'id' | 'createdAt'>): Promise<ReservationData | null> => {
  try {
    // Insert the reservation into Supabase
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        user_id: reservation.userId,
        parking_complex: reservation.parkingComplex,
        spot_id: reservation.spotId,
        vehicle_plate: reservation.vehiclePlate,
        date: reservation.date,
        time: reservation.time,
        duration: reservation.duration,
        status: reservation.status
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update the parking spot status to reserved
    await updateParkingSpotStatus(reservation.parkingComplex, reservation.spotId, 'reserved');
    
    // Transform to our interface
    return {
      id: data.id,
      userId: data.user_id,
      parkingComplex: data.parking_complex,
      spotId: data.spot_id,
      vehiclePlate: data.vehicle_plate,
      date: data.date,
      time: data.time,
      duration: data.duration,
      status: data.status as 'upcoming' | 'live' | 'past', // Fix: Add type assertion
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error adding reservation:', error);
    toast.error('Failed to create your reservation');
    return null;
  }
};

// Helper to determine if a time is AM or PM
const isTimeAM = (time: string): boolean => {
  return time.includes('AM');
};

// Helper to get hour from time string
const getHourFromTime = (time: string): number => {
  const hourStr = time.split(':')[0];
  let hour = parseInt(hourStr);
  
  // Convert 12-hour to 24-hour for comparison
  if (time.includes('PM') && hour < 12) {
    hour += 12;
  } else if (time.includes('AM') && hour === 12) {
    hour = 0;
  }
  
  return hour;
};

// Update reservation statuses based on current time
const updateReservationStatuses = (reservations: ReservationData[]): ReservationData[] => {
  const today = new Date().toISOString().split('T')[0];
  const currentHour = new Date().getHours();
  
  return reservations.map(res => {
    // Create a new object rather than modifying the existing one
    const updatedRes = { ...res };
    
    if (res.date > today) {
      updatedRes.status = 'upcoming';
    } else if (res.date === today) {
      const reservationHour = getHourFromTime(res.time);
      const durationHours = parseInt(res.duration.split(' ')[0]);
      
      if (reservationHour > currentHour) {
        updatedRes.status = 'upcoming';
      } else if (reservationHour + durationHours > currentHour || res.duration === '24 hours') {
        updatedRes.status = 'live';
      } else {
        updatedRes.status = 'past';
      }
    } else {
      updatedRes.status = 'past';
    }
    
    return updatedRes;
  });
};

export const getUpcomingReservations = async (userId: string): Promise<ReservationData[]> => {
  try {
    const allReservations = await getReservationsByUserId(userId);
    const updatedReservations = updateReservationStatuses(allReservations);
    return updatedReservations.filter(res => res.status === 'upcoming');
  } catch (error) {
    console.error('Error getting upcoming reservations:', error);
    return [];
  }
};

export const getLiveReservations = async (userId: string): Promise<ReservationData[]> => {
  try {
    const allReservations = await getReservationsByUserId(userId);
    const updatedReservations = updateReservationStatuses(allReservations);
    return updatedReservations.filter(res => res.status === 'live');
  } catch (error) {
    console.error('Error getting live reservations:', error);
    return [];
  }
};

export const getPastReservations = async (userId: string): Promise<ReservationData[]> => {
  try {
    const allReservations = await getReservationsByUserId(userId);
    const updatedReservations = updateReservationStatuses(allReservations);
    return updatedReservations.filter(res => res.status === 'past');
  } catch (error) {
    console.error('Error getting past reservations:', error);
    return [];
  }
};


import { SpotStatus } from '@/components/ParkingSpot';

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

// Generate consistent mock parking spots
const generateParkingSpots = (count: number, seed: number) => {
  const spots: ParkingSpotData[] = [];
  const statusOptions: SpotStatus[] = ['available', 'occupied', 'reserved'];
  
  for (let i = 1; i <= count; i++) {
    const id = `A${i.toString().padStart(2, '0')}`;
    // Use a consistent algorithm to determine status based on spot ID and seed
    // This ensures the same spots have the same status across the application
    const statusIndex = (i + seed) % 3;
    const status = i % 4 === 0 ? 'available' : statusOptions[statusIndex];
    spots.push({ id, status });
  }
  
  return spots;
};

// Create consistent parking data for both parking complexes
export const parkingData = {
  'Demo Parking 1': generateParkingSpots(18, 1),
  'Demo Parking 2': generateParkingSpots(24, 2)
};

// Mock reservations storage
// In a real application, this would be stored in a database
let mockReservations: ReservationData[] = [
  {
    id: 'R001',
    userId: 'user-123',
    parkingComplex: 'Demo Parking 1',
    spotId: 'A12',
    vehiclePlate: 'ABC123',
    date: '2025-04-11', // Current date for demo purpose
    time: '2:00 PM',
    duration: '2 hours',
    status: 'upcoming',
    createdAt: '2025-04-10T10:30:00Z'
  },
  {
    id: 'R002',
    userId: 'user-123',
    parkingComplex: 'Demo Parking 2',
    spotId: 'A05',
    vehiclePlate: 'ABC123',
    date: '2025-04-11', // Current date for demo purpose
    time: '9:00 AM',
    duration: '1 hour',
    status: 'live',
    createdAt: '2025-04-09T22:15:00Z'
  },
  {
    id: 'R003',
    userId: 'user-123',
    parkingComplex: 'Demo Parking 1',
    spotId: 'A03',
    vehiclePlate: 'ABC123',
    date: '2025-04-10', // Past date for demo purpose
    time: '4:30 PM',
    duration: '4 hours',
    status: 'past',
    createdAt: '2025-03-14T12:00:00Z'
  }
];

// Function to update the mock parking data when a reservation is made
// MOVED THIS FUNCTION BEFORE IT'S USED IN initializeSpotStatus
export const updateParkingSpotStatus = (parkingComplex: string, spotId: string, newStatus: SpotStatus): void => {
  if (!parkingComplex || !spotId) return;
  
  const complexKey = parkingComplex as keyof typeof parkingData;
  if (!parkingData[complexKey]) return;
  
  const complexSpots = parkingData[complexKey];
  const spotIndex = complexSpots.findIndex(spot => spot.id === spotId);
  
  if (spotIndex !== -1) {
    complexSpots[spotIndex].status = newStatus;
    console.log(`Updated spot ${spotId} in ${parkingComplex} to ${newStatus}`);
  }
};

// Initialize parking spot status based on existing reservations
const initializeSpotStatus = () => {
  // Mark spots as reserved based on active and upcoming reservations
  mockReservations.forEach(reservation => {
    if (reservation.status === 'upcoming' || reservation.status === 'live') {
      updateParkingSpotStatus(reservation.parkingComplex, reservation.spotId, 'reserved');
    }
  });
};

// Call initialization when the module loads
initializeSpotStatus();

// Reservation service functions
export const getReservationsByUserId = (userId: string): ReservationData[] => {
  return mockReservations.filter(res => res.userId === userId);
};

export const addReservation = (reservation: Omit<ReservationData, 'id' | 'createdAt'>): ReservationData => {
  const newReservation = {
    ...reservation,
    id: `R${(mockReservations.length + 1).toString().padStart(3, '0')}`,
    createdAt: new Date().toISOString()
  };
  
  mockReservations.push(newReservation);
  
  // Update the parking spot status to reserved
  updateParkingSpotStatus(reservation.parkingComplex, reservation.spotId, 'reserved');
  
  return newReservation;
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

export const getUpcomingReservations = (userId: string): ReservationData[] => {
  // Update status dynamically based on current date and time
  const today = new Date().toISOString().split('T')[0];
  const currentHour = new Date().getHours();
  
  mockReservations.forEach(res => {
    if (res.date > today) {
      res.status = 'upcoming';
    } else if (res.date === today) {
      const reservationHour = getHourFromTime(res.time);
      if (reservationHour > currentHour) {
        res.status = 'upcoming';
      } else {
        res.status = 'live';
      }
    } else {
      res.status = 'past';
    }
  });
  
  return mockReservations.filter(res => res.userId === userId && res.status === 'upcoming');
};

export const getLiveReservations = (userId: string): ReservationData[] => {
  // Update status dynamically based on current date and time
  const today = new Date().toISOString().split('T')[0];
  const currentHour = new Date().getHours();
  
  mockReservations.forEach(res => {
    if (res.date === today) {
      const reservationHour = getHourFromTime(res.time);
      // Check if reservation time is current
      if (reservationHour <= currentHour && 
          (reservationHour + parseInt(res.duration.split(' ')[0]) > currentHour || 
           res.duration === '24 hours')) {
        res.status = 'live';
      } else if (reservationHour > currentHour) {
        res.status = 'upcoming';
      } else {
        res.status = 'past';
      }
    } else if (res.date > today) {
      res.status = 'upcoming';
    } else {
      res.status = 'past';
    }
  });
  
  return mockReservations.filter(res => res.userId === userId && res.status === 'live');
};

export const getPastReservations = (userId: string): ReservationData[] => {
  // Update status dynamically based on current date and time
  const today = new Date().toISOString().split('T')[0];
  const currentHour = new Date().getHours();
  
  mockReservations.forEach(res => {
    if (res.date < today) {
      res.status = 'past';
    } else if (res.date === today) {
      const reservationHour = getHourFromTime(res.time);
      const durationHours = parseInt(res.duration.split(' ')[0]);
      
      if (reservationHour + durationHours <= currentHour && res.duration !== '24 hours') {
        res.status = 'past';
      }
    }
  });
  
  return mockReservations.filter(res => res.userId === userId && res.status === 'past');
};

// Function to get all parking spots with their current status
export const getAllParkingSpots = () => {
  return parkingData;
};

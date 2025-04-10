
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
    date: '2025-04-20',
    time: '14:00',
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
    date: '2025-04-10',
    time: '09:00',
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
    date: '2025-03-15',
    time: '16:30',
    duration: '4 hours',
    status: 'past',
    createdAt: '2025-03-14T12:00:00Z'
  }
];

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

export const getUpcomingReservations = (userId: string): ReservationData[] => {
  // Update status dynamically based on current date
  const today = new Date().toISOString().split('T')[0];
  mockReservations.forEach(res => {
    if (res.date > today) {
      res.status = 'upcoming';
    } else if (res.date === today) {
      res.status = 'live';
    } else {
      res.status = 'past';
    }
  });
  
  return mockReservations.filter(res => res.userId === userId && res.status === 'upcoming');
};

export const getLiveReservations = (userId: string): ReservationData[] => {
  // Update status dynamically based on current date
  const today = new Date().toISOString().split('T')[0];
  mockReservations.forEach(res => {
    if (res.date > today) {
      res.status = 'upcoming';
    } else if (res.date === today) {
      res.status = 'live';
    } else {
      res.status = 'past';
    }
  });
  
  return mockReservations.filter(res => res.userId === userId && res.status === 'live');
};

export const getPastReservations = (userId: string): ReservationData[] => {
  // Update status dynamically based on current date
  const today = new Date().toISOString().split('T')[0];
  mockReservations.forEach(res => {
    if (res.date > today) {
      res.status = 'upcoming';
    } else if (res.date === today) {
      res.status = 'live';
    } else {
      res.status = 'past';
    }
  });
  
  return mockReservations.filter(res => res.userId === userId && res.status === 'past');
};

// Function to update the mock parking data when a reservation is made
export const updateParkingSpotStatus = (parkingComplex: string, spotId: string, newStatus: SpotStatus): void => {
  if (!parkingComplex || !spotId) return;
  
  const complexKey = parkingComplex as keyof typeof parkingData;
  if (!parkingData[complexKey]) return;
  
  const complexSpots = parkingData[complexKey];
  const spotIndex = complexSpots.findIndex(spot => spot.id === spotId);
  
  if (spotIndex !== -1) {
    complexSpots[spotIndex].status = newStatus;
  }
};

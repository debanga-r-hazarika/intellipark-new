
import { SpotStatus } from '@/components/ParkingSpot';

export interface ParkingSpotData {
  id: string;
  status: SpotStatus;
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

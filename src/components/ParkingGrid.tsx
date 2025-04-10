
import React from 'react';
import ParkingSpot from './ParkingSpot';
import { ParkingSpotData } from '@/utils/parkingData';

interface ParkingGridProps {
  spots: ParkingSpotData[];
  onSpotClick: (spotId: string) => void;
}

const ParkingGrid: React.FC<ParkingGridProps> = ({ spots, onSpotClick }) => {
  return (
    <div className="p-4 card-glassmorphism rounded-lg">
      <h3 className="text-lg font-medium mb-4 text-center">Parking Availability</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-4">
        {spots.map((spot) => (
          <ParkingSpot
            key={spot.id}
            id={spot.id}
            status={spot.status}
            onClick={() => spot.status === 'available' && onSpotClick(spot.id)}
          />
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-parking-available"></div>
          <span className="text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-parking-occupied"></div>
          <span className="text-sm">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span className="text-sm">Reserved</span>
        </div>
      </div>
    </div>
  );
};

export default ParkingGrid;

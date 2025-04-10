
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';

export type SpotStatus = 'available' | 'occupied' | 'reserved';

interface ParkingSpotProps {
  id: string;
  status: SpotStatus;
  onClick?: () => void;
}

const getStatusInfo = (status: SpotStatus) => {
  switch(status) {
    case 'available':
      return { color: 'bg-parking-available hover:bg-green-400', text: 'Available', tooltip: 'Click to reserve this spot', isClickable: true };
    case 'occupied':
      return { color: 'bg-parking-occupied', text: 'Occupied', tooltip: 'Already booked', isClickable: false };
    case 'reserved':
      return { color: 'bg-blue-500', text: 'Reserved', tooltip: 'Reserved', isClickable: false };
    default:
      return { color: 'bg-gray-300', text: 'Unknown', tooltip: 'Status unknown', isClickable: false };
  }
};

const ParkingSpot: React.FC<ParkingSpotProps> = ({ id, status, onClick }) => {
  const { color, text, tooltip, isClickable } = getStatusInfo(status);
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={cn(
            'w-16 h-16 md:w-20 md:h-20 rounded-md flex items-center justify-center text-white text-sm font-medium relative transition-all duration-300',
            color,
            isClickable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30' : 'cursor-not-allowed opacity-90',
            isClickable ? 'btn-hover-glow' : ''
          )}
          onClick={isClickable ? onClick : undefined}
        >
          <div className="text-xs md:text-sm">{id}</div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default ParkingSpot;


import React from 'react';
import { Button } from '@/components/ui/button';

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

interface ReservationCardProps {
  reservation: ReservationData;
  type: 'upcoming' | 'live' | 'past';
}

export const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, type }) => {
  const getBadgeColor = () => {
    switch (type) {
      case 'upcoming':
        return 'bg-yellow-200 text-yellow-800';
      case 'live':
        return 'bg-green-200 text-green-800';
      case 'past':
        return 'bg-gray-200 text-gray-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };
  
  const calculateRemainingTime = () => {
    if (type !== 'live') return null;
    
    const today = new Date();
    const reservationTime = reservation.time;
    const durationStr = reservation.duration;
    
    // Extract duration value in hours
    let durationHours = 1;
    if (durationStr === '24 hours') {
      durationHours = 24;
    } else {
      const durationMatch = durationStr.match(/(\d+)/);
      if (durationMatch && durationMatch[1]) {
        durationHours = parseInt(durationMatch[1]);
        // Convert minutes to hours if needed
        if (durationStr.includes('min')) {
          durationHours = durationHours / 60;
        }
      }
    }
    
    // Parse reservation time
    const timeMatch = reservationTime.match(/(\d+):(\d+)\s+(AM|PM)/i);
    if (!timeMatch) return "Unknown";
    
    let hour = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const ampm = timeMatch[3].toUpperCase();
    
    // Convert to 24-hour format
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    
    // Calculate end time
    const endTime = new Date(today);
    endTime.setHours(hour);
    endTime.setMinutes(minutes);
    endTime.setSeconds(0);
    endTime.setMilliseconds(0);
    endTime.setTime(endTime.getTime() + (durationHours * 60 * 60 * 1000));
    
    // If end time is past, return "Expired"
    if (endTime <= today) return "Expired";
    
    // Calculate difference in milliseconds
    const diffMs = endTime.getTime() - today.getTime();
    
    // Convert to hours and minutes
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  };
  
  return (
    <div className="p-4 border rounded-lg hover-lift">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex gap-2 items-center mb-2">
            <h3 className="font-semibold">{reservation.parkingComplex}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${getBadgeColor()}`}>
              {type === 'upcoming' ? 'Upcoming' : type === 'live' ? 'Active' : 'Past'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Spot: <span className="font-medium">{reservation.spotId || 'N/A'}</span></p>
          <p className="text-sm text-muted-foreground mb-1">Vehicle: <span className="font-medium">{reservation.vehiclePlate}</span></p>
          <p className="text-sm text-muted-foreground mb-1">Date: <span className="font-medium">{reservation.date}</span></p>
          <p className="text-sm text-muted-foreground mb-1">Time: <span className="font-medium">{reservation.time}</span></p>
          <p className="text-sm text-muted-foreground">Duration: <span className="font-medium">{reservation.duration}</span></p>
          
          {type === 'live' && (
            <p className="text-sm font-medium mt-2 text-primary">
              Remaining time: {calculateRemainingTime()}
            </p>
          )}
        </div>
        
        <div>
          {type === 'upcoming' && (
            <Button variant="outline" size="sm" className="text-xs">Cancel</Button>
          )}
          {type === 'live' && (
            <Button variant="outline" size="sm" className="text-xs">Extend</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReservationCard;

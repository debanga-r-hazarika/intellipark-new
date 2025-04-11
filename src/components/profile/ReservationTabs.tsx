
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReservationCard, { ReservationData } from './ReservationCard';
import EmptyState from './EmptyState';

interface ReservationTabsProps {
  upcomingReservations: ReservationData[];
  liveReservations: ReservationData[];
  pastReservations: ReservationData[];
}

export const ReservationTabs: React.FC<ReservationTabsProps> = ({ 
  upcomingReservations, 
  liveReservations, 
  pastReservations 
}) => {
  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        <TabsTrigger value="live">Live</TabsTrigger>
        <TabsTrigger value="past">Past</TabsTrigger>
      </TabsList>
      
      <TabsContent value="upcoming" className="space-y-4 pt-4">
        {upcomingReservations.length > 0 ? (
          upcomingReservations.map((reservation) => (
            <ReservationCard 
              key={reservation.id}
              reservation={reservation}
              type="upcoming"
            />
          ))
        ) : (
          <EmptyState message="No upcoming reservations" />
        )}
      </TabsContent>
      
      <TabsContent value="live" className="space-y-4 pt-4">
        {liveReservations.length > 0 ? (
          liveReservations.map((reservation) => (
            <ReservationCard 
              key={reservation.id}
              reservation={reservation}
              type="live"
            />
          ))
        ) : (
          <EmptyState message="No active reservations" />
        )}
      </TabsContent>
      
      <TabsContent value="past" className="space-y-4 pt-4">
        {pastReservations.length > 0 ? (
          pastReservations.map((reservation) => (
            <ReservationCard 
              key={reservation.id}
              reservation={reservation}
              type="past"
            />
          ))
        ) : (
          <EmptyState message="No past reservations" />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ReservationTabs;

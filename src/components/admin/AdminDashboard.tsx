
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalComplexes: number;
  totalSpots: number;
  availableSpots: number;
  reservedSpots: number;
  occupiedSpots: number;
  totalReservations: number;
  activeReservations: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalComplexes: 0,
    totalSpots: 0,
    availableSpots: 0,
    reservedSpots: 0,
    occupiedSpots: 0,
    totalReservations: 0,
    activeReservations: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get parking complexes count
        const { data: spots } = await supabase
          .from('parking_spots')
          .select('parking_complex, status');
        
        // Get reservations stats
        const { data: reservations } = await supabase
          .from('reservations')
          .select('status');

        // Calculate unique complexes
        const uniqueComplexes = new Set(spots?.map(spot => spot.parking_complex) || []);
        
        const availableSpots = spots?.filter(spot => spot.status === 'available').length || 0;
        const reservedSpots = spots?.filter(spot => spot.status === 'reserved').length || 0;
        const occupiedSpots = spots?.filter(spot => spot.status === 'occupied').length || 0;
        const activeReservations = reservations?.filter(res => res.status === 'upcoming' || res.status === 'live').length || 0;

        setStats({
          totalComplexes: uniqueComplexes.size,
          totalSpots: spots?.length || 0,
          availableSpots,
          reservedSpots,
          occupiedSpots,
          totalReservations: reservations?.length || 0,
          activeReservations,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Complexes', value: stats.totalComplexes, color: 'text-blue-600' },
    { title: 'Total Spots', value: stats.totalSpots, color: 'text-purple-600' },
    { title: 'Available Spots', value: stats.availableSpots, color: 'text-green-600' },
    { title: 'Reserved Spots', value: stats.reservedSpots, color: 'text-yellow-600' },
    { title: 'Occupied Spots', value: stats.occupiedSpots, color: 'text-red-600' },
    { title: 'Total Reservations', value: stats.totalReservations, color: 'text-indigo-600' },
    { title: 'Active Reservations', value: stats.activeReservations, color: 'text-orange-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminDashboard;

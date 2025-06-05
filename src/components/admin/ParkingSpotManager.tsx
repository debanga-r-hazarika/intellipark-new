
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type SpotStatus = 'available' | 'reserved' | 'occupied';

interface ParkingSpotData {
  id: string;
  spot_id: string;
  parking_complex: string;
  status: SpotStatus;
  created_at: string;
  updated_at: string;
}

const ParkingSpotManager: React.FC = () => {
  const [spots, setSpots] = useState<ParkingSpotData[]>([]);
  const [complexes, setComplexes] = useState<string[]>([]);
  const [newSpot, setNewSpot] = useState({ spotId: '', complex: '', status: 'available' as SpotStatus });
  const [filterComplex, setFilterComplex] = useState<string>('all');

  useEffect(() => {
    fetchSpots();
    fetchComplexes();
  }, []);

  const fetchComplexes = async () => {
    try {
      const { data: spots } = await supabase
        .from('parking_spots')
        .select('parking_complex');

      if (spots) {
        const uniqueComplexes = [...new Set(spots.map(spot => spot.parking_complex))];
        setComplexes(uniqueComplexes);
      }
    } catch (error) {
      console.error('Error fetching complexes:', error);
    }
  };

  const fetchSpots = async () => {
    try {
      const { data, error } = await supabase
        .from('parking_spots')
        .select('*')
        .order('parking_complex, spot_id');

      if (error) throw error;

      if (data) {
        // Type assertion to ensure the data matches our interface
        const typedData = data.map(spot => ({
          ...spot,
          status: spot.status as SpotStatus
        }));
        setSpots(typedData);
      }
    } catch (error) {
      console.error('Error fetching spots:', error);
      toast.error('Failed to fetch parking spots');
    }
  };

  const handleAddSpot = async () => {
    if (!newSpot.spotId || !newSpot.complex) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('parking_spots')
        .insert([{
          spot_id: newSpot.spotId,
          parking_complex: newSpot.complex,
          status: newSpot.status,
        }]);

      if (error) throw error;

      toast.success('Parking spot added successfully');
      setNewSpot({ spotId: '', complex: '', status: 'available' });
      fetchSpots();
      fetchComplexes();
    } catch (error) {
      console.error('Error adding spot:', error);
      toast.error('Failed to add parking spot');
    }
  };

  const handleUpdateSpotStatus = async (spotId: string, newStatus: SpotStatus) => {
    try {
      const { error } = await supabase
        .from('parking_spots')
        .update({ status: newStatus })
        .eq('id', spotId);

      if (error) throw error;

      toast.success('Spot status updated successfully');
      fetchSpots();
    } catch (error) {
      console.error('Error updating spot status:', error);
      toast.error('Failed to update spot status');
    }
  };

  const handleDeleteSpot = async (spotId: string) => {
    try {
      const { error } = await supabase
        .from('parking_spots')
        .delete()
        .eq('id', spotId);

      if (error) throw error;

      toast.success('Parking spot deleted successfully');
      fetchSpots();
    } catch (error) {
      console.error('Error deleting spot:', error);
      toast.error('Failed to delete parking spot');
    }
  };

  const filteredSpots = filterComplex === 'all' 
    ? spots 
    : spots.filter(spot => spot.parking_complex === filterComplex);

  const getStatusColor = (status: SpotStatus) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'reserved': return 'bg-yellow-500';
      case 'occupied': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Spot */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Parking Spot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Spot ID"
              value={newSpot.spotId}
              onChange={(e) => setNewSpot({ ...newSpot, spotId: e.target.value })}
            />
            <Input
              placeholder="Complex Name"
              value={newSpot.complex}
              onChange={(e) => setNewSpot({ ...newSpot, complex: e.target.value })}
            />
            <Select value={newSpot.status} onValueChange={(value: SpotStatus) => setNewSpot({ ...newSpot, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleAddSpot}>Add Spot</Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <div className="flex gap-4 items-center">
        <label>Filter by Complex:</label>
        <Select value={filterComplex} onValueChange={setFilterComplex}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Complexes</SelectItem>
            {complexes.map(complex => (
              <SelectItem key={complex} value={complex}>{complex}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Spots List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpots.map((spot) => (
          <Card key={spot.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{spot.spot_id}</CardTitle>
                <Badge className={getStatusColor(spot.status)}>
                  {spot.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{spot.parking_complex}</p>
              <div className="space-y-2">
                <Select 
                  value={spot.status} 
                  onValueChange={(value: SpotStatus) => handleUpdateSpotStatus(spot.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteSpot(spot.id)}
                  className="w-full"
                >
                  Delete Spot
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ParkingSpotManager;

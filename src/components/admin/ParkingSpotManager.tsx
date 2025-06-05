
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SpotStatus } from '@/components/ParkingSpot';

interface ParkingSpotData {
  id: string;
  spot_id: string;
  parking_complex: string;
  status: SpotStatus;
}

const ParkingSpotManager: React.FC = () => {
  const [spots, setSpots] = useState<ParkingSpotData[]>([]);
  const [complexes, setComplexes] = useState<string[]>([]);
  const [selectedComplex, setSelectedComplex] = useState<string>('');
  const [newSpot, setNewSpot] = useState({
    spotId: '',
    parkingComplex: '',
    status: 'available' as SpotStatus
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchComplexes = async () => {
    try {
      const { data, error } = await supabase
        .from('parking_spots')
        .select('parking_complex')
        .distinct();

      if (error) throw error;
      setComplexes(data.map(item => item.parking_complex));
    } catch (error) {
      console.error('Error fetching complexes:', error);
    }
  };

  const fetchSpots = async (complex?: string) => {
    try {
      let query = supabase
        .from('parking_spots')
        .select('*')
        .order('parking_complex')
        .order('spot_id');

      if (complex) {
        query = query.eq('parking_complex', complex);
      }

      const { data, error } = await query;
      if (error) throw error;

      setSpots(data || []);
    } catch (error) {
      console.error('Error fetching spots:', error);
      toast.error('Failed to load parking spots');
    }
  };

  useEffect(() => {
    fetchComplexes();
    fetchSpots();
  }, []);

  useEffect(() => {
    fetchSpots(selectedComplex || undefined);
  }, [selectedComplex]);

  const addSpot = async () => {
    if (!newSpot.spotId || !newSpot.parkingComplex) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('parking_spots')
        .insert({
          spot_id: newSpot.spotId,
          parking_complex: newSpot.parkingComplex,
          status: newSpot.status
        });

      if (error) throw error;

      toast.success('Parking spot added successfully');
      setNewSpot({ spotId: '', parkingComplex: '', status: 'available' });
      setIsDialogOpen(false);
      fetchSpots(selectedComplex || undefined);
    } catch (error) {
      console.error('Error adding spot:', error);
      toast.error('Failed to add parking spot');
    }
  };

  const updateSpotStatus = async (spotId: string, parkingComplex: string, newStatus: SpotStatus) => {
    try {
      const { error } = await supabase
        .from('parking_spots')
        .update({ status: newStatus })
        .eq('spot_id', spotId)
        .eq('parking_complex', parkingComplex);

      if (error) throw error;

      toast.success('Spot status updated successfully');
      fetchSpots(selectedComplex || undefined);
    } catch (error) {
      console.error('Error updating spot status:', error);
      toast.error('Failed to update spot status');
    }
  };

  const deleteSpot = async (id: string) => {
    if (!confirm('Are you sure you want to delete this spot?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('parking_spots')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Parking spot deleted successfully');
      fetchSpots(selectedComplex || undefined);
    } catch (error) {
      console.error('Error deleting spot:', error);
      toast.error('Failed to delete parking spot');
    }
  };

  const getStatusColor = (status: SpotStatus) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'reserved': return 'text-yellow-600 bg-yellow-100';
      case 'occupied': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4 items-center">
          <h3 className="text-lg font-semibold">Parking Spots</h3>
          <Select value={selectedComplex} onValueChange={setSelectedComplex}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by complex" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Complexes</SelectItem>
              {complexes.map((complex) => (
                <SelectItem key={complex} value={complex}>
                  {complex}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Spot</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Parking Spot</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="spotId">Spot ID</Label>
                <Input
                  id="spotId"
                  value={newSpot.spotId}
                  onChange={(e) => setNewSpot({ ...newSpot, spotId: e.target.value })}
                  placeholder="Enter spot ID"
                />
              </div>
              <div>
                <Label htmlFor="parkingComplex">Parking Complex</Label>
                <Select
                  value={newSpot.parkingComplex}
                  onValueChange={(value) => setNewSpot({ ...newSpot, parkingComplex: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select complex" />
                  </SelectTrigger>
                  <SelectContent>
                    {complexes.map((complex) => (
                      <SelectItem key={complex} value={complex}>
                        {complex}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newSpot.status}
                  onValueChange={(value) => setNewSpot({ ...newSpot, status: value as SpotStatus })}
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
              </div>
              <Button onClick={addSpot} className="w-full">
                Add Spot
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Spot ID</TableHead>
            <TableHead>Complex</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {spots.map((spot) => (
            <TableRow key={spot.id}>
              <TableCell className="font-medium">{spot.spot_id}</TableCell>
              <TableCell>{spot.parking_complex}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(spot.status)}`}>
                  {spot.status}
                </span>
              </TableCell>
              <TableCell className="space-x-2">
                <Select
                  value={spot.status}
                  onValueChange={(value) => updateSpotStatus(spot.spot_id, spot.parking_complex, value as SpotStatus)}
                >
                  <SelectTrigger className="w-32">
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
                  onClick={() => deleteSpot(spot.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ParkingSpotManager;

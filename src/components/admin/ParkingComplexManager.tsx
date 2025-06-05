
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ParkingComplex {
  name: string;
  spotCount: number;
}

const ParkingComplexManager: React.FC = () => {
  const [complexes, setComplexes] = useState<ParkingComplex[]>([]);
  const [newComplexName, setNewComplexName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchComplexes = async () => {
    try {
      const { data, error } = await supabase
        .from('parking_spots')
        .select('parking_complex')
        .distinct();

      if (error) throw error;

      const complexStats = await Promise.all(
        data.map(async (complex) => {
          const { data: spots } = await supabase
            .from('parking_spots')
            .select('id')
            .eq('parking_complex', complex.parking_complex);
          
          return {
            name: complex.parking_complex,
            spotCount: spots?.length || 0
          };
        })
      );

      setComplexes(complexStats);
    } catch (error) {
      console.error('Error fetching complexes:', error);
      toast.error('Failed to load parking complexes');
    }
  };

  useEffect(() => {
    fetchComplexes();
  }, []);

  const addComplex = async () => {
    if (!newComplexName.trim()) {
      toast.error('Please enter a complex name');
      return;
    }

    try {
      // Create 20 default spots for the new complex
      const spots = Array.from({ length: 20 }, (_, i) => ({
        parking_complex: newComplexName,
        spot_id: `${i + 1}`,
        status: 'available'
      }));

      const { error } = await supabase
        .from('parking_spots')
        .insert(spots);

      if (error) throw error;

      toast.success('Parking complex added successfully');
      setNewComplexName('');
      setIsDialogOpen(false);
      fetchComplexes();
    } catch (error) {
      console.error('Error adding complex:', error);
      toast.error('Failed to add parking complex');
    }
  };

  const deleteComplex = async (complexName: string) => {
    if (!confirm(`Are you sure you want to delete "${complexName}" and all its spots?`)) {
      return;
    }

    try {
      // Delete all reservations for this complex first
      await supabase
        .from('reservations')
        .delete()
        .eq('parking_complex', complexName);

      // Delete all spots for this complex
      const { error } = await supabase
        .from('parking_spots')
        .delete()
        .eq('parking_complex', complexName);

      if (error) throw error;

      toast.success('Parking complex deleted successfully');
      fetchComplexes();
    } catch (error) {
      console.error('Error deleting complex:', error);
      toast.error('Failed to delete parking complex');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Parking Complexes</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Complex</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Parking Complex</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="complexName">Complex Name</Label>
                <Input
                  id="complexName"
                  value={newComplexName}
                  onChange={(e) => setNewComplexName(e.target.value)}
                  placeholder="Enter complex name"
                />
              </div>
              <Button onClick={addComplex} className="w-full">
                Add Complex (with 20 default spots)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Complex Name</TableHead>
            <TableHead>Total Spots</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complexes.map((complex) => (
            <TableRow key={complex.name}>
              <TableCell className="font-medium">{complex.name}</TableCell>
              <TableCell>{complex.spotCount}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteComplex(complex.name)}
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

export default ParkingComplexManager;

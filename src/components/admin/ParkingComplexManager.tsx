
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ComplexData {
  name: string;
  spotCount: number;
}

const ParkingComplexManager: React.FC = () => {
  const [complexes, setComplexes] = useState<ComplexData[]>([]);
  const [newComplex, setNewComplex] = useState('');

  useEffect(() => {
    fetchComplexes();
  }, []);

  const fetchComplexes = async () => {
    try {
      const { data: spots } = await supabase
        .from('parking_spots')
        .select('parking_complex');

      if (spots) {
        // Group by complex and count spots
        const complexMap = spots.reduce((acc: Record<string, number>, spot) => {
          acc[spot.parking_complex] = (acc[spot.parking_complex] || 0) + 1;
          return acc;
        }, {});

        const complexData = Object.entries(complexMap).map(([name, spotCount]) => ({
          name,
          spotCount,
        }));

        setComplexes(complexData);
      }
    } catch (error) {
      console.error('Error fetching complexes:', error);
      toast.error('Failed to fetch parking complexes');
    }
  };

  const handleDeleteComplex = async (complexName: string) => {
    try {
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
      <div className="flex gap-4">
        <Input
          placeholder="New complex name"
          value={newComplex}
          onChange={(e) => setNewComplex(e.target.value)}
        />
        <Button onClick={() => {
          if (newComplex.trim()) {
            // Note: To create a complex, you need to add spots to it
            toast.info('Add parking spots to create a new complex');
            setNewComplex('');
          }
        }}>
          Add Complex
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {complexes.map((complex) => (
          <Card key={complex.name}>
            <CardHeader>
              <CardTitle className="text-lg">{complex.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {complex.spotCount} spots
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDeleteComplex(complex.name)}
              >
                Delete Complex
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ParkingComplexManager;

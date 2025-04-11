
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { KeyIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import PasswordChangeForm from './PasswordChangeForm';

interface UserProfileFormProps {
  initialName: string;
  initialEmail: string;
  initialVehiclePlate: string;
  onLogout: () => Promise<void>;
}

export const UserProfileForm: React.FC<UserProfileFormProps> = ({ 
  initialName, 
  initialEmail, 
  initialVehiclePlate,
  onLogout
}) => {
  const [name, setName] = useState(initialName);
  const [vehiclePlate, setVehiclePlate] = useState(initialVehiclePlate);
  
  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Update profile in database
        const { error } = await supabase
          .from('profiles')
          .update({
            name,
            vehicle_plate: vehiclePlate
          })
          .eq('id', user.id);
        
        if (error) throw error;
        
        toast.success('Your details have been updated successfully!');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update your details');
    }
  };
  
  return (
    <form className="space-y-4" onSubmit={handleUpdateDetails}>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input 
          id="name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          value={initialEmail}
          readOnly
          className="bg-muted"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="vehiclePlate">Vehicle Plate Number</Label>
        <Input 
          id="vehiclePlate" 
          value={vehiclePlate}
          onChange={(e) => setVehiclePlate(e.target.value)}
        />
      </div>
      
      <div className="pt-4 space-y-2">
        <Button className="w-full" type="submit">
          Update Details
        </Button>
        
        {/* Password Change Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <KeyIcon className="h-4 w-4" />
              Change Password
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Your Password</DialogTitle>
              <DialogDescription>
                Enter your current password and set a new one.
              </DialogDescription>
            </DialogHeader>
            
            <PasswordChangeForm />
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="outline" 
          className="w-full mt-2"
          onClick={onLogout}
          type="button"
        >
          Logout
        </Button>
      </div>
    </form>
  );
};

export default UserProfileForm;

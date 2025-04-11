import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EyeIcon, EyeOffIcon, KeyIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  getUpcomingReservations, 
  getLiveReservations, 
  getPastReservations 
} from '@/utils/parkingData';
import { supabase } from '@/integrations/supabase/client';

interface ProfileProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

const Profile: React.FC<ProfileProps> = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  
  // Reservations state
  const [upcomingReservations, setUpcomingReservations] = useState<any[]>([]);
  const [liveReservations, setLiveReservations] = useState<any[]>([]);
  const [pastReservations, setPastReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Fetch user data on component mount
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('You need to log in first!');
      navigate('/login');
      return;
    }
    
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            setName(profile.name || '');
            setEmail(user.email || '');
            setVehiclePlate(profile.vehicle_plate || '');
            
            // Fetch reservations from Supabase
            const upcoming = await getUpcomingReservations(user.id);
            const live = await getLiveReservations(user.id);
            const past = await getPastReservations(user.id);
            
            setUpcomingReservations(upcoming);
            setLiveReservations(live);
            setPastReservations(past);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [isLoggedIn, navigate]);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      toast.success('Successfully logged out!');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };
  
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
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    // Simple validation
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success('Your password has been changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordError('Failed to change password');
    }
  };
  
  if (!isLoggedIn) return null; // Don't render if not logged in
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 pt-24 px-4 pb-16">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <Card className="md:col-span-1 animate-fade-in card-glassmorphism">
              <CardHeader>
                <CardTitle>Personal Details</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent>
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
                      value={email}
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
                        
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                          {passwordError && (
                            <Alert variant="destructive">
                              <AlertDescription>{passwordError}</AlertDescription>
                            </Alert>
                          )}
                          
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <div className="relative">
                              <Input
                                id="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              >
                                {showCurrentPassword ? (
                                  <EyeOffIcon className="h-4 w-4" />
                                ) : (
                                  <EyeIcon className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                              <Input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                              >
                                {showNewPassword ? (
                                  <EyeOffIcon className="h-4 w-4" />
                                ) : (
                                  <EyeIcon className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                            />
                          </div>
                          
                          <DialogFooter className="mt-4">
                            <DialogClose asChild>
                              <Button variant="outline" type="button">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Change Password</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-2"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            {/* Reservations Tab */}
            <Card className="md:col-span-2 animate-fade-in card-glassmorphism">
              <CardHeader>
                <CardTitle>My Reservations</CardTitle>
                <CardDescription>View and manage your parking reservations</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// Empty state for when there are no reservations
const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-8">
    <p className="text-muted-foreground">{message}</p>
    <Button 
      variant="outline" 
      onClick={() => window.location.href = '/reserve'} 
      className="mt-4"
    >
      Make a Reservation
    </Button>
  </div>
);

// Reservation card component
interface ReservationCardProps {
  reservation: any;
  type: 'upcoming' | 'live' | 'past';
}

const ReservationCard: React.FC<ReservationCardProps> = ({ reservation, type }) => {
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
          <p className="text-sm text-muted-foreground mb-1">Spot: <span className="font-medium">{reservation.spotId}</span></p>
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

export default Profile;

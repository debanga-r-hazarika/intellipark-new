
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

interface ProfileProps {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

// Mock user data
const userData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  vehiclePlate: 'ABC123',
  reservations: {
    past: [
      { id: 'P001', complex: 'Demo Parking 1', spot: 'A03', date: '2023-10-15', duration: '2 hours' },
      { id: 'P002', complex: 'Demo Parking 2', spot: 'A08', date: '2023-10-10', duration: '1 hour' },
    ],
    upcoming: [
      { id: 'U001', complex: 'Demo Parking 1', spot: 'A12', date: '2023-11-20', duration: '4 hours' },
    ],
    live: [
      { id: 'L001', complex: 'Demo Parking 2', spot: 'A05', date: '2023-11-01', duration: '1 hour', remainingTime: '35 min' },
    ]
  }
};

const Profile: React.FC<ProfileProps> = ({ isLoggedIn, setIsLoggedIn }) => {
  const navigate = useNavigate();
  
  // Form state
  const [name, setName] = useState(userData.name);
  const [email, setEmail] = useState(userData.email);
  const [vehiclePlate, setVehiclePlate] = useState(userData.vehiclePlate);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('You need to log in first!');
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    toast.success('Successfully logged out!');
    navigate('/');
  };
  
  const handleUpdateDetails = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here you would typically make an API call to update user details
    toast.success('Your details have been updated successfully!');
  };
  
  const handlePasswordChange = (e: React.FormEvent) => {
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
    
    // Here you would typically make an API call to change password
    toast.success('Your password has been changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  if (!isLoggedIn) return null; // Don't render if not logged in
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 pt-24 px-4 pb-16">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        
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
                    onChange={(e) => setEmail(e.target.value)}
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
                  {userData.reservations.upcoming.length > 0 ? (
                    userData.reservations.upcoming.map((reservation) => (
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
                  {userData.reservations.live.length > 0 ? (
                    userData.reservations.live.map((reservation) => (
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
                  {userData.reservations.past.length > 0 ? (
                    userData.reservations.past.map((reservation) => (
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
  reservation: any; // Using 'any' for simplicity
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
  
  return (
    <div className="p-4 border rounded-lg hover-lift">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex gap-2 items-center mb-2">
            <h3 className="font-semibold">{reservation.complex}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${getBadgeColor()}`}>
              {type === 'upcoming' ? 'Upcoming' : type === 'live' ? 'Active' : 'Past'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mb-1">Spot: <span className="font-medium">{reservation.spot}</span></p>
          <p className="text-sm text-muted-foreground mb-1">Date: {reservation.date}</p>
          <p className="text-sm text-muted-foreground">Duration: {reservation.duration}</p>
          
          {type === 'live' && reservation.remainingTime && (
            <p className="text-sm font-medium mt-2 text-primary">
              Remaining time: {reservation.remainingTime}
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

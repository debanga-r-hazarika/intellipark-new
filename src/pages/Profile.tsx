
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import UserProfileForm from '@/components/profile/UserProfileForm';
import ReservationTabs from '@/components/profile/ReservationTabs';
import useProfile from '@/hooks/useProfile';

const Profile: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  const {
    userProfile,
    upcomingReservations,
    liveReservations,
    pastReservations,
    isLoading,
    handleLogout
  } = useProfile(isLoggedIn, () => {}, navigate);
  
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
                <UserProfileForm
                  initialName={userProfile.name}
                  initialEmail={userProfile.email}
                  initialVehiclePlate={userProfile.vehiclePlate}
                  onLogout={handleLogout}
                />
              </CardContent>
            </Card>
            
            {/* Reservations Tab */}
            <Card className="md:col-span-2 animate-fade-in card-glassmorphism">
              <CardHeader>
                <CardTitle>My Reservations</CardTitle>
                <CardDescription>View and manage your parking reservations</CardDescription>
              </CardHeader>
              <CardContent>
                <ReservationTabs
                  upcomingReservations={upcomingReservations}
                  liveReservations={liveReservations}
                  pastReservations={pastReservations}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

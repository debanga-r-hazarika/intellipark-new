
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  getUpcomingReservations, 
  getLiveReservations, 
  getPastReservations 
} from '@/utils/parkingData';
import { ReservationData } from '@/components/profile/ReservationCard';

interface UserProfile {
  name: string;
  email: string;
  vehiclePlate: string;
}

interface UseProfileResult {
  userProfile: UserProfile;
  upcomingReservations: ReservationData[];
  liveReservations: ReservationData[];
  pastReservations: ReservationData[];
  isLoading: boolean;
  handleLogout: () => Promise<void>;
}

export const useProfile = (
  isLoggedIn: boolean, 
  setIsLoggedIn: (value: boolean) => void,
  navigate: (path: string) => void
): UseProfileResult => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    email: "",
    vehiclePlate: ""
  });
  
  const [upcomingReservations, setUpcomingReservations] = useState<ReservationData[]>([]);
  const [liveReservations, setLiveReservations] = useState<ReservationData[]>([]);
  const [pastReservations, setPastReservations] = useState<ReservationData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
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
            setUserProfile({
              name: profile.name || '',
              email: user.email || '',
              vehiclePlate: profile.vehicle_plate || ''
            });
            
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
  
  return {
    userProfile,
    upcomingReservations,
    liveReservations,
    pastReservations,
    isLoading,
    handleLogout
  };
};

export default useProfile;

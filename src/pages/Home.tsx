import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ParkingGrid from '@/components/ParkingGrid';
import ReservationModal, { ReservationData } from '@/components/ReservationModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { parkingComplexes, fetchParkingSpots, addReservation } from '@/utils/parkingData';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Clock, Users, AlertTriangle, FileCode, MapPin, Calendar, ShieldCheck } from 'lucide-react';

const Home: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
  const [selectedComplex, setSelectedComplex] = useState<string>(parkingComplexes[0]);
  const [showParkingGrid, setShowParkingGrid] = useState<boolean>(false);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState<boolean>(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false);
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [parkingSpots, setParkingSpots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    if (showParkingGrid && selectedComplex) {
      // Fetch parking spots from Supabase when grid is shown
      const loadParkingSpots = async () => {
        setIsLoading(true);
        try {
          const spots = await fetchParkingSpots(selectedComplex);
          setParkingSpots(spots);
        } catch (error) {
          console.error('Error loading parking spots:', error);
          toast.error('Failed to load parking spots');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadParkingSpots();
    }
  }, [showParkingGrid, selectedComplex]);
  
  const handleComplexSelect = (value: string) => {
    setSelectedComplex(value);
    setShowParkingGrid(true);
  };
  
  const handleFindParking = () => {
    navigate('/reserve');
  };
  
  const handleRegisterClick = () => {
    navigate('/register');
  };
  
  const handleSpotClick = (spotId: string) => {
    if (!isLoggedIn) {
      toast.error("Please login to reserve a parking spot", {
        action: {
          label: "Login",
          onClick: () => navigate('/login')
        }
      });
      return;
    }
    
    setSelectedSpot(spotId);
    setIsReservationModalOpen(true);
  };
  
  const handleReservationConfirm = async (data: ReservationData) => {
    // Format the reservation data
    const formattedDate = data.date.toISOString().split('T')[0];
    
    // Create the reservation in Supabase
    const newReservation = await addReservation({
      userId: data.userId || '',
      parkingComplex: data.parkingComplex,
      spotId: data.spotId,
      vehiclePlate: data.vehiclePlate,
      date: formattedDate,
      time: data.time,
      duration: data.duration,
      status: 'live' // Since we're only allowing today's reservations, it's live
    });
    
    if (newReservation) {
      // Refresh the parking grid with updated data
      const spots = await fetchParkingSpots(selectedComplex);
      setParkingSpots(spots);
      
      // Store the formatted reservation for display in confirmation modal
      const displayReservation = {
        id: newReservation.id,
        spotId: data.spotId,
        parkingComplex: data.parkingComplex,
        vehiclePlate: data.vehiclePlate,
        date: data.date, // Pass the Date object to the confirmation modal
        time: data.time,
        duration: data.duration
      };
      
      setReservation(displayReservation);
      setIsReservationModalOpen(false);
      setIsConfirmationModalOpen(true);
    }
  };
  
  const features = [
    {
      icon: <Car className="h-10 w-10 text-primary" />,
      title: "Easy Reservations",
      description: "Find and reserve your parking spot in seconds with our intuitive interface."
    },
    {
      icon: <Clock className="h-10 w-10 text-primary" />,
      title: "Real-time Availability",
      description: "See parking availability updated in real-time to save you time and frustration."
    }
  ];
  
  return (
    <div className="min-h-screen">
      {/* Hero Section - Modernized */}
      <section className="min-h-[85vh] flex items-center relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0"></div>
        <div className="container mx-auto px-6 z-10 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in space-y-8">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm">
                <Car className="w-4 h-4 mr-2" /> Smart Parking Management
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">Smart Parking</span>
                <br />for Modern Cities
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl">
                A next-generation parking management system with real-time availability tracking.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  onClick={handleFindParking}
                  className="text-lg group relative overflow-hidden shadow-lg"
                >
                  <span className="relative z-10 flex items-center">
                    <MapPin className="mr-2 h-5 w-5" /> Find Parking
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
                {!isLoggedIn && (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={handleRegisterClick}
                    className="text-lg border-2 hover-lift"
                  >
                    <Users className="mr-2 h-5 w-5" /> Register Now
                  </Button>
                )}
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-lg"></div>
              <img 
                src="https://images.unsplash.com/photo-1604063165585-e17e9c3c3f0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="Smart Parking System" 
                className="rounded-2xl shadow-2xl object-cover w-full h-[500px] relative hover-lift card-glassmorphism"
              />
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                    <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Smart System</p>
                    <p className="text-xs text-muted-foreground">Prototype Version</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section - Modernized */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-primary font-medium">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold">Intelligent Parking Solutions</h2>
            <div className="h-1 w-20 bg-primary mx-auto"></div>
            <p className="text-xl text-muted-foreground mt-6">
              Our smart parking platform streamlines the parking experience with cutting-edge technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                <div className="absolute h-1 bg-gradient-to-r from-primary to-accent w-0 group-hover:w-full transition-all duration-500"></div>
                <CardContent className="p-8">
                  <div className="bg-primary/10 p-4 rounded-2xl inline-block mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground text-lg">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Prototype Information Section - Modernized */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
              <AlertTriangle className="w-4 h-4 mr-2" /> Development Prototype
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">System in Development</h2>
            <div className="h-1 w-20 bg-yellow-400 mx-auto"></div>
            <p className="text-xl text-muted-foreground mt-6">
              This parking management system is currently in prototype phase. The following features are under active development.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-dashed border-primary/30 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <FileCode className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">API Integration</h3>
                <p className="text-muted-foreground">
                  Backend API endpoints will connect here to provide real parking data.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-dashed border-primary/30 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">User Authentication</h3>
                <p className="text-muted-foreground">
                  Authentication system will be integrated to manage real user accounts.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-dashed border-primary/30 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Car className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Data Simulation</h3>
                <p className="text-muted-foreground">
                  Parking availability and reservations are currently simulated with mock data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Real-time Parking Availability Section - Modernized */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="text-primary font-medium">Live Demo</span>
              <h2 className="text-3xl md:text-4xl font-bold">Real-time Parking Availability</h2>
              <div className="h-1 w-20 bg-primary mx-auto"></div>
              <p className="text-xl text-muted-foreground mt-6">
                Explore our interactive parking map and see available spots in real-time.
              </p>
            </div>
            
            <Card className="border-none shadow-xl overflow-hidden">
              <CardContent className="p-8">
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-2">Select a Parking Complex</label>
                  <Select
                    value={selectedComplex}
                    onValueChange={handleComplexSelect}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a parking complex" />
                    </SelectTrigger>
                    <SelectContent>
                      {parkingComplexes.map((complex) => (
                        <SelectItem key={complex} value={complex}>
                          {complex}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {showParkingGrid && (
                  <div className="animate-fade-in border rounded-xl overflow-hidden p-4 bg-white dark:bg-gray-800">
                    {isLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <ParkingGrid 
                        spots={parkingSpots} 
                        onSpotClick={handleSpotClick} 
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section - Modernized */}
      <section className="py-24 bg-gradient-to-br from-primary/5 to-accent/5 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
              <Calendar className="w-4 h-4 mr-2" /> Start Today
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Ready to Transform Your Parking Experience?</h2>
            <p className="text-xl mb-8 text-muted-foreground">
              Join the next generation of smart parking management and simplify your parking routine.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                onClick={handleFindParking}
                className="text-lg group relative overflow-hidden shadow-lg"
              >
                <span className="relative z-10 flex items-center">
                  <Car className="mr-2" /> Find Parking Now
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Button>
              {!isLoggedIn && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate('/login')}
                  className="text-lg border-2 hover-lift"
                >
                  <Users className="mr-2" /> Login to Account
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Reservation Modal */}
      <ReservationModal 
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
        spotId={selectedSpot || ''}
        parkingComplex={selectedComplex}
        onConfirm={handleReservationConfirm}
      />
      
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        reservation={reservation}
      />
    </div>
  );
};

export default Home;

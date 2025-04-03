
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ParkingGrid from '@/components/ParkingGrid';
import ReservationModal, { ReservationData } from '@/components/ReservationModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { parkingComplexes, parkingData } from '@/utils/parkingData';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Clock, Users, AlertTriangle, FileCode, MapPin, Calendar, ShieldCheck, Wallet, Timer } from 'lucide-react';
import ParkingLottie from '@/components/animations/ParkingLottie';
import { parkingCarAnimation, smartParkingAnimation, parkingSearchAnimation } from '@/utils/lottieData';
import { cn } from '@/lib/utils';

const Home: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
  const [selectedComplex, setSelectedComplex] = useState<string>(parkingComplexes[0]);
  const [showParkingGrid, setShowParkingGrid] = useState<boolean>(false);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState<boolean>(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false);
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [scrolled, setScrolled] = useState(false);
  
  const navigate = useNavigate();
  
  // Handle scroll effect for animations
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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
  
  const handleReservationConfirm = (data: ReservationData) => {
    setReservation(data);
    setIsReservationModalOpen(false);
    setIsConfirmationModalOpen(true);
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
    },
    {
      icon: <Wallet className="h-10 w-10 text-primary" />,
      title: "Flexible Payment",
      description: "Multiple secure payment options for your convenience and peace of mind."
    },
    {
      icon: <Timer className="h-10 w-10 text-primary" />,
      title: "Time Management",
      description: "Set duration and receive notifications before your parking time expires."
    }
  ];
  
  return (
    <div className="min-h-screen">
      {/* Hero Section - Professional Modernized */}
      <section className="min-h-[85vh] flex items-center relative overflow-hidden bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>
        <div className="container mx-auto px-6 z-10 pt-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm">
                <Car className="w-4 h-4 mr-2" /> Professional Parking Solution
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Intelligent Parking</span>
                <br />Management System
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-xl">
                Streamline parking operations with our enterprise-grade management platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  onClick={handleFindParking}
                  className="text-lg group relative overflow-hidden shadow-lg transition-all duration-300 ease-out"
                >
                  <span className="relative z-10 flex items-center">
                    <MapPin className="mr-2 h-5 w-5" /> Find Parking
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleRegisterClick}
                  className="text-lg border-2 hover:bg-secondary/50 transition-all duration-300"
                >
                  <Users className="mr-2 h-5 w-5" /> Register Now
                </Button>
              </div>
            </div>
            <div className="hidden lg:block relative animate-fade-in">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-blue-600/20 rounded-3xl blur-lg"></div>
              <div className="relative h-[500px] w-full overflow-hidden rounded-2xl shadow-2xl card-glassmorphism">
                <ParkingLottie 
                  animationData={parkingCarAnimation} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                    <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-semibold">Enterprise System</p>
                    <p className="text-xs text-muted-foreground">Secure & Reliable</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section - Professional */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-primary font-medium">Enterprise Features</span>
            <h2 className="text-3xl md:text-4xl font-bold">Comprehensive Management Tools</h2>
            <div className="h-1 w-20 bg-primary mx-auto"></div>
            <p className="text-xl text-muted-foreground mt-6">
              Our platform offers advanced tools for parking facility operators and users.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={cn(
                  "border-none shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group",
                  "transform hover:-translate-y-2"
                )}
              >
                <div className="absolute h-1 bg-gradient-to-r from-primary to-blue-600 w-0 group-hover:w-full transition-all duration-500"></div>
                <CardContent className="p-8">
                  <div className="bg-primary/10 p-4 rounded-2xl inline-block mb-6 group-hover:bg-primary/20 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Animation Section - New */}
      <section className="py-24 bg-white dark:bg-gray-800 overflow-hidden relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="h-[400px] relative">
                <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/30 rounded-3xl -rotate-2"></div>
                <div className="absolute inset-0 bg-primary/10 rounded-3xl rotate-2"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <ParkingLottie 
                    animationData={smartParkingAnimation} 
                    className="w-4/5 h-4/5"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <span className="text-primary font-medium">Smart Technology</span>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Mobile-First Parking Experience
              </h2>
              <p className="text-xl text-muted-foreground">
                Our system is designed with a mobile-first approach, allowing users to find, 
                reserve and pay for parking directly from their smartphones.
              </p>
              <ul className="space-y-4">
                {[
                  "Real-time parking availability updates",
                  "Mobile payment integration",
                  "Navigation assistance to reserved spots",
                  "Digital receipts and parking history"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1 bg-green-100 dark:bg-green-900/50 p-1 rounded-full">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.3327 4.33334L5.99935 11.6667L2.66602 8.33334" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="mt-4 group"
                size="lg"
              >
                <span className="flex items-center">
                  Learn More 
                  <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </span>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Prototype Information Section - Professional */}
      <section className="py-24 bg-slate-100 dark:bg-slate-900/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 mr-2" /> Enterprise Preview
            </span>
            <h2 className="text-3xl md:text-4xl font-bold">System in Development</h2>
            <div className="h-1 w-20 bg-amber-400 mx-auto"></div>
            <p className="text-xl text-muted-foreground mt-6">
              This enterprise parking management solution is currently in active development. The following enterprise features are being implemented.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-dashed border-blue-400/30 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm transform hover:-translate-y-2 transition-transform duration-300">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
                  <FileCode className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold">Advanced API Integration</h3>
                <p className="text-muted-foreground">
                  Enterprise API endpoints with real-time data synchronization for facility operators.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-dashed border-blue-400/30 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm transform hover:-translate-y-2 transition-transform duration-300">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold">Enterprise Authentication</h3>
                <p className="text-muted-foreground">
                  Multi-level access control with role-based permissions for staff management.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-dashed border-blue-400/30 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm transform hover:-translate-y-2 transition-transform duration-300">
              <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
                  <Car className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold">Enterprise Analytics</h3>
                <p className="text-muted-foreground">
                  Comprehensive data insights with custom reporting for business optimization.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Real-time Parking Availability Section */}
      <section className="py-24 bg-white dark:bg-gray-800 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="text-primary font-medium">Interactive Demo</span>
              <h2 className="text-3xl md:text-4xl font-bold">Real-time Parking Availability</h2>
              <div className="h-1 w-20 bg-primary mx-auto"></div>
              <p className="text-xl text-muted-foreground mt-6">
                Experience our enterprise-grade parking visualization system below.
              </p>
            </div>
            
            <Card className="border-none shadow-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                  <div className="w-full md:w-1/2">
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
                  <div className="w-full md:w-1/2 h-40">
                    <ParkingLottie 
                      animationData={parkingSearchAnimation} 
                      className="w-full h-full"
                    />
                  </div>
                </div>
                
                {showParkingGrid && (
                  <div className="animate-fade-in border rounded-xl overflow-hidden p-4 bg-white dark:bg-slate-800">
                    <ParkingGrid 
                      spots={parkingData[selectedComplex as keyof typeof parkingData]} 
                      onSpotClick={handleSpotClick} 
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section - Professional */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 font-medium text-sm mb-6">
              <Calendar className="w-4 h-4 mr-2" /> Deploy Now
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Ready to Optimize Your Parking Operations?</h2>
            <p className="text-xl mb-8 text-muted-foreground">
              Join leading facilities using our enterprise parking management system to increase efficiency and customer satisfaction.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                size="lg" 
                onClick={handleFindParking}
                className="text-lg group relative overflow-hidden shadow-lg"
              >
                <span className="relative z-10 flex items-center">
                  <Car className="mr-2" /> Schedule Demo
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Button>
              {!isLoggedIn && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate('/login')}
                  className="text-lg border-2 hover:bg-secondary/50 transition-all duration-300"
                >
                  <Users className="mr-2" /> Enterprise Login
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

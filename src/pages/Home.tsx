
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ParkingGrid from '@/components/ParkingGrid';
import ReservationModal, { ReservationData } from '@/components/ReservationModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { parkingComplexes, parkingData } from '@/utils/parkingData';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Car, Clock, CreditCard, Shield, Star, Users } from 'lucide-react';

const Home: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
  const [selectedComplex, setSelectedComplex] = useState<string>(parkingComplexes[0]);
  const [showParkingGrid, setShowParkingGrid] = useState<boolean>(false);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState<boolean>(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState<boolean>(false);
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  
  const navigate = useNavigate();
  
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
      icon: <CreditCard className="h-10 w-10 text-primary" />,
      title: "Secure Payments",
      description: "Enjoy hassle-free, secure payment options for your reservations."
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "Guaranteed Spots",
      description: "Your reserved spot is guaranteed to be available when you arrive."
    }
  ];

  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Daily Commuter",
      comment: "This app has transformed my daily commute. No more circling blocks looking for parking!",
      rating: 5
    },
    {
      name: "Sarah Williams",
      role: "Business Traveler",
      comment: "As someone who travels for business, having guaranteed parking is invaluable. This service delivers exactly that.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "City Resident",
      comment: "Living downtown, parking was always a nightmare until I found this app. Now I can always find a spot near home.",
      rating: 4
    },
    {
      name: "Jessica Miller",
      role: "Event Planner",
      comment: "I recommend this to all my event attendees. It makes parking one less thing to worry about when planning events.",
      rating: 5
    }
  ];
  
  const stats = [
    { value: "50,000+", label: "Active Users" },
    { value: "200+", label: "Parking Locations" },
    { value: "99.9%", label: "Reservation Accuracy" },
    { value: "24/7", label: "Customer Support" }
  ];
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30 pt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Smart Parking, Smarter You
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
                Reserve your parking spot instantly with real-time availability.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={handleFindParking}
                  className="text-lg btn-hover-glow"
                >
                  Find Parking
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={handleRegisterClick}
                  className="text-lg hover-lift"
                >
                  Register Now
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src="https://images.unsplash.com/photo-1604063165585-e17e9c3c3f0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="Smart Parking System" 
                className="rounded-lg shadow-xl hover-lift card-glassmorphism"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Smart Features for Smart Drivers</h2>
            <p className="text-xl text-muted-foreground">Our intelligent parking system takes the stress out of finding and securing parking spots.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover-lift transition-all duration-300">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground">Join thousands of satisfied users who've simplified their parking experience.</p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <Card className="border-0 shadow-lg card-glassmorphism">
                        <CardContent className="p-6 flex flex-col h-full">
                          <div className="flex mb-4">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <p className="text-lg mb-4 flex-grow">{testimonial.comment}</p>
                          <div>
                            <p className="font-semibold">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex items-center justify-center mt-8">
                <CarouselPrevious className="relative static left-0 translate-y-0 mr-2" />
                <CarouselNext className="relative static right-0 translate-y-0 ml-2" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>
      
      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-br from-accent to-primary text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="p-6">
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Real-time Parking Availability Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-10 text-center">Real-time Parking Availability</h2>
            
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
              <div className="animate-fade-in">
                <ParkingGrid 
                  spots={parkingData[selectedComplex as keyof typeof parkingData]} 
                  onSpotClick={handleSpotClick} 
                />
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-background to-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Parking Experience?</h2>
            <p className="text-xl mb-8 text-muted-foreground">Join thousands of users who've simplified their parking routine.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={handleFindParking}
                className="text-lg btn-hover-glow"
              >
                <Car className="mr-2" /> Find Parking Now
              </Button>
              {!isLoggedIn && (
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => navigate('/login')}
                  className="text-lg hover-lift"
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


# Smart Parking System - Frontend Documentation

## Table of Contents
1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Key Components](#key-components)
4. [Data Flow](#data-flow)
5. [Frontend-Backend Integration Points](#frontend-backend-integration-points)
6. [Authentication Flow](#authentication-flow)
7. [Form Handling](#form-handling)
8. [State Management](#state-management)
9. [UI Components](#ui-components)
10. [Error Handling](#error-handling)
11. [Future Improvements](#future-improvements)

## Overview

The Smart Parking System is a web application built with React, TypeScript, Tailwind CSS, and shadcn/ui components. It allows users to view real-time parking availability, reserve parking spots, and manage their reservations.

The application uses a mock data system that would need to be replaced with actual API calls to a backend system. The current implementation simulates consistent parking spot statuses using deterministic algorithms to ensure the same spots show the same availability status across different pages of the application.

## Project Structure

The project follows a standard React application structure with Vite as the build tool:

```
src/
├── components/         # Reusable UI components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and helpers
├── pages/             # Page components representing routes
├── utils/             # Utility functions specific to business logic
├── App.tsx            # Main application component with routing
└── main.tsx           # Application entry point
```

## Key Components

### 1. ParkingSpot.tsx
This component renders an individual parking spot with visual indicators for its status (available, occupied, reserved).

```typescript
// Key props:
interface ParkingSpotProps {
  id: string;
  status: 'available' | 'occupied' | 'reserved';
  onClick?: () => void;
}
```

### 2. ParkingGrid.tsx
Displays a grid of parking spots and a legend explaining the color codes.

```typescript
// Key props:
interface ParkingGridProps {
  spots: ParkingSpotData[];
  onSpotClick: (spotId: string) => void;
}
```

### 3. ReservationModal.tsx
Modal form for users to enter reservation details when they select an available parking spot.

```typescript
// Key props:
interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  spotId: string;
  parkingComplex: string;
  onConfirm: (data: ReservationData) => void;
  vehiclePlate?: string;
}

// Reservation data structure:
export interface ReservationData {
  spotId: string;
  parkingComplex: string;
  vehiclePlate: string;
  date: Date;
  duration: string;
}
```

### 4. ConfirmationModal.tsx
Displays reservation details after a successful booking.

```typescript
// Key props:
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: ReservationData | null;
}
```

## Data Flow

The data flow in the application follows this pattern:

1. Mock data is defined in `parkingData.ts` which generates consistent parking spot statuses
2. The Home page and Reserve page both consume this data
3. When a user selects an available spot:
   - A modal opens to collect reservation details
   - On confirmation, reservation data is passed to a confirmation modal
   - In a real implementation, this data would be sent to a backend API

## Frontend-Backend Integration Points

The following areas need to be updated to integrate with a backend:

### 1. Parking Data (src/utils/parkingData.ts)
Currently uses mock data. Replace with API calls to fetch real-time parking data:

```typescript
// Current implementation (to be replaced):
export const parkingData = {
  'Demo Parking 1': generateParkingSpots(18, 1),
  'Demo Parking 2': generateParkingSpots(24, 2)
};

// Suggested backend endpoint structure:
// GET /api/parking-complexes - List all parking complexes
// GET /api/parking-complexes/{complexId}/spots - Get spots for a specific complex
```

### 2. Reservation Process (Home.tsx & Reserve.tsx)
Currently, the reservation data is only displayed but not persisted. Implement API calls to:

```typescript
// Required endpoints:
// POST /api/reservations - Create a new reservation
// GET /api/reservations - Get user's reservations
// DELETE /api/reservations/{id} - Cancel a reservation

// Example implementation for handling reservation submission:
const handleReservationConfirm = async (data: ReservationData) => {
  try {
    // Send reservation data to backend
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`, // Add authentication
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Reservation failed');
    }
    
    const result = await response.json();
    setReservation(result);
    setIsReservationModalOpen(false);
    setIsConfirmationModalOpen(true);
  } catch (error) {
    toast.error('Failed to create reservation');
  }
};
```

### 3. Authentication (App.tsx, Login.tsx, Register.tsx)
The application currently uses a simple boolean state for authentication. Implement JWT or session-based authentication:

```typescript
// Required endpoints:
// POST /api/auth/login - Authenticate user and return token
// POST /api/auth/register - Register new user
// GET /api/auth/me - Get current user info
// POST /api/auth/logout - Invalidate session/token
```

### 4. User Profile (Profile.tsx)
Implement API calls to fetch and update user profile information:

```typescript
// Required endpoints:
// GET /api/users/me - Get user profile
// PUT /api/users/me - Update user profile
// GET /api/users/me/reservations - Get user's reservations
```

## Authentication Flow

Current authentication flow is simulated. Backend implementation should:

1. Implement JWT or session-based authentication
2. Protect routes that require authentication
3. Store user tokens securely (HTTP-only cookies or localStorage with refresh token pattern)
4. Include authorization headers with API requests
5. Handle token expiration and refresh

## Form Handling

The application uses native React form handling with controlled components. Forms include:

1. Login form
2. Registration form
3. Reservation form
4. Contact form

Each form should include proper validation both on the client and server side:

```typescript
// Example validation logic for reservation form:
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!formData.vehiclePlate) {
    toast.error('Please enter your vehicle plate number');
    return;
  }
  
  if (!formData.date) {
    toast.error('Please select a date and time');
    return;
  }
  
  if (!formData.duration) {
    toast.error('Please select the duration');
    return;
  }
  
  onConfirm(formData as ReservationData);
};
```

## State Management

The application uses React's built-in state management with `useState` hooks. For more complex state needs:

1. Consider using React Context API for global state (authentication, user preferences)
2. Use Tanstack Query for data fetching and caching:

```typescript
// Example implementation using React Query:
const { data: parkingComplexes, isLoading } = useQuery({
  queryKey: ['parkingComplexes'],
  queryFn: () => fetch('/api/parking-complexes').then(res => res.json())
});
```

## UI Components

The application uses shadcn/ui components which are pre-styled with Tailwind CSS:

1. Button - For actions and navigation
2. Select - For dropdown menus
3. Dialog - For modal windows
4. Tooltip - For additional information on hover
5. Calendar - For date selection
6. Toast - For notifications

Custom styling is applied through Tailwind CSS utility classes:

```typescript
// Example of styled components:
<div className="card-glassmorphism rounded-lg p-6 animate-fade-in mb-8">
  {/* Component content */}
</div>
```

## Error Handling

Error handling should be implemented in the following areas:

1. API request errors (network issues, server errors)
2. Form validation errors
3. Authentication errors
4. Data loading errors

Example error handling with toast notifications:

```typescript
try {
  // API call or other operation
} catch (error) {
  toast.error('An error occurred', {
    description: error.message || 'Please try again later'
  });
}
```

## Future Improvements

1. Implement real-time updates for parking spot availability using WebSockets
2. Add payment processing integration
3. Implement a QR code system for parking access
4. Add admin dashboard for parking complex management
5. Implement analytics for usage patterns
6. Add mobile app support with push notifications for reservation reminders

## Backend API Schema

### Parking Complex

```typescript
interface ParkingComplex {
  id: string;
  name: string;
  address: string;
  totalSpots: number;
  availableSpots: number;
  rates: {
    hourly: number;
    daily: number;
  };
}
```

### Parking Spot

```typescript
interface ParkingSpot {
  id: string;
  complexId: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  type: 'standard' | 'handicapped' | 'electric' | 'compact';
  floor: number;
  section: string;
}
```

### Reservation

```typescript
interface Reservation {
  id: string;
  userId: string;
  spotId: string;
  complexId: string;
  vehiclePlate: string;
  startTime: string; // ISO date string
  endTime: string;   // ISO date string
  status: 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
```

### User

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  vehicles: {
    plate: string;
    make: string;
    model: string;
    color: string;
  }[];
  paymentMethods: {
    id: string;
    type: 'card' | 'paypal';
    lastFour?: string;
    expiryDate?: string;
  }[];
  createdAt: string;
}
```

## Conclusion

This documentation provides a comprehensive overview of the frontend implementation and guidance for backend integration. By following these guidelines, developers should be able to successfully implement a backend system that interfaces with this frontend application.

For specific technical questions, please refer to the codebase or contact the original development team.

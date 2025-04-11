
import React from 'react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
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

export default EmptyState;

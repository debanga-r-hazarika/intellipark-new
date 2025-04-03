
import React from 'react';
import Lottie from 'lottie-react';
import { cn } from '@/lib/utils';

interface ParkingLottieProps {
  animationData: any;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

const ParkingLottie: React.FC<ParkingLottieProps> = ({
  animationData,
  className,
  loop = true,
  autoplay = true,
}) => {
  return (
    <Lottie
      animationData={animationData}
      className={cn('w-full h-full', className)}
      loop={loop}
      autoplay={autoplay}
    />
  );
};

export default ParkingLottie;

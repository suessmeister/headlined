// FlippingTimer.tsx
import React from 'react';
import FlipNumbers from 'react-flip-numbers';

interface Props {
   remainingTime: number; // in seconds
}

const FlippingTimer: React.FC<Props> = ({ remainingTime }) => {
   const minutes = Math.floor(remainingTime / 60)
      .toString()
      .padStart(2, '0');
   const seconds = (remainingTime % 60).toString().padStart(2, '0');

   // slice off the first character of the minute string
   const displayMinutes = minutes.slice(1);

   return (
      <div
         style={{
            position: 'fixed',
            top: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 9999,
            mixBlendMode: 'difference',
            fontWeight: 'bold',
         }}
      >
         <FlipNumbers
            play
            height={50}
            width={32}
            color="#FFD700"
            background="transparent"
            // now only the second char of minutes + ":" + seconds
            numbers={`${displayMinutes}:${seconds}`}
            duration={0.6}
         />
      </div>
   );
};

export default FlippingTimer;

import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
   return (
      <div className="relative w-full h-screen">
         <Image
            src="/landing/landing_bg.png"
            alt="Headlined Platform"
            fill
            className="object-cover"
            priority
         />
      </div>
   );
} 
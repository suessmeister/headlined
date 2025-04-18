'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { UiLayout } from '@/components/ui/ui-layout'
import { useState } from 'react'
import sniperData from '../../../backend/guns_nft/data/snipers.json'
import Image from 'next/image'

export default function ArsenalPage() {
   const { publicKey } = useWallet()
   const [activeTab, setActiveTab] = useState<'available' | 'owned'>('available')

   return (
      <UiLayout links={[]}>
         <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-8">Your Arsenal</h1>
            {!publicKey ? (
               <div className="text-center p-8 bg-yellow-400/20 rounded-lg">
                  <p className="text-yellow-300 text-lg">
                     Connect your wallet to view your arsenal
                  </p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {sniperData.sniper.map((gun, index) => (
                     <div key={index} className="text-center">
                        <div className="relative h-[320px] w-[320px] mx-auto bg-green-900 rounded-lg">
                           <div className="absolute inset-2">
                              <Image
                                 src={`/rifles/${gun.name.toLowerCase().replace(/\s+/g, '_')}.png`}
                                 alt={gun.name}
                                 fill
                                 className="object-contain"
                              />
                           </div>
                        </div>
                        <h3 className="text-2xl font-black tracking-wider text-black uppercase mt-3">{gun.name}</h3>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </UiLayout>
   )
} 
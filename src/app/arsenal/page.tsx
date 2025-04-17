'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { UiLayout } from '@/components/ui/ui-layout'

export default function ArsenalPage() {
   const { publicKey } = useWallet()

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
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Arsenal items will be displayed here */}
               </div>
            )}
         </div>
      </UiLayout>
   )
} 
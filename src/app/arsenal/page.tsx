'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { UiLayout } from '@/components/ui/ui-layout'
import { useState, useRef, useEffect } from 'react'
import sniperData from '../../../backend/guns_nft/data/snipers.json'
import Image from 'next/image'
import arsenalQuotes from '../../../public/quotes/arsenal.json'

export default function ArsenalPage() {
   const { publicKey } = useWallet()
   const [activeTab, setActiveTab] = useState<'shop' | 'your-guns' | 'leaderboard'>('your-guns')
   const [sliderPosition, setSliderPosition] = useState(0)
   const tabsRef = useRef<HTMLDivElement>(null)
   const [randomQuote, setRandomQuote] = useState<{ quote: string, author: string } | null>(null)
   const [isRefreshing, setIsRefreshing] = useState(false)

   const getRandomQuote = () => {
      const quotes = arsenalQuotes.quotes
      const randomIndex = Math.floor(Math.random() * quotes.length)
      return quotes[randomIndex]
   }

   useEffect(() => {
      setRandomQuote(getRandomQuote())
   }, [])

   const handleRefresh = () => {
      setIsRefreshing(true)
      setTimeout(() => {
         setRandomQuote(getRandomQuote())
         setIsRefreshing(false)
      }, 200)
   }

   useEffect(() => {
      if (tabsRef.current) {
         const buttons = tabsRef.current.querySelectorAll('button')
         const activeButton = buttons[activeTab === 'shop' ? 0 : activeTab === 'your-guns' ? 1 : 2]
         const buttonRect = activeButton.getBoundingClientRect()
         const containerRect = tabsRef.current.getBoundingClientRect()
         const padding = 8 // 2px padding on each side
         setSliderPosition(buttonRect.left - containerRect.left - padding)
      }
   }, [activeTab])

   return (
      <UiLayout links={[]}>
         <div className="container mx-auto p-4">
            <div className="flex flex-col items-center mb-12">
               {randomQuote && (
                  <div className="flex items-center gap-2">
                     <h1 className={`font-bold mb-2 text-center text-green-800 bg-clip-text font-mono tracking-wider italic ${randomQuote.quote.length > 50 ? 'text-3xl' : 'text-4xl'
                        }`}>
                        &ldquo;{randomQuote.quote}&rdquo;
                     </h1>
                     <button
                        onClick={handleRefresh}
                        className="text-gray-500 hover:text-gray-400 transition-colors"
                     >
                        <svg
                           className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : ''}`}
                           fill="none"
                           stroke="currentColor"
                           viewBox="0 0 24 24"
                        >
                           <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                           />
                        </svg>
                     </button>
                  </div>
               )}
               {randomQuote && (
                  <p className="text-lg text-gray-400 italic mb-4">
                     - {randomQuote.author}
                  </p>
               )}
               <div className="h-1 w-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
            </div>

            <div className="relative flex justify-center mb-12">
               <div
                  ref={tabsRef}
                  className="relative flex bg-gray-800/50 rounded-xl p-2"
               >
                  <div
                     className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-800 rounded-xl transition-all duration-300"
                     style={{
                        width: 'calc(120px + 15px)',
                        transform: `translateX(${sliderPosition}px)`,
                     }}
                  />
                  <div className="flex space-x-2">
                     <button
                        onClick={() => setActiveTab('shop')}
                        className={`relative w-[120px] py-3 rounded-xl font-bold transition-all duration-300 z-10 ${activeTab === 'shop' ? 'text-white' : 'text-gray-400 hover:text-green-800'
                           }`}
                     >
                        Shop
                     </button>
                     <button
                        onClick={() => setActiveTab('your-guns')}
                        className={`relative w-[120px] py-3 rounded-xl font-bold transition-all duration-300 z-10 ${activeTab === 'your-guns' ? 'text-white' : 'text-gray-400 hover:text-green-800'
                           }`}
                     >
                        Your Guns
                     </button>
                     <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={`relative w-[120px] py-3 rounded-xl font-bold transition-all duration-300 z-10 ${activeTab === 'leaderboard' ? 'text-white' : 'text-gray-400 hover:text-green-800'
                           }`}
                     >
                        Leaderboard
                     </button>
                  </div>
               </div>
            </div>

            {!publicKey ? (
               <div className="text-center p-12 bg-gradient-to-br from-yellow-400/10 to-yellow-600/10 rounded-2xl border border-yellow-500/20">
                  <p className="text-yellow-300 text-xl font-medium">
                     Connect your wallet to view your arsenal
                  </p>
               </div>
            ) : (
               <>
                  {activeTab === 'shop' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sniperData.sniper.map((gun, index) => (
                           <div key={index} className="transform transition-all duration-300 hover:scale-105">
                              <div className="relative h-[450px] w-[350px] mx-auto bg-gradient-to-br from-green-900/90 to-green-800/90 rounded-2xl shadow-lg shadow-green-500/20 border-2 border-green-600/30">
                                 <div className="absolute inset-4">
                                    <Image
                                       src={`/rifles/${gun.name.toLowerCase().replace(/\s+/g, '_')}.png`}
                                       alt={gun.name}
                                       fill
                                       className="object-contain transition-transform duration-300 hover:scale-110"
                                    />
                                 </div>
                                 <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
                                    <h3 className="text-2xl font-bold text-white">{gun.name}</h3>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}

                  {activeTab === 'your-guns' && (
                     <div className="text-center p-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border-2 border-gray-700/50">
                        <p className="text-2xl text-gray-300 font-medium">
                           Your owned guns will appear here
                        </p>
                     </div>
                  )}

                  {activeTab === 'leaderboard' && (
                     <div className="text-center p-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border-2 border-gray-700/50">
                        <p className="text-2xl text-gray-300 font-medium">
                           Leaderboard coming soon
                        </p>
                     </div>
                  )}
               </>
            )}
         </div>
      </UiLayout>
   )
} 
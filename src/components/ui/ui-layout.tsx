'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import * as React from 'react'
import { ReactNode, Suspense, useEffect, useRef, useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { useWallet } from '@solana/wallet-adapter-react'

import { AccountChecker } from '../account/account-ui'
import { ClusterChecker, ClusterUiSelect, ExplorerLink } from '../cluster/cluster-ui'
import { WalletButton } from '@/components/solana/solana-provider'

export function UiLayout({ children, links }: { children: ReactNode; links: { label: string; path: string } [] }) {
  const pathname = usePathname()
  const isLandingPage = pathname === '/landing'
  const router = useRouter()
  const [showWelcome, setShowWelcome] = useState(false)
  const { disconnect } = useWallet()
  const [activeGun, setActiveGun] = useState<any>(null)
  const handleGetStarted = () => {
    setShowWelcome(true)
  }

  const handleEnterProgram = () => {
    setShowWelcome(false)
    router.push('/')
  }

  useEffect(() => {
    const savedGun = localStorage.getItem('selectedGun')
    if (savedGun) {
      setActiveGun(JSON.parse(savedGun))
    }
  }, [])

  return (
    <div className="h-full relative" style={{
      background: 'linear-gradient(to bottom, #87CEEB, #E0F7FA)',
      minHeight: '100vh'
    }}>
      {showWelcome ? (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h1 className="text-2xl mb-4">Welcome to Headlined!</h1>
            <p className="mb-4">Connect your wallet to get started.</p>
            <WalletButton />
          </div>
        </div>
      ) : (
        <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
          {!isLandingPage && (
            <>
              {pathname === '/arsenal' ? (
                <button onClick={() => router.push('/')} className="btn btn-sm bg-black text-white border-2 border-gray-700 hover:bg-gray-900 hover:border-gray-600">
                  Go Back
                </button>
              ) : (
                <Link href="/arsenal">
                  <button onClick={(e) => { e.stopPropagation(); }} className="btn btn-sm btn-arsenal bg-black text-white border-2 border-gray-700 hover:bg-gray-900 hover:border-gray-600">
                    Arsenal
                  </button>
                </Link>
              )}
              <button onClick={() => {
                disconnect();
                router.push('/landing');
              }} style={{ fontFamily: 'Quantico', fontSize: '18px', backgroundColor: 'transparent', color: 'black', border: 'none', cursor: 'pointer' }}>
                [Disconnect]
              </button>
            </>
          )}
          {isLandingPage && (
            <button onClick={handleGetStarted} className="font-bold text-black bg-transparent">
              [Get Started]
            </button>
          )}
        </div>
      )}
      <Suspense
        fallback={
          <div className="text-center my-32">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        }
      >
        {children}
      </Suspense>
      <Toaster position="bottom-right" />
    </div>
  )
}

export function AppModal({
  children,
  title,
  hide,
  show,
  submit,
  submitDisabled,
  submitLabel,
}: {
  children: ReactNode
  title: string
  hide: () => void
  show: boolean
  submit?: () => void
  submitDisabled?: boolean
  submitLabel?: string
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)

  useEffect(() => {
    if (!dialogRef.current) return
    if (show) {
      dialogRef.current.showModal()
    } else {
      dialogRef.current.close()
    }
  }, [show, dialogRef])

  return (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box space-y-5">
        <h3 className="font-bold text-lg">{title}</h3>
        {children}
        <div className="modal-action">
          <div className="join space-x-2">
            {submit ? (
              <button className="btn btn-xs lg:btn-md btn-primary" onClick={submit} disabled={submitDisabled}>
                {submitLabel || 'Save'}
              </button>
            ) : null}
            <button onClick={hide} className="btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
}

export function AppHero({
  children,
  title,
  subtitle,
}: {
  children?: ReactNode
  title: ReactNode
  subtitle: ReactNode
}) {
  return (
    <div className="hero py-[64px]">
      <div className="hero-content text-center">
        <div className="max-w-2xl">
          {typeof title === 'string' ? <h1 className="text-5xl font-bold">{title}</h1> : title}
          {typeof subtitle === 'string' ? <p className="py-6">{subtitle}</p> : subtitle}
          {children}
        </div>
      </div>
    </div>
  )
}

export function ellipsify(str = '', len = 4) {
  if (str.length > 30) {
    return str.substring(0, len) + '..' + str.substring(str.length - len, str.length)
  }
  return str
}

export function useTransactionToast() {
  return (signature: string) => {
    toast.success(
      <div className={'text-center'}>
        <div className="text-lg">Transaction sent</div>
        <ExplorerLink path={`tx/${signature}`} label={'View Transaction'} className="btn btn-xs btn-primary" />
      </div>,
    )
  }
}

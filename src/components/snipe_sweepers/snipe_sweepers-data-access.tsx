'use client'

import { getSnipeSweepersProgram, getSnipeSweepersProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useSnipeSweepersProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getSnipeSweepersProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getSnipeSweepersProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['snipe_sweepers', 'all', { cluster }],
    queryFn: () => program.account.snipe_sweepers.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['snipe_sweepers', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ snipe_sweepers: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useSnipeSweepersProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useSnipeSweepersProgram()

  const accountQuery = useQuery({
    queryKey: ['snipe_sweepers', 'fetch', { cluster, account }],
    queryFn: () => program.account.snipe_sweepers.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['snipe_sweepers', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ snipe_sweepers: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['snipe_sweepers', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ snipe_sweepers: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['snipe_sweepers', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ snipe_sweepers: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['snipe_sweepers', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ snipe_sweepers: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}

import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { SnipeSweepers } from '../target/types/snipe_sweepers'

describe('snipe_sweepers', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.SnipeSweepers as Program<SnipeSweepers>

  const snipe_sweepersKeypair = Keypair.generate()

  it('Initialize SnipeSweepers', async () => {
    await program.methods
      .initialize()
      .accounts({
        snipe_sweepers: snipe_sweepersKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([snipe_sweepersKeypair])
      .rpc()

    const currentCount = await program.account.snipe_sweepers.fetch(snipe_sweepersKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment SnipeSweepers', async () => {
    await program.methods.increment().accounts({ snipe_sweepers: snipe_sweepersKeypair.publicKey }).rpc()

    const currentCount = await program.account.snipe_sweepers.fetch(snipe_sweepersKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment SnipeSweepers Again', async () => {
    await program.methods.increment().accounts({ snipe_sweepers: snipe_sweepersKeypair.publicKey }).rpc()

    const currentCount = await program.account.snipe_sweepers.fetch(snipe_sweepersKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement SnipeSweepers', async () => {
    await program.methods.decrement().accounts({ snipe_sweepers: snipe_sweepersKeypair.publicKey }).rpc()

    const currentCount = await program.account.snipe_sweepers.fetch(snipe_sweepersKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set snipe_sweepers value', async () => {
    await program.methods.set(42).accounts({ snipe_sweepers: snipe_sweepersKeypair.publicKey }).rpc()

    const currentCount = await program.account.snipe_sweepers.fetch(snipe_sweepersKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the snipe_sweepers account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        snipe_sweepers: snipe_sweepersKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.snipe_sweepers.fetchNullable(snipe_sweepersKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})

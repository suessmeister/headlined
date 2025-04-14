#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod snipe_sweepers {
    use super::*;

  pub fn close(_ctx: Context<CloseSnipeSweepers>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.snipe_sweepers.count = ctx.accounts.snipe_sweepers.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.snipe_sweepers.count = ctx.accounts.snipe_sweepers.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeSnipeSweepers>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.snipe_sweepers.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeSnipeSweepers<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + SnipeSweepers::INIT_SPACE,
  payer = payer
  )]
  pub snipe_sweepers: Account<'info, SnipeSweepers>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseSnipeSweepers<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub snipe_sweepers: Account<'info, SnipeSweepers>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub snipe_sweepers: Account<'info, SnipeSweepers>,
}

#[account]
#[derive(InitSpace)]
pub struct SnipeSweepers {
  count: u8,
}

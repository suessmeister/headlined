use anchor_lang::prelude::*;

//For defining metadata account on metaplex
use mpl_token_metadata::{
    instructions::CreateMetadataAccountV3Builder,
    instructions::CreateMasterEditionV3Builder,
    types::DataV2,
    ID as MPL_METADATA_ID,
    instructions::BurnNftBuilder
};

// For sending the instruction 
use anchor_lang::solana_program::{
    program::invoke_signed,
    instruction::Instruction,
    system_program
};

use anchor_spl::token::{Token, ID as TOKEN_PROGRAM_ID};


declare_id!("6X7Dmx74WDrQtTRqaGZykdRvLh9LTCwR9WPQKtoJpNSE"); 

#[program]
pub mod pokemon {
    use super::*;

    pub fn mint(
        ctx: Context<MintNft>, 
        metadata_title: String, 
        metadata_symbol: String, 
        metadata_uri: String,

    ) -> Result<()> {
        let mint_key = ctx.accounts.mint.key();

        let (metadata_pda, _bump) = Pubkey::find_program_address(
        &[
            b"metadata",
            MPL_METADATA_ID.as_ref(),
            mint_key.as_ref(),
        ],
        &MPL_METADATA_ID,
    );

    let (master_edition_pda, _edition_bump) = Pubkey::find_program_address(
        &[
            b"metadata",
            MPL_METADATA_ID.as_ref(),
            mint_key.as_ref(),
            b"edition",
        ],
        &MPL_METADATA_ID,
    );
    
    let sniper_metadata = DataV2 {
        name: metadata_title,
        symbol: metadata_symbol,
        uri: metadata_uri,
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None,
    };

    let acc = ctx.accounts; //for readability
    let builder = CreateMetadataAccountV3Builder::new()
        .metadata(metadata_pda)
        .mint(acc.mint.key())
        .mint_authority(acc.payer.key())
        .update_authority(acc.payer.key(), true)
        .payer(acc.payer.key())
        .data(sniper_metadata)
        .is_mutable(true)
        .instruction();

    invoke_signed(
    &builder,
       &[
        acc.metadata.to_account_info(),
        acc.mint.to_account_info(),
        acc.payer.to_account_info(),
        acc.payer.to_account_info(), // update authority is also payer
        acc.system_program.to_account_info(),
        acc.rent.to_account_info(),
        acc.token_metadata_program.to_account_info(),
    ],
    &[], // no signer seeds? unless using PDA mint authority
)?;

let master_edition_ix = CreateMasterEditionV3Builder::new()
        .edition(master_edition_pda)
        .mint(acc.mint.key())
        .update_authority(acc.payer.key())
        .mint_authority(acc.payer.key())
        .payer(acc.payer.key())
        .metadata(metadata_pda)
        .max_supply(0)
        .instruction();

    invoke_signed(
        &master_edition_ix,
        &[
            acc.master_edition.to_account_info(),
            acc.mint.to_account_info(),
            acc.payer.to_account_info(),
            acc.payer.to_account_info(),
            acc.metadata.to_account_info(),
            acc.system_program.to_account_info(),
            acc.token_metadata_program.to_account_info(),
        ],
        &[],
    )?;



    Ok(())
    }


}
// do not delete the triple comments --- those are checks used by anchor
#[derive(Accounts)]
#[instruction(sniper_name: String)]
pub struct MintNft<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: mint
    #[account(mut)]
    pub mint: UncheckedAccount<'info>,

    /// CHECK: metadata account PDA - we'll derive it later
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,

    /// CHECK: Metaplex Token Metadata program
    pub token_metadata_program: UncheckedAccount<'info>,

    /// CHECK: Master Edition account PDA
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,

    /// CHECK: Metaplex!
    pub token_program: Program<'info, Token>,



}



#[derive(Accounts)]
#[instruction(sniper_name: String)]
pub struct BurnNft<'info> {
    #[account(mut)]
    pub authority: Signer<'info>, // NFT holder

    /// CHECK: NFT mint
    #[account(mut)]
    pub mint: UncheckedAccount<'info>,

    /// CHECK: NFT token account (owned by authority)
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,

    /// CHECK: Metadata PDA
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: Master edition PDA
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,

    /// CHECK: Metaplex Token Metadata Program
    pub token_metadata_program: UncheckedAccount<'info>,

    /// SPL Token Program
    pub token_program: Program<'info, Token>,

}


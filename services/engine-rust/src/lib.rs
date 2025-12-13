#![cfg(feature = "onchain")]

use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    clock::Clock,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    sysvar::Sysvar,
};
use thiserror::Error;

// Define the state of our program
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct DocumentAccount {
    pub document_hash: [u8; 32],
    pub status: DocumentStatus,
    pub signers: Vec<Pubkey>,
    pub signatures: Vec<Signature>,
    pub created_at: i64,        // Unix timestamp
    pub updated_at: i64,        // Unix timestamp
    pub creator: Pubkey,        // Who created this document
}

#[derive(BorshSerialize, BorshDeserialize, Debug, PartialEq)]
pub enum DocumentStatus {
    Pending,
    Signed,
    Completed,
    Cancelled,  // Added for session management - value 3
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Signature {
    pub signer: Pubkey,
    pub signature: [u8; 64],
    pub timestamp: i64,       // Unix timestamp when signature was added
}

// Define program errors
#[derive(Error, Debug)]
pub enum SignatrustError {
    #[error("Invalid Instruction")]
    InvalidInstruction,
    #[error("Not Rent Exempt")]
    NotRentExempt,
}

// Define the instructions our program can execute
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum SignatrustInstruction {
    CreateDocument {
        document_hash: [u8; 32],
        signers: Vec<Pubkey>,
    },
    SignDocument {
        signature: [u8; 64],
    },
    UpdateStatus {
        new_status: DocumentStatus,
    },
}

// Declare the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = SignatrustInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        SignatrustInstruction::CreateDocument { document_hash, signers } => {
            create_document(program_id, accounts, document_hash, signers)
        }
        SignatrustInstruction::SignDocument { signature } => {
            sign_document(accounts, signature)
        }
        SignatrustInstruction::UpdateStatus { new_status } => {
            update_status(accounts, new_status)
        }
    }
}

fn create_document(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    document_hash: [u8; 32],
    signers: Vec<Pubkey>,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let document_account = next_account_info(accounts_iter)?;
    let creator_account = next_account_info(accounts_iter)?;

    if document_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    if !creator_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Get current timestamp
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;

    let mut document_data = DocumentAccount {
        document_hash,
        status: DocumentStatus::Pending,
        signers,
        signatures: vec![],
        created_at: now,
        updated_at: now,
        creator: *creator_account.key,
    };

    document_data.serialize(&mut *document_account.data.borrow_mut())?;
    msg!("Document created successfully with hash: {:?}", document_hash);
    Ok(())
}

fn sign_document(accounts: &[AccountInfo], signature: [u8; 64]) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let document_account = next_account_info(accounts_iter)?;
    let signer = next_account_info(accounts_iter)?;

    if !signer.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Use deserialize with mutable slice reference to allow trailing bytes
    // (account buffer is larger than serialized data)
    // Note: Must drop the borrow before we can borrow_mut for serialize
    let mut document_data = {
        let data = document_account.data.borrow();
        let mut data_slice: &[u8] = &data[..];
        DocumentAccount::deserialize(&mut data_slice)
            .map_err(|_| ProgramError::InvalidAccountData)?
    };

    // Check if signer is authorized
    if !document_data.signers.contains(signer.key) {
        msg!("Signer not authorized for this document");
        return Err(ProgramError::InvalidAccountData);
    }

    // Check if signer has already signed
    if document_data.signatures.iter().any(|s| s.signer == *signer.key) {
        msg!("Signer has already signed this document");
        return Err(ProgramError::InvalidAccountData);
    }

    // Get current timestamp
    let clock = Clock::get()?;
    let now = clock.unix_timestamp;

    document_data.signatures.push(Signature {
        signer: *signer.key,
        signature,
        timestamp: now,
    });

    document_data.updated_at = now;

    // Update status based on signature count
    if document_data.signatures.len() == document_data.signers.len() {
        document_data.status = DocumentStatus::Completed;
        msg!("All signers have signed - document completed");
    } else {
        document_data.status = DocumentStatus::Signed;
        msg!("Document signed ({}/{})", document_data.signatures.len(), document_data.signers.len());
    }

    document_data.serialize(&mut *document_account.data.borrow_mut())?;
    msg!("Document signed successfully by {:?}", signer.key);
    Ok(())
}

fn update_status(accounts: &[AccountInfo], new_status: DocumentStatus) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let document_account = next_account_info(accounts_iter)?;
    let authority = next_account_info(accounts_iter)?;

    if !authority.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Use deserialize with mutable slice reference to allow trailing bytes
    // (account buffer is larger than serialized data)
    // Note: Must drop the borrow before we can borrow_mut for serialize
    let mut document_data = {
        let data = document_account.data.borrow();
        let mut data_slice: &[u8] = &data[..];
        DocumentAccount::deserialize(&mut data_slice)
            .map_err(|_| ProgramError::InvalidAccountData)?
    };

    // Only creator can update status
    if document_data.creator != *authority.key {
        msg!("Only document creator can update status");
        return Err(ProgramError::InvalidAccountData);
    }

    // Validate status transitions for cancellation
    if new_status == DocumentStatus::Cancelled {
        // Cannot cancel already completed documents
        if document_data.status == DocumentStatus::Completed {
            msg!("Cannot cancel a completed document");
            return Err(ProgramError::InvalidAccountData);
        }
        // Cannot cancel already cancelled documents
        if document_data.status == DocumentStatus::Cancelled {
            msg!("Document is already cancelled");
            return Err(ProgramError::InvalidAccountData);
        }
    }

    // Get current timestamp
    let clock = Clock::get()?;
    document_data.status = new_status;
    document_data.updated_at = clock.unix_timestamp;

    msg!("Document status updated successfully to {:?}", document_data.status);
    document_data.serialize(&mut *document_account.data.borrow_mut())?;
    Ok(())
}
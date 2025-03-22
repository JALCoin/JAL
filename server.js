// server.js
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const { 
  Connection, 
  clusterApiUrl, 
  Keypair, 
  LAMPORTS_PER_SOL, 
  PublicKey 
} = require('@solana/web3.js');
const { Token, TOKEN_PROGRAM_ID } = require('@solana/spl-token');

const app = express();
app.use(bodyParser.json());

// Load server's payer keypair from a file (e.g., key.txt or a JSON file)
// Make sure to keep this file secure and do not commit it to version control.
function loadKeypair(filePath) {
  const secretKeyString = fs.readFileSync(path.resolve(filePath), 'utf8');
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return Keypair.fromSecretKey(secretKey);
}

const SERVER_KEYPAIR_PATH = process.env.SERVER_KEYPAIR_PATH || './key.txt';
const payer = loadKeypair(SERVER_KEYPAIR_PATH);

// Function to create a mint account on Solana
async function createMintAccount(creatorPubKeyStr, decimals = 0) {
  try {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed'); // Change to 'mainnet-beta' in production
    const creatorPublicKey = new PublicKey(creatorPubKeyStr);

    const mint = await Token.createMint(
      connection,
      payer,
      creatorPublicKey,  // The creator is set as the mint authority.
      null,              // No freeze authority.
      decimals,          // Decimals (0 for non-fractional tokens)
      TOKEN_PROGRAM_ID
    );

    console.log('Mint created:', mint.publicKey.toBase58());
    return { mintPublicKey: mint.publicKey.toBase58(), connection };
  } catch (error) {
    console.error("Error creating mint account:", error);
    throw error;
  }
}

// Function to check if a mint account exists on-chain
async function checkMintExists(connection, mintPublicKeyStr) {
  try {
    const accountInfo = await connection.getAccountInfo(new PublicKey(mintPublicKeyStr));
    return accountInfo !== null;
  } catch (error) {
    console.error("Error checking mint account:", error);
    throw error;
  }
}

// Function to mint tokens for the Creator's mint account
async function mintTokensForCreator(connection, mintPublicKeyStr, creatorPubKeyStr, amount) {
  try {
    const mintPublicKey = new PublicKey(mintPublicKeyStr);
    const creatorPublicKey = new PublicKey(creatorPubKeyStr);

    // Create a Token object for the new mint
    const token = new Token(connection, mintPublicKey, TOKEN_PROGRAM_ID, payer);

    // Get or create the associated token account for the creator
    const associatedTokenAccount = await token.getOrCreateAssociatedTokenAccount(
      creatorPublicKey
    );

    // Mint tokens to the associated token account
    await token.mintTo(
      associatedTokenAccount.address,
      payer, // Mint authority
      [],
      amount
    );

    // Verify minted balance
    const accountInfo = await token.getAccountInfo(associatedTokenAccount.address);
    const balance = accountInfo.amount.toNumber();
    console.log('Minted tokens:', balance, 'to account:', associatedTokenAccount.address.toBase58());

    return { associatedTokenAccount: associatedTokenAccount.address.toBase58(), balance };
  } catch (error) {
    console.error("Error minting tokens:", error);
    throw error;
  }
}

// Express route for Creator signup with pre-check, mint account creation, and token minting
app.post('/signup-creator', async (req, res) => {
  try {
    // Extract form data from the request body
    const { displayName, tokenSymbol, password, creatorPublicKey, bio, email } = req.body;
    if (!displayName || !tokenSymbol || !password || !creatorPublicKey) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Hash the password for secure storage
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the mint account for the Creator's token
    const { mintPublicKey, connection } = await createMintAccount(creatorPublicKey, 0);

    // Pre-check: Verify that the mint account exists on-chain
    const exists = await checkMintExists(connection, mintPublicKey);
    if (!exists) {
      return res.status(500).json({ error: "Mint account creation failed on-chain" });
    }

    // Mint an initial supply of tokens (e.g., 1000 tokens)
    const initialSupply = 1000;
    const mintResult = await mintTokensForCreator(connection, mintPublicKey, creatorPublicKey, initialSupply);

    if (mintResult.balance < initialSupply) {
      return res.status(500).json({ error: "Minted token amount is less than expected" });
    }

    // Pseudocode: Save the Creator's data to your database
    // Example (using a placeholder function):
    // await saveCreatorData({ displayName, tokenSymbol, hashedPassword, bio, email, mintPublicKey, creatorPublicKey });

    console.log("Creator account data saved:", {
      displayName,
      tokenSymbol,
      mintPublicKey,
      creatorPublicKey,
      initialSupply: mintResult.balance
    });

    res.json({ success: true, mintPublicKey, mintedAmount: mintResult.balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

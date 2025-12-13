import { Request, Response, NextFunction } from 'express';
import { ZKProofService } from '../services/ZKProofService.js';
import { config } from '../config/config.js';

const zkProofService = new ZKProofService();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  console.log('Entering authMiddleware');
  console.log('Received headers:', req.headers);

  const zkProof = req.header('ZK-Proof');
  const publicSignals = req.header('Public-Signals');
  const challenge = req.header('Challenge');

  console.log('Extracted authentication data:');
  console.log('ZK-Proof:', zkProof);
  console.log('Public-Signals:', publicSignals);
  console.log('Challenge:', challenge);

  if (!zkProof || !publicSignals || !challenge) {
    console.log('Missing required headers');
    return res.status(401).json({ error: 'Missing ZK-Proof, Public-Signals, or Challenge' });
  }

  try {
    console.log('Attempting to verify proof');
    const isValid = await zkProofService.verifyAuthProof(
      JSON.parse(zkProof),
      JSON.parse(publicSignals),
      challenge
    );

    console.log('Proof verification result:', isValid);

    if (isValid) {
      console.log('Authentication successful in authMiddleware');
      // Extract the DID from the publicSignals
      const did = extractDIDFromPublicSignals(JSON.parse(publicSignals));
      // Attach user information to the request
      (req as any).user = { did };
      console.log('User information attached to request:', (req as any).user);
      next();
    } else {
      console.log('Invalid ZK-Proof');
      res.status(401).json({ error: 'Invalid ZK-Proof' });
    }
  } catch (err) {
    console.error('Error verifying ZK-Proof:', err);
    res.status(401).json({ error: 'Error verifying ZK-Proof' });
  }
  console.log('Exiting authMiddleware');
};

// Helper function to extract DID from publicSignals
function extractDIDFromPublicSignals(publicSignals: string[]): string {
  // Implement the logic to extract the DID from publicSignals
  // This will depend on how your ZK-Proof is structured
  // For example, if the DID is the first element in publicSignals:
  return `did:sol:${publicSignals[0]}`;
}
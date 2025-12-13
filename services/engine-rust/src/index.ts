import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import identityRoutes from './routes/identityRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiterMiddleware } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';
import { config } from './config/config.js';
import { SolanaDIDService } from './services/SolanaDIDService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

const corsOptions = {
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'ZK-Proof', 
    'Public-Signals', 
    'Challenge'
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Serve circuit files
const circuitsPath = path.join(__dirname, 'circuits');
console.log('Circuits path:', circuitsPath);
app.use('/circuits', (req, res, next) => {
    // Add CORS headers explicitly for this route
    res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
  const filePath = path.join(circuitsPath, req.url);
  console.log('Accessing circuit file:', req.url);
  console.log('Full path:', filePath);
  console.log('File exists:', fs.existsSync(filePath));
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('File not found:', filePath);
      console.error('File access error:', err);
      return res.status(404).send('File not found');
    }

    console.log('File accessible, attempting to send');
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        return res.status(500).send('Error serving file');
      }
      console.log('File sent successfully:', req.url);
    });
  });
});

app.use((req, res, next) => {
  logger.info(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  logger.info('Request headers:', req.headers);
  next();
});

app.use(rateLimiterMiddleware);

const solanaDIDService = new SolanaDIDService(config.solana.rpcUrl, config.solana.programId);

app.use('/api/identity', identityRoutes);
//app.use('/api/signature', signatureRoutes);
app.use('/api/document', documentRoutes);
//app.use('/health', healthRoutes);

app.post('/api/identity/create', async (req, res) => {
  try {
    if (config.solana.payerKeypair) {
      const identity = await solanaDIDService.createDID(config.solana.payerKeypair);
      res.status(201).json({ did: identity.did, publicKey: identity.publicKey });
    } else {
      logger.error('Payer keypair is not available');
      res.status(500).json({ error: 'Payer keypair is not available' });
    }
  } catch (error) {
    logger.error('Error creating identity [Solana Blockchain]:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

app.use(errorHandler);

function startServer(port: number) {
  app.listen(port)
    .on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        logger.warn(`Port ${port} is in use, trying ${port + 1}`);
        startServer(port + 1);
      } else {
        logger.error('Server error:', err);
        process.exit(1);
      }
    })
    .on('listening', () => {
      logger.info(`Server is running on port ${port}`);
    });
}

startServer(port);

process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

console.log('Current working directory:', process.cwd());
console.log('Contents of current directory:', fs.readdirSync(process.cwd()));
console.log('Contents of circuits directory:', fs.readdirSync(path.join(process.cwd(), 'circuits')));
console.log('Attempting to load WASM from:', path.resolve(this.circuitWasmPath));

export default app;
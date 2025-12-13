import { Express } from 'express-serve-static-core';

declare global {
  namespace Express {
    interface Request {
      user?: {
        did: string;
        // Add any other properties that might be present on the user object
      };
    }
  }
}
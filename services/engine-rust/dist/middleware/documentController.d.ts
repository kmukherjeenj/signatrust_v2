import { Request, Response } from 'express';
import { Document } from '../types/document.js';
interface AuthenticatedRequest extends Request {
    user?: {
        did: string;
        cloudStorage?: string;
    };
}
export declare const uploadDocument: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getDocument: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createSignatureRequest: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const signDocument: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyDocument: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getDocuments: (userDid: string) => Promise<Document[]>;
export declare const getDocumentStatus: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getPendingSignatures: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSignedDocument: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export {};

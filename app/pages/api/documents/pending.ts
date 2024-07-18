import { NextApiRequest, NextApiResponse } from 'next';
import { Document } from '../../../shared/types';

// This is a mock implementation. Replace with actual database operations.
let documents: Document[] = [
  { id: '1', name: 'Document 1', status: 'pending', date: '2023-07-20' },
  { id: '2', name: 'Document 2', status: 'signed', date: '2023-07-19' },
  { id: '3', name: 'Document 3', status: 'pending', date: '2023-07-18' },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const pendingDocuments = documents.filter(doc => doc.status === 'pending');
    res.status(200).json(pendingDocuments);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
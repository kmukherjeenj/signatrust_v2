import { NextApiRequest, NextApiResponse } from 'next';
import { Document } from '../../../../shared/types';

// This is a mock implementation. Replace with actual database operations.
let documents: Document[] = [
  { id: '1', name: 'Document 1', status: 'pending', date: '2023-07-20' },
  { id: '2', name: 'Document 2', status: 'signed', date: '2023-07-19' },
  { id: '3', name: 'Document 3', status: 'pending', date: '2023-07-18' },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { documentId } = req.query;
    const document = documents.find(doc => doc.id === documentId);
    
    if (document) {
      res.status(200).json(document);
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } else if (req.method === 'PUT') {
    const { documentId } = req.query;
    const updatedDocument = req.body;
    
    const index = documents.findIndex(doc => doc.id === documentId);
    
    if (index !== -1) {
      documents[index] = { ...documents[index], ...updatedDocument };
      res.status(200).json(documents[index]);
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } else if (req.method === 'DELETE') {
    const { documentId } = req.query;
    
    const index = documents.findIndex(doc => doc.id === documentId);
    
    if (index !== -1) {
      const deletedDocument = documents.splice(index, 1)[0];
      res.status(200).json(deletedDocument);
    } else {
      res.status(404).json({ message: 'Document not found' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
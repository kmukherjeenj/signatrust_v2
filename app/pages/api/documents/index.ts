import { NextApiRequest, NextApiResponse } from 'next';
import { Document } from '../../../shared/types';

// This is a mock implementation. Replace with actual database operations.
let documents: Document[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(documents);
  } else if (req.method === 'POST') {
    const { name } = req.body;
    const newDocument: Document = {
      id: (documents.length + 1).toString(),
      name,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    };
    documents.push(newDocument);
    res.status(201).json(newDocument);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
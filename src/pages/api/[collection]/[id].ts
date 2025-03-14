import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { findById } from '@/server/mongoService';

export default async function handler(
  req: ExpressRequest,
  res: ExpressResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { collection, id } = req.query;

  try {
    const result = await findById(
      collection as string,
      id as string
    );
    if (!result) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
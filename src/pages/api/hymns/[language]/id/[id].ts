
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { getHymnById } from '@/server/mongoService';
import type { Language } from '@/types/hymn';

export default async function handler(
  req: ExpressRequest,
  res: ExpressResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { language, id } = req.query;

  if (!language || Array.isArray(language) || !id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  try {
    const hymn = await getHymnById(language as Language, id.toString());
    if (!hymn) {
      return res.status(404).json({ error: 'Hymn not found' });
    }
    res.status(200).json(hymn);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

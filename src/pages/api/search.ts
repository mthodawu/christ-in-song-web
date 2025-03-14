
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { searchHymns } from '@/server/mongoService';
import type { Language } from '@/types/hymn';

export default async function handler(
  req: ExpressRequest,
  res: ExpressResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, language } = req.query;

  if (!query || Array.isArray(query) || !language || Array.isArray(language)) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  try {
    const results = await searchHymns(language as Language, query as string);
    res.status(200).json(results);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

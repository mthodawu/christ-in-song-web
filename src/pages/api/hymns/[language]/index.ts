
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { getHymnsByLanguage, saveHymn } from '@/server/mongoService';
import type { Language } from '@/types/hymn';

export default async function handler(
  req: ExpressRequest,
  res: ExpressResponse
) {
  const { language } = req.query;

  if (!language || Array.isArray(language)) {
    return res.status(400).json({ error: 'Invalid language parameter' });
  }

  try {
    if (req.method === 'GET') {
      const hymns = await getHymnsByLanguage(language as Language);
      res.status(200).json(hymns);
    } else if (req.method === 'POST') {
      const hymn = req.body;
      await saveHymn(language as Language, hymn);
      res.status(200).json({ message: 'Hymn saved successfully' });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

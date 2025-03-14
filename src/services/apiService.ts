
import type { Document } from 'mongodb';
import serviceConfig from './serviceConfig';
import mockData from '../mockData/hymnsData';
import { Language } from '@/types/hymn';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const apiService = {
  async findOne(collection: string, id: string): Promise<Document | null> {
    if (serviceConfig.useMockData) {
      console.log('Using mock data for findOne', { collection, id });
      // Mock implementation
      if (collection.includes('hymns_')) {
        const language = collection.replace('hymns_', '') as Language;
        return mockData.getMockHymnById(language, id) as unknown as Document;
      }
      return null;
    }
    
    try {
      const response = await fetch(`/api/${collection}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Network response was not ok');
      }
      return response.json();
    } catch (error) {
      console.error('API findOne error:', error);
      return null;
    }
  },
  
  async fetchData<T>(endpoint: string): Promise<ApiResponse<T>> {
    if (serviceConfig.useMockData) {
      console.log('Using mock data for', endpoint);
      
      // Handle different endpoints with mock data
      if (endpoint.startsWith('hymns/')) {
        const parts = endpoint.split('/');
        const language = parts[1] as Language;
        
        if (parts.length === 2) {
          // Get all hymns for language
          const hymns = mockData.getMockHymnsByLanguage(language);
          return { data: hymns as unknown as T };
        } else if (parts.length === 3) {
          // Get hymn by number
          const number = parts[2];
          const hymn = mockData.getMockHymnByNumber(language, number);
          return hymn ? { data: hymn as unknown as T } : { error: 'Hymn not found' };
        } else if (parts.length === 4 && parts[2] === 'id') {
          // Get hymn by id
          const id = parts[3];
          const hymn = mockData.getMockHymnById(language, id);
          return hymn ? { data: hymn as unknown as T } : { error: 'Hymn not found' };
        }
      } else if (endpoint.startsWith('search')) {
        // Handle search endpoint
        const url = new URL(`http://example.com/${endpoint}`);
        const query = url.searchParams.get('query') || '';
        const language = url.searchParams.get('language') as Language || 'english';
        const results = mockData.searchMockHymns(language, query);
        return { data: results as unknown as T };
      }
      
      return { error: 'Endpoint not supported in mock mode' };
    }
    
    try {
      const response = await fetch(`/api/${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
};

const API_BASE_URL = '/api';

export async function fetchFromCollection(collection: string, id: string) {
  const response = await fetch(`${API_BASE_URL}/${collection}/${id}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function getAllFromCollection(collection: string) {
  const response = await fetch(`${API_BASE_URL}/${collection}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

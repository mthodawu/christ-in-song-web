
import type { Document } from 'mongodb';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export const apiService = {
  async findOne(collection: string, id: string): Promise<Document | null> {
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

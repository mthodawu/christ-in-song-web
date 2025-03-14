
import { MongoClient, Db } from 'mongodb';
import { toast } from 'sonner';

// MongoDB connection instance
let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Initialize MongoDB connection
 */
export const initMongoDB = async (connectionString: string): Promise<void> => {
  try {
    if (client) return; // Already connected

    // Create a MongoDB client
    client = new MongoClient(connectionString);
    
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get the database (we'll use 'hymns_db')
    db = client.db('hymns_db');
    
    toast.success('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    toast.error('Failed to connect to MongoDB');
    throw error;
  }
};

/**
 * Get the MongoDB database instance
 */
export const getDb = (): Db => {
  if (!db) throw new Error('MongoDB not initialized');
  return db;
};

/**
 * Close MongoDB connection
 */
export const closeMongoDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
};

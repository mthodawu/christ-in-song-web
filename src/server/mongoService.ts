
import { MongoClient, Db, Collection, ObjectId } from "mongodb";
import { Language } from "@/types/hymn";

let client: MongoClient | null = null;
let db: Db | null = null;

export const HYMNS_COLLECTION_PREFIX = "hymns_";

export const initMongoDB = async (connectionString: string): Promise<void> => {
  try {
    if (client) return;
    client = new MongoClient(connectionString);
    await client.connect();
    db = client.db("hymns_db");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
};

export const getDb = (): Db => {
  if (!db) throw new Error("MongoDB not initialized");
  return db;
};

export const closeMongoDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
};

export function findById(collection: string, id: string) {
  const db = getDb();
  try {
    // Try to convert to ObjectId if it looks like a MongoDB ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      return db.collection(collection).findOne({ _id: new ObjectId(id) });
    } else {
      // If not a valid ObjectId format, search by string ID
      return db.collection(collection).findOne({ _id: new ObjectId(id) });
    }
  } catch (error) {
    console.error("Error finding by ID:", error);
    // Fallback to string ID
    return db.collection(collection).findOne({ _id: new ObjectId(id) });
  }
}

export const getHymnsCollection = (language: Language): Collection => {
  return getDb().collection(`${HYMNS_COLLECTION_PREFIX}${language}`);
};

export const getHymnsByLanguage = async (language: Language) => {
  const collection = getHymnsCollection(language);
  return collection.find({}).toArray();
};

export const getHymnById = async (language: Language, id: string) => {
  const collection = getHymnsCollection(language);
  try {
    // Try to convert to ObjectId if it looks like a MongoDB ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      return collection.findOne({ _id: new ObjectId(id) });
    } else {
      // If not a valid ObjectId format, search by string ID
      return collection.findOne({ _id: new ObjectId(id) });
    }
  } catch (error) {
    console.error("Error finding hymn by ID:", error);
    // Fallback to string ID
    return collection.findOne({ _id: new ObjectId(id) });
  }
};

export const getHymnByNumber = async (language: Language, number: string) => {
  const collection = getHymnsCollection(language);
  return collection.findOne({ number: number });
};

export const searchHymns = async (language: Language, query: string) => {
  const collection = getHymnsCollection(language);
  return collection.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { markdown: { $regex: query, $options: 'i' } },
      { number: { $regex: query, $options: 'i' } }
    ]
  }).toArray();
};

export const saveHymn = async (language: Language, hymn: any) => {
  const collection = getHymnsCollection(language);
  const { _id, ...hymnWithoutId } = hymn;
  
  if (_id) {
    // Update existing hymn
    await collection.updateOne(
      { _id: _id },
      { $set: hymnWithoutId }
    );
    return { ...hymn, _id };
  } else {
    // Insert new hymn
    const id = `${language.toLowerCase()}-${hymn.number}`;
    const result = await collection.insertOne({
      ...hymnWithoutId,
      _id: id,
      id: id
    });
    return { ...hymn, _id: result.insertedId };
  }
};

export const setupCollections = async (
  languages: Language[]
): Promise<void> => {
  const db = getDb();

  // Check if collections already exist
  const collections = await db.listCollections().toArray();
  const existingCollections = collections.map((c) => c.name);

  for (const language of languages) {
    const collectionName = `${HYMNS_COLLECTION_PREFIX}${language}`;

    // Skip if collection already exists
    if (existingCollections.includes(collectionName)) {
      continue;
    }

    // Create collection for this language
    await db.createCollection(collectionName);

    // Load initial data from JSON
    try {
      const response = await fetch(`/data/${language.toLowerCase()}.json`);
      const hymns = await response.json();

      // Insert initial data with proper MongoDB _id
      const formattedHymns = hymns.map((hymn: any) => {
        const id = hymn.id || `${language.toLowerCase()}-${hymn.number}`;
        return {
          _id: id,
          id: id,
          number: hymn.number,
          title: hymn.title,
          markdown: hymn.markdown,
        };
      });

      // Insert data if there are hymns
      if (formattedHymns.length > 0) {
        await getHymnsCollection(language).insertMany(formattedHymns);
        console.log(`Loaded ${formattedHymns.length} hymns for ${language}`);
      }
    } catch (error) {
      console.error(`Failed to load initial data for ${language}:`, error);
    }
  }
};

export default {
  initMongoDB,
  closeMongoDB,
  findById,
  getHymnsByLanguage,
  getHymnById,
  getHymnByNumber,
  searchHymns,
  saveHymn,
  setupCollections
};

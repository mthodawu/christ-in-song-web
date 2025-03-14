import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

export async function connectDB() {
  if (!client.connect()) {
    await client.connect();
  }
  return client.db();
}

export async function findById(collection: string, id: string) {
  const db = await connectDB();
  return db.collection(collection).findOne({ _id: new ObjectId(id) });
}
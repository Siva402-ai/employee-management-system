// lib/mongodb.ts
import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const options = {};

if (!uri) {
  throw new Error("Please add MONGODB_URI to your .env.local");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Use global to avoid hot-reload issues in dev
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Get the MongoDB database
 */
export async function getDB(): Promise<Db> {
  const client = await clientPromise;
  return client.db("emsdb"); // ✅ your database name
}

/**
 * Helper: convert MongoDB docs to plain objects
 */
export function docToObj<T extends { _id?: any }>(doc: T) {
  if (!doc) return null;
  const { _id, ...rest } = doc as any;
  // Include both `id` (legacy string id) and `_id` string to preserve
  // compatibility for clients that expect either field.
  return { id: _id?.toString(), _id: _id?.toString(), ...rest } as any;
}

export default clientPromise;

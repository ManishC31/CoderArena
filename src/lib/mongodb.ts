import "server-only";
import { MongoClient } from "mongodb";

// Reuse one client across hot reloads in dev so we don't open a new pool on every change.
const globalForMongo = globalThis as unknown as { mongoClient?: MongoClient };

function createMongoClient() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  return new MongoClient(uri);
}

// The driver connects lazily on the first operation, so no explicit connect() is needed.
export const mongoClient = globalForMongo.mongoClient ?? createMongoClient();

if (process.env.NODE_ENV !== "production") globalForMongo.mongoClient = mongoClient;

// Database named in MONGODB_URI (e.g. mongodb://localhost:27017/coderarena).
export const mongo = mongoClient.db();

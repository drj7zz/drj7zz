import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000
};

let client;
let clientPromise;

if (uri && !uri.includes('<username>') && !uri.includes('<password>')) {
  try {
    if (process.env.NODE_ENV === 'development') {
      if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
      }
      clientPromise = global._mongoClientPromise;
    } else {
      client = new MongoClient(uri, options);
      clientPromise = client.connect();
    }
  } catch (err) {
    console.warn('MongoDB client initialization failed:', err.message);
    clientPromise = null;
  }
} else {
  clientPromise = null;
}

export async function getDatabase(dbName = 'kaalyug_portfolio') {
  if (!clientPromise) {
    return null;
  }
  try {
    const connectedClient = await clientPromise;
    return connectedClient.db(dbName);
  } catch (err) {
    console.warn('MongoDB connection unavailable (falling back to seed data):', err.message);
    return null;
  }
}

export default clientPromise;

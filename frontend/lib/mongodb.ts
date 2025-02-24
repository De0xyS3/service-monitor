import { MongoClient } from 'mongodb';

if (!process.env.MONGO_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGO_URI"');
}

const uri = process.env.MONGO_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // En modo desarrollo, utiliza una variable global para preservar la conexión en caso de recarga por HMR (Hot Module Replacement)
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En producción, no es necesario usar una variable global.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;


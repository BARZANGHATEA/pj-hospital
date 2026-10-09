import mongoose from "mongoose"

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Reuse the connection across hot reloads in development and across
// invocations of the same server instance in production.
const globalForMongoose = globalThis as unknown as { mongoose?: MongooseCache }
const cache: MongooseCache = globalForMongoose.mongoose ?? { conn: null, promise: null }
globalForMongoose.mongoose = cache

export async function connectDB() {
  if (cache.conn) return cache.conn

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local (see .env.example).")
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, { bufferCommands: false })
  }

  try {
    cache.conn = await cache.promise
  } catch (error) {
    cache.promise = null
    throw error
  }
  return cache.conn
}

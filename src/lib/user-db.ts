import { MongoClient, ObjectId, Db } from 'mongodb'

// User interface
export interface User {
  _id?: ObjectId
  id?: string
  email: string
  password: string
  name: string
  phone?: string | null
  company?: string | null
  avatar?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// MongoDB client singleton
let client: MongoClient | null = null
let db: Db | null = null

async function getDatabase(): Promise<Db> {
  if (db) return db

  const uri = process.env.DATABASE_URL
  if (!uri) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  client = new MongoClient(uri)
  await client.connect()

  // Extract database name from URI
  const dbName = uri.split('/').pop()?.split('?')[0] || 'z360virtualtours'
  db = client.db(dbName)

  return db
}

// Find user by email (case-insensitive)
export async function findUserByEmail(email: string): Promise<User | null> {
  const database = await getDatabase()
  const users = database.collection<User>('User')

  const user = await users.findOne({
    email: { $regex: new RegExp(`^${email}$`, 'i') }
  })

  if (user) {
    return {
      ...user,
      id: user._id?.toString()
    }
  }

  return null
}

// Find user by ID
export async function findUserById(id: string): Promise<User | null> {
  const database = await getDatabase()
  const users = database.collection<User>('User')

  try {
    const user = await users.findOne({ _id: new ObjectId(id) })

    if (user) {
      return {
        ...user,
        id: user._id?.toString()
      }
    }
  } catch {
    // Invalid ObjectId format
  }

  return null
}

// Create new user
export async function createUser(userData: {
  email: string
  password: string
  name: string
  phone?: string | null
  company?: string | null
}): Promise<User> {
  const database = await getDatabase()
  const users = database.collection<User>('User')

  const now = new Date()
  const newUser: Omit<User, '_id' | 'id'> = {
    email: userData.email.toLowerCase(),
    password: userData.password,
    name: userData.name,
    phone: userData.phone || null,
    company: userData.company || null,
    avatar: null,
    isActive: true,
    createdAt: now,
    updatedAt: now
  }

  const result = await users.insertOne(newUser as User)

  return {
    ...newUser,
    _id: result.insertedId,
    id: result.insertedId.toString()
  }
}

// Update user
export async function updateUser(
  id: string,
  updates: Partial<Pick<User, 'name' | 'phone' | 'company' | 'avatar' | 'password'>>
): Promise<User | null> {
  const database = await getDatabase()
  const users = database.collection<User>('User')

  try {
    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    )

    if (result) {
      return {
        ...result,
        id: result._id?.toString()
      }
    }
  } catch {
    // Invalid ObjectId format
  }

  return null
}

// Get user's bookings
export async function getUserBookings(userId: string) {
  const database = await getDatabase()
  const bookings = database.collection('Booking')

  try {
    const userBookings = await bookings
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray()

    return userBookings.map(b => ({
      ...b,
      id: b._id?.toString(),
      userId: b.userId?.toString()
    }))
  } catch {
    return []
  }
}

// Get single booking with ownership check
export async function getUserBooking(bookingId: string, userId: string) {
  const database = await getDatabase()
  const bookings = database.collection('Booking')

  try {
    const booking = await bookings.findOne({
      _id: new ObjectId(bookingId),
      userId: new ObjectId(userId)
    })

    if (booking) {
      return {
        ...booking,
        id: booking._id?.toString(),
        userId: booking.userId?.toString()
      }
    }
  } catch {
    // Invalid ObjectId format
  }

  return null
}

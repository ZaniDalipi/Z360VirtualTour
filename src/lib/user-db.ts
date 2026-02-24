import { MongoClient, ObjectId, Db } from 'mongodb'

// User interface for database storage
export interface UserDocument {
  _id?: ObjectId
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

// User interface for API responses (with guaranteed id)
export interface User {
  id: string
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
  const users = database.collection<UserDocument>('User')

  const user = await users.findOne({
    email: { $regex: new RegExp(`^${email}$`, 'i') }
  })

  if (user && user._id) {
    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      name: user.name,
      phone: user.phone,
      company: user.company,
      avatar: user.avatar,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }

  return null
}

// Find user by ID
export async function findUserById(id: string): Promise<User | null> {
  const database = await getDatabase()
  const users = database.collection<UserDocument>('User')

  try {
    const user = await users.findOne({ _id: new ObjectId(id) })

    if (user && user._id) {
      return {
        id: user._id.toString(),
        email: user.email,
        password: user.password,
        name: user.name,
        phone: user.phone,
        company: user.company,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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
  const users = database.collection<UserDocument>('User')

  const now = new Date()
  const newUser: Omit<UserDocument, '_id'> = {
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

  const result = await users.insertOne(newUser as UserDocument)

  return {
    id: result.insertedId.toString(),
    email: newUser.email,
    password: newUser.password,
    name: newUser.name,
    phone: newUser.phone,
    company: newUser.company,
    avatar: newUser.avatar,
    isActive: newUser.isActive,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  }
}

// Update user
export async function updateUser(
  id: string,
  updates: Partial<Pick<User, 'name' | 'phone' | 'company' | 'avatar' | 'password'>>
): Promise<User | null> {
  const database = await getDatabase()
  const users = database.collection<UserDocument>('User')

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

    if (result && result._id) {
      return {
        id: result._id.toString(),
        email: result.email,
        password: result.password,
        name: result.name,
        phone: result.phone,
        company: result.company,
        avatar: result.avatar,
        isActive: result.isActive,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
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

import { join } from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import bcrypt from 'bcrypt';

// Define the database schema
type Data = {
  users: User[];
  products: any[]; // We'll define this properly later
};

// Define User interface
export interface User {
  id: string;
  name: string;
  email: string;
  hashedPassword: string;
  role: 'user' | 'admin';
}

// Database file path
const dbFile = join(process.cwd(), 'db.json');

// Create adapter and database instance
let db: Low<Data> | null = null;

// Initialize database
export async function initDB() {
  try {
    const adapter = new JSONFile<Data>(dbFile);
    db = new Low(adapter);

    // Read existing data
    await db.read();

    // Initialize data if it doesn't exist
    if (db.data === null || db.data === undefined) {
      db.data = {
        users: [],
        products: []
      };
    }

    // Add default users if none exist
    if (db.data.users.length === 0) {
      const adminPassword = 'admin123';
      const userPassword = 'user123';

      db.data.users = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          hashedPassword: await bcrypt.hash(adminPassword, 10),
          role: 'admin',
        },
        {
          id: '2',
          name: 'Demo User',
          email: 'user@example.com',
          hashedPassword: await bcrypt.hash(userPassword, 10),
          role: 'user',
        },
      ];
    }

    await db.write();
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Lazy initialization - initialize on first access
async function getDB() {
  if (!db) {
    await initDB();
  }
  return db!;
}

// User database operations
export async function findUserByEmail(email: string): Promise<User | undefined> {
  const database = await getDB();
  await database.read();
  return database.data?.users.find(user => user.email === email);
}

export async function createUser(userData: Omit<User, 'id'>): Promise<User> {
  const database = await getDB();
  await database.read();

  const newUser: User = {
    id: (database.data!.users.length + 1).toString(),
    ...userData,
  };

  database.data!.users.push(newUser);
  await database.write();

  return newUser;
}

export async function getAllUsers(): Promise<User[]> {
  const database = await getDB();
  await database.read();
  return database.data?.users || [];
}
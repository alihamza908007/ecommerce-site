import 'server-only';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL!;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Define User interface
export interface User {
  id: string;
  name: string;
  email: string;
  hashedPassword: string;
  role: 'user' | 'admin';
}

// Initialize database with default users and products
export async function initDB() {
  try {
    // Check if users exist
    const userCount = await prisma.user.count();

    if (userCount === 0) {
      const adminPassword = 'admin123';
      const userPassword = 'user123';

      // Create default users
      await prisma.user.createMany({
        data: [
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
        ],
      });

      console.log('Default users created');
    }

    // Check if products exist
    const productCount = await prisma.product.count();

    if (productCount === 0) {
      // Create default products
      await prisma.product.createMany({
        data: [
          {
            id: '1',
            name: 'Wireless Headphones',
            description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
            price: 199.99,
            image: '/product1.jpg',
            stock: 25,
          },
          {
            id: '2',
            name: 'Smart Watch',
            description: 'Advanced smartwatch with heart rate monitor and GPS tracking',
            price: 249.99,
            image: '/product2.jpg',
            stock: 15,
          },
          {
            id: '3',
            name: 'Bluetooth Speaker',
            description: 'Portable Bluetooth speaker with deep bass and 12-hour playback',
            price: 89.99,
            image: '/product3.jpg',
            stock: 40,
          },
          {
            id: '4',
            name: 'Gaming Mouse',
            description: 'High precision gaming mouse with customizable RGB lighting',
            price: 59.99,
            image: '/product4.jpg',
            stock: 30,
          },
          {
            id: '5',
            name: 'Mechanical Keyboard',
            description: 'Tenkeyless mechanical keyboard with brown switches',
            price: 129.99,
            image: '/product5.jpg',
            stock: 20,
          },
          {
            id: '6',
            name: 'External SSD',
            description: '1TB portable SSD with USB 3.2 interface',
            price: 149.99,
            image: '/product6.jpg',
            stock: 35,
          },
        ],
      });

      console.log('Default products created');
    }

    return prisma;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// User database operations
export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user as User | null;
}

export async function createUser(userData: Omit<User, 'id'>): Promise<User> {
  const user = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      hashedPassword: userData.hashedPassword,
      role: userData.role || 'user',
    },
  });
  return user as User;
}

export async function getAllUsers(): Promise<User[]> {
  const users = await prisma.user.findMany();
  return users as User[];
}

export { prisma };
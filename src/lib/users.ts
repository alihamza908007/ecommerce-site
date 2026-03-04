import bcrypt from 'bcrypt';

export interface User {
  id: string;
  name: string;
  email: string;
  hashedPassword: string;
  role: 'user' | 'admin';
}

// Initialize with demo users with hashed passwords
const adminPassword = 'admin123';
const userPassword = 'user123';

export const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    hashedPassword: bcrypt.hashSync(adminPassword, 10),
    role: 'admin',
  },
  {
    id: '2',
    name: 'Demo User',
    email: 'user@example.com',
    hashedPassword: bcrypt.hashSync(userPassword, 10),
    role: 'user',
  },
];
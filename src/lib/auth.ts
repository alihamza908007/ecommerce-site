// Simple in-memory user storage for demo purposes
// In a real application, this would be replaced with a database and proper authentication

interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In a real app, this would be hashed
  role: 'user' | 'admin';
}

// Demo users
const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123', // In a real app, this would be hashed
    role: 'admin',
  },
  {
    id: '2',
    name: 'Demo User',
    email: 'user@example.com',
    password: 'user123',
    role: 'user',
  },
];

export async function login(email: string, password: string): Promise<{ success: boolean; user?: Omit<User, 'password'>; error?: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = users.find(u => u.email === email);

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  if (user.password !== password) {
    return { success: false, error: 'Invalid password' };
  }

  // Remove password from returned user object
  const { password: _, ...userWithoutPassword } = user;
  return { success: true, user: userWithoutPassword };
}

export async function signup(name: string, email: string, password: string): Promise<{ success: boolean; user?: Omit<User, 'password'>; error?: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return { success: false, error: 'User already exists' };
  }

  // Create new user
  const newUser: User = {
    id: `${users.length + 1}`,
    name,
    email,
    password, // In a real app, this would be hashed
    role: 'user',
  };

  users.push(newUser);

  // Remove password from returned user object
  const { password: _, ...userWithoutPassword } = newUser;
  return { success: true, user: userWithoutPassword };
}

export function getCurrentUser(): { user: Omit<User, 'password'> | null; role: 'user' | 'admin' | null } {
  if (typeof window === 'undefined') {
    return { user: null, role: null };
  }

  const userData = localStorage.getItem('currentUser');
  if (!userData) {
    return { user: null, role: null };
  }

  try {
    const user = JSON.parse(userData);
    return { user, role: user.role };
  } catch (e) {
    return { user: null, role: null };
  }
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
  }
}
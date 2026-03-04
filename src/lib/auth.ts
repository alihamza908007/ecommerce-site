// Client-side authentication functions using API routes
export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Login failed' };
    }

    return result;
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Network error occurred during login' };
  }
}

export async function signup(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || 'Signup failed' };
    }

    return result;
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: 'Network error occurred during signup' };
  }
}

export function getCurrentUser(): {
  user: any | null;
  role: 'user' | 'admin' | null;
} {
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
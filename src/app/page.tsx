'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, logout } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string } | null>(() => {
    const { user, role } = getCurrentUser();
    return user && role ? { name: user.name, role } : null;
  });

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    router.refresh();
  };

  return (
    <div className="min-h-screen text-[var(--text-primary)]">
      <header className="border-b border-[var(--border-color)] bg-[var(--card-bg)]/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-3xl font-bold text-transparent">
            NovaCart
          </h1>
          <div>
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-[var(--text-secondary)]">
                  Hi, {currentUser.name} {currentUser.role === 'admin' && '(Admin)'}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-500"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-500"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] p-10 text-center shadow-2xl backdrop-blur">
          <h2 className="text-4xl font-bold">A modern shopping experience</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--text-secondary)]">
            Discover curated tech products with a smooth, interactive storefront and real-time admin operations.
          </p>

          {!currentUser ? (
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/auth/login" className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-500">Login</Link>
              <Link href="/auth/signup" className="rounded-xl border border-[var(--border-color)] px-6 py-3 font-semibold text-[var(--text-primary)] transition-all duration-300 hover:-translate-y-1 hover:bg-white/10">Sign Up</Link>
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/products" className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-500">Browse Products</Link>
              <Link href="/cart" className="rounded-xl border border-[var(--border-color)] px-6 py-3 font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-white/10">View Cart</Link>
              {currentUser.role === 'admin' && (
                <Link href="/admin/dashboard" className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1">Admin Dashboard</Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-indigo-500/20 bg-slate-900/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-indigo-300">Control Center</p>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="rounded-lg border border-indigo-400/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-500/20"
            >
              Browse Store
            </Link>
            <Link
              href="/"
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition-all duration-300 hover:-translate-y-0.5 hover:from-cyan-400 hover:to-indigo-400"
            >
              Back to Main Website
            </Link>
          </div>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}

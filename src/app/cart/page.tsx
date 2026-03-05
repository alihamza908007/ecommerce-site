'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/cart-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default function CartPage() {
  const { items, totalAmount, updateQuantity, removeItem, clearCart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  useEffect(() => {
    const { user } = getCurrentUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setIsLoading(false);
  }, [router]);

  const handleCheckout = async () => {
    const { user } = getCurrentUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (items.length === 0) {
      setCheckoutMessage('Your cart is empty.');
      return;
    }

    try {
      setIsCheckingOut(true);
      setCheckoutMessage(null);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: user.name,
          email: user.email,
          userId: user.id,
          items,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Checkout failed');
      }

      clearCart();
      setCheckoutMessage(`Order placed successfully! Order ID: ${result.data.id}`);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Checkout failed';
      setCheckoutMessage(message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-500" />
          <p className="mt-4 text-[var(--text-secondary)]">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] p-10 text-center shadow-xl">
            <h1 className="text-3xl font-bold">Your cart is empty</h1>
            <p className="mt-2 text-[var(--text-secondary)]">Add products to place an order.</p>
            <Link
              href="/products"
              className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:bg-indigo-500"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold">Shopping Cart</h1>
        {checkoutMessage && (
          <div className="mb-5 rounded-xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-3 text-sm">
            {checkoutMessage}
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-xl">
              <ul className="divide-y divide-[var(--border-color)]">
                {items.map((item) => (
                  <li key={item.id} className="flex p-5 transition-colors hover:bg-white/5">
                    <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-indigo-400/20 to-cyan-400/20" />
                    <div className="ml-4 flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center rounded-md border border-[var(--border-color)]">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1">-</button>
                          <span className="px-3 py-1">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1">+</button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-sm font-medium text-rose-400 transition hover:text-rose-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 lg:col-span-5 lg:mt-0">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 shadow-xl">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between border-t border-[var(--border-color)] pt-3 text-base font-semibold">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCheckingOut ? 'Placing Order...' : 'Checkout'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

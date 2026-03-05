'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/cart-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default function CartPage() {
  const { items, totalAmount, updateQuantity, removeItem } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const { user } = getCurrentUser();

    if (!user) {
      // Redirect to login if not authenticated
      router.push('/auth/login');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleCheckout = () => {
    alert('Proceeding to checkout!');
    // In a real application, this would redirect to a checkout page
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl font-medium text-gray-900 mb-4">Your cart is empty</h2>
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
          <div className="lg:col-span-7">
            <h2 className="text-lg font-medium text-gray-900">Cart ({items.length} items)</h2>

            <div className="mt-4 bg-white rounded-lg shadow">
              <ul role="list" className="divide-y divide-gray-200">
                {items.map((item) => (
                  <li key={item.id} className="flex py-6 px-4 sm:px-6">
                    <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden">
                      <div className="w-full h-full bg-gray-200 border-2 border-dashed rounded-xl" />
                    </div>

                    <div className="ml-4 flex-1 flex flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.name}</h3>
                          <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex-1 flex items-end justify-between text-sm">
                        <div className="flex items-center">
                          <label htmlFor={`quantity-${item.id}`} className="mr-2 text-gray-500">
                            Qty
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="px-3 py-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              -
                            </button>
                            <input
                              id={`quantity-${item.id}`}
                              type="text"
                              value={item.quantity}
                              readOnly
                              className="w-16 text-center border-none focus:ring-0 py-1.5 text-base font-medium text-gray-900"
                            />
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-3 py-1.5 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="font-medium text-red-600 hover:text-red-700 transition-colors"
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

          <div className="mt-10 lg:mt-0 lg:col-span-5">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-lg font-medium text-gray-900">${totalAmount.toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <p className="text-base font-medium text-gray-900">Order total</p>
                  <p className="text-xl font-bold text-gray-900">${totalAmount.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleCheckout}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Checkout
                </button>
              </div>

              <div className="mt-6 flex justify-center">
                <Link
                  href="/products"
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Continue Shopping<span aria-hidden="true"> &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
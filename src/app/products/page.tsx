'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { Product } from '@/types';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';

export default function ProductsPage() {
  const { addItem, totalItems } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const { user } = getCurrentUser();

    if (!user) {
      // Redirect to login if not authenticated
      router.push('/auth/login');
    } else {
      // Fetch products from API
      fetchProducts();
    }
  }, [router]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <Link
            href="/cart"
            className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cart ({totalItems})
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/products/${product.id}`)}
            >
              {/* Product Card Content */}
              <div className="aspect-h-1 aspect-w-1 w-full bg-gray-200 rounded-lg overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📦</div>
                    <p className="text-gray-500 text-sm">{product.name}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                </div>
                <p className="text-sm font-bold text-gray-900 ml-2">
                  ${product.price.toFixed(2)}
                </p>
              </div>

              {/* Add to Cart Button */}
              <div className="mt-4 flex justify-between items-center">
                <p className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Stock: {product.stock}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                  disabled={product.stock <= 0}
                  className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md transition-colors ${
                    product.stock > 0
                      ? 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>

              {/* Click hint */}
              <div className="absolute inset-0 rounded-lg ring-2 ring-transparent group-hover:ring-indigo-500 group-hover:ring-opacity-50 transition-all pointer-events-none" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
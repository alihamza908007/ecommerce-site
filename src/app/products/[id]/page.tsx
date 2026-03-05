"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { Product } from "@/types";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { addItem, totalItems } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { user } = getCurrentUser();

    if (!user) {
      router.push("/auth/login");
      return;
    }

    fetchProduct();
  }, [id, router]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products?id=${id}`);

      const data = await response.json();

      if (data.success && data.data) {
        setProduct(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
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
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Product not found
          </h1>

          <button
            onClick={() => router.push("/products")}
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Go back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          <Link
            href="/cart"
            className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Cart ({totalItems})
          </Link>
        </div>
      </header>

      {/* Main */}

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}

            <div className="h-96 lg:h-auto bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-500">{product.name} Image</p>
              </div>
            </div>

            {/* Product Details */}

            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {product.name}
              </h2>

              <p className="text-gray-600 mb-4">{product.description}</p>

              {/* Price */}

              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-gray-500 ml-2">/ item</span>
              </div>

              {/* Stock */}

              <div className="mb-6">
                <span className="text-sm font-medium text-gray-700">
                  Stock:
                </span>

                <span
                  className={`ml-2 text-sm font-medium ${
                    product.stock > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} available`
                    : "Out of stock"}
                </span>
              </div>

              {/* Buttons */}

              <div className="flex gap-4">
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                  className={`flex-1 py-3 px-6 rounded-md font-medium text-white ${
                    product.stock > 0
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </button>

                <Link
                  href="/products"
                  className="px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50"
                >
                  Back
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

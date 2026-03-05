'use client';

import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

type AdminProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
};

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

type DashboardOrder = {
  id: string;
  customerName: string;
  email: string;
  total: number;
  status: OrderStatus;
  date: string;
};

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
};

type OrderFormState = {
  customerName: string;
  email: string;
  total: string;
  status: OrderStatus;
};

const emptyProductForm: ProductFormState = {
  name: '',
  description: '',
  price: '',
  stock: '',
  imageUrl: '',
};

const orderStatuses: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminDashboard() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productFormState, setProductFormState] = useState<ProductFormState>(emptyProductForm);

  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [orderFormState, setOrderFormState] = useState<OrderFormState>({
    customerName: '',
    email: '',
    total: '',
    status: 'pending',
  });

  const fetchDashboardData = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const [productsRes, ordersRes] = await Promise.all([
        fetch('/api/products', { cache: 'no-store' }),
        fetch('/api/orders?limit=100', { cache: 'no-store' }),
      ]);

      const productsJson = await productsRes.json();
      const ordersJson = await ordersRes.json();

      if (productsJson.success && Array.isArray(productsJson.data)) {
        setProducts(productsJson.data);
      }

      if (ordersJson.success && Array.isArray(ordersJson.data)) {
        setOrders(ordersJson.data);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setFeedback({ type: 'error', message: 'Could not refresh live data. Please try again.' });
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const { user, role } = getCurrentUser();
    if (!user || role !== 'admin') {
      router.push('/auth/login');
      return;
    }

    fetchDashboardData(true);
    const interval = setInterval(() => fetchDashboardData(false), 6000);
    return () => clearInterval(interval);
  }, [fetchDashboardData, router]);

  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + order.total, 0), [orders]);
  const totalOrders = orders.length;
  const pendingOrders = useMemo(
    () => orders.filter((order) => ['pending', 'processing'].includes(order.status)).length,
    [orders],
  );
  const lowStockItems = useMemo(() => products.filter((product) => product.stock <= 5).length, [products]);

  const beginProductEdit = (product: AdminProduct) => {
    setEditingProductId(product.id);
    setProductFormState({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      imageUrl: product.image || '',
    });
  };

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductFormState(emptyProductForm);
  };

  const handleProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!productFormState.name || !productFormState.description || !productFormState.price) {
      setFeedback({ type: 'error', message: 'Name, description, and price are required.' });
      return;
    }

    const price = Number(productFormState.price);
    const stock = Number(productFormState.stock || 0);

    if (Number.isNaN(price) || price < 0 || Number.isNaN(stock) || stock < 0) {
      setFeedback({ type: 'error', message: 'Please enter valid positive values for price and stock.' });
      return;
    }

    const payload = {
      name: productFormState.name,
      description: productFormState.description,
      price,
      stock,
      image: productFormState.imageUrl || '/uploads/products/placeholder-product.jpg',
    };

    try {
      setIsSavingProduct(true);
      const isEditing = Boolean(editingProductId);
      const endpoint = isEditing ? `/api/products?id=${editingProductId}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save product');
      }

      setFeedback({ type: 'success', message: isEditing ? 'Product updated successfully.' : 'Product added successfully.' });
      resetProductForm();
      await fetchDashboardData(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save product';
      setFeedback({ type: 'error', message });
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete product');
      }

      setFeedback({ type: 'success', message: 'Product deleted successfully.' });
      await fetchDashboardData(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete product';
      setFeedback({ type: 'error', message });
    }
  };

  const updateStock = async (product: AdminProduct, nextStock: number) => {
    if (nextStock < 0) return;

    try {
      const response = await fetch(`/api/products?id=${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name,
          description: product.description,
          price: product.price,
          stock: nextStock,
          image: product.image || '/uploads/products/placeholder-product.jpg',
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Could not update stock');
      }

      setProducts((prev) => prev.map((item) => (item.id === product.id ? { ...item, stock: nextStock } : item)));
      setFeedback({ type: 'success', message: `Stock for ${product.name} updated.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update stock';
      setFeedback({ type: 'error', message });
    }
  };

  const startOrderEdit = (order: DashboardOrder) => {
    setEditingOrderId(order.id);
    setOrderFormState({
      customerName: order.customerName,
      email: order.email,
      total: String(order.total),
      status: order.status,
    });
  };

  const saveOrderEdit = async () => {
    if (!editingOrderId) return;

    const parsedTotal = Number(orderFormState.total);
    if (!orderFormState.customerName.trim() || !orderFormState.email.trim() || Number.isNaN(parsedTotal) || parsedTotal < 0) {
      setFeedback({ type: 'error', message: 'Please provide valid order values before saving.' });
      return;
    }

    try {
      const response = await fetch(`/api/orders?id=${editingOrderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: orderFormState.customerName,
          email: orderFormState.email,
          total: parsedTotal,
          status: orderFormState.status,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update order');
      }

      setEditingOrderId(null);
      setFeedback({ type: 'success', message: 'Order updated successfully.' });
      await fetchDashboardData(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update order';
      setFeedback({ type: 'error', message });
    }
  };

  const changeOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update order status');
      }

      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)));
      setFeedback({ type: 'success', message: 'Order status updated.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update order status';
      setFeedback({ type: 'error', message });
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!window.confirm('Delete this order? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/orders?id=${orderId}`, { method: 'DELETE' });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete order');
      }

      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      setFeedback({ type: 'success', message: 'Order deleted successfully.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete order';
      setFeedback({ type: 'error', message });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-indigo-400/30 bg-slate-900/80 p-8 text-center shadow-xl shadow-indigo-950/40">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-300 border-t-cyan-400" />
          <p className="mt-4 text-sm text-slate-300">Loading live admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 shadow-lg shadow-indigo-900/40">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}` },
            { label: 'Total Orders', value: totalOrders },
            { label: 'Pending Orders', value: pendingOrders },
            { label: 'Low Stock Items', value: lowStockItems },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
            >
              <p className="text-xs uppercase tracking-wide text-indigo-200">{metric.label}</p>
              <p className="mt-2 text-2xl font-bold text-white">{metric.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-indigo-200/80">
          Live refresh every 6 seconds.
          {lastUpdated ? ` Last updated: ${lastUpdated.toLocaleTimeString()}` : ''}
        </p>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm transition-opacity duration-300 ${
            feedback.type === 'success'
              ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
              : 'border-rose-400/40 bg-rose-500/10 text-rose-100'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <section className="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-5 shadow-lg shadow-cyan-900/20">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-cyan-100">{editingProductId ? 'Edit Product' : 'Add New Product'}</h2>
          {editingProductId && (
            <button
              onClick={resetProductForm}
              className="rounded-md border border-slate-500 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form className="grid grid-cols-1 gap-3 md:grid-cols-2" onSubmit={handleProductSubmit}>
          <input
            className="rounded-lg border border-slate-600 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
            placeholder="Product name"
            value={productFormState.name}
            onChange={(event) => setProductFormState((prev) => ({ ...prev, name: event.target.value }))}
          />
          <input
            className="rounded-lg border border-slate-600 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
            placeholder="Image URL (optional)"
            value={productFormState.imageUrl}
            onChange={(event) => setProductFormState((prev) => ({ ...prev, imageUrl: event.target.value }))}
          />
          <input
            type="number"
            min={0}
            step="0.01"
            className="rounded-lg border border-slate-600 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
            placeholder="Price"
            value={productFormState.price}
            onChange={(event) => setProductFormState((prev) => ({ ...prev, price: event.target.value }))}
          />
          <input
            type="number"
            min={0}
            className="rounded-lg border border-slate-600 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
            placeholder="Stock quantity"
            value={productFormState.stock}
            onChange={(event) => setProductFormState((prev) => ({ ...prev, stock: event.target.value }))}
          />
          <textarea
            className="md:col-span-2 rounded-lg border border-slate-600 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
            rows={3}
            placeholder="Description"
            value={productFormState.description}
            onChange={(event) => setProductFormState((prev) => ({ ...prev, description: event.target.value }))}
          />
          <button
            type="submit"
            disabled={isSavingProduct}
            className="md:col-span-2 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:from-cyan-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSavingProduct ? 'Saving...' : editingProductId ? 'Save Product Changes' : 'Add Product'}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-indigo-400/20 bg-slate-900/80 p-5 shadow-lg shadow-indigo-900/30">
        <h2 className="mb-4 text-xl font-semibold text-indigo-100">Manage Products</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Quantity</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-slate-800 transition-colors hover:bg-slate-800/50">
                  <td className="px-3 py-3">
                    <p className="font-medium text-slate-100">{product.name}</p>
                    <p className="line-clamp-1 text-xs text-slate-400">{product.description}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-200">${product.price.toFixed(2)}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateStock(product, product.stock - 1)}
                        className="h-7 w-7 rounded-md border border-slate-600 text-slate-300 transition hover:border-cyan-400 hover:text-cyan-200"
                      >
                        -
                      </button>
                      <span className="inline-flex min-w-8 justify-center rounded bg-slate-800 px-2 py-1 text-slate-100">{product.stock}</span>
                      <button
                        onClick={() => updateStock(product, product.stock + 1)}
                        className="h-7 w-7 rounded-md border border-slate-600 text-slate-300 transition hover:border-cyan-400 hover:text-cyan-200"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        product.stock <= 5 ? 'bg-rose-500/20 text-rose-200' : 'bg-emerald-500/20 text-emerald-200'
                      }`}
                    >
                      {product.stock <= 5 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => beginProductEdit(product)}
                        className="rounded-md border border-indigo-400/40 px-2.5 py-1.5 text-xs font-medium text-indigo-200 transition hover:bg-indigo-400/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="rounded-md border border-rose-400/40 px-2.5 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-400/10"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-fuchsia-400/20 bg-slate-900/80 p-5 shadow-lg shadow-fuchsia-900/20">
        <h2 className="mb-4 text-xl font-semibold text-fuchsia-100">Manage Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-3 py-2">Order</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isEditing = editingOrderId === order.id;
                return (
                  <tr key={order.id} className="border-t border-slate-800 transition-colors hover:bg-slate-800/40">
                    <td className="px-3 py-3 font-medium text-slate-100">{order.id}</td>
                    <td className="px-3 py-3 text-slate-200">
                      {isEditing ? (
                        <input
                          value={orderFormState.customerName}
                          onChange={(event) => setOrderFormState((prev) => ({ ...prev, customerName: event.target.value }))}
                          className="w-full rounded border border-slate-600 bg-slate-950/70 px-2 py-1 text-xs text-white"
                        />
                      ) : (
                        order.customerName
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-300">
                      {isEditing ? (
                        <input
                          value={orderFormState.email}
                          onChange={(event) => setOrderFormState((prev) => ({ ...prev, email: event.target.value }))}
                          className="w-full rounded border border-slate-600 bg-slate-950/70 px-2 py-1 text-xs text-white"
                        />
                      ) : (
                        order.email
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-300">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="px-3 py-3 text-slate-200">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={orderFormState.total}
                          onChange={(event) => setOrderFormState((prev) => ({ ...prev, total: event.target.value }))}
                          className="w-24 rounded border border-slate-600 bg-slate-950/70 px-2 py-1 text-xs text-white"
                        />
                      ) : (
                        `$${order.total.toFixed(2)}`
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {isEditing ? (
                        <select
                          value={orderFormState.status}
                          onChange={(event) =>
                            setOrderFormState((prev) => ({ ...prev, status: event.target.value as OrderStatus }))
                          }
                          className="rounded border border-slate-600 bg-slate-950/70 px-2 py-1 text-xs text-white"
                        >
                          {orderStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <select
                          value={order.status}
                          onChange={(event) => changeOrderStatus(order.id, event.target.value as OrderStatus)}
                          className="rounded border border-slate-600 bg-slate-950/70 px-2 py-1 text-xs text-white"
                        >
                          {orderStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={saveOrderEdit}
                              className="rounded-md border border-emerald-400/40 px-2.5 py-1.5 text-xs font-medium text-emerald-200 transition hover:bg-emerald-400/10"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingOrderId(null)}
                              className="rounded-md border border-slate-500 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startOrderEdit(order)}
                              className="rounded-md border border-fuchsia-400/40 px-2.5 py-1.5 text-xs font-medium text-fuchsia-200 transition hover:bg-fuchsia-400/10"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteOrder(order.id)}
                              className="rounded-md border border-rose-400/40 px-2.5 py-1.5 text-xs font-medium text-rose-200 transition hover:bg-rose-400/10"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

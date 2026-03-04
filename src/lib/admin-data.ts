export interface Order {
  id: string;
  customerName: string;
  email: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: string;
}

export interface StockItem {
  productId: string;
  productName: string;
  currentStock: number;
  lowStockThreshold: number;
}

export const orders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'John Doe',
    email: 'john@example.com',
    items: [
      { productId: '1', productName: 'Wireless Headphones', quantity: 1, price: 199.99 },
      { productId: '3', productName: 'Bluetooth Speaker', quantity: 2, price: 89.99 },
    ],
    total: 379.97,
    status: 'delivered',
    date: '2026-02-15',
  },
  {
    id: 'ORD-002',
    customerName: 'Jane Smith',
    email: 'jane@example.com',
    items: [
      { productId: '2', productName: 'Smart Watch', quantity: 1, price: 249.99 },
    ],
    total: 249.99,
    status: 'shipped',
    date: '2026-02-20',
  },
  {
    id: 'ORD-003',
    customerName: 'Bob Johnson',
    email: 'bob@example.com',
    items: [
      { productId: '4', productName: 'Gaming Mouse', quantity: 1, price: 59.99 },
      { productId: '5', productName: 'Mechanical Keyboard', quantity: 1, price: 129.99 },
    ],
    total: 189.98,
    status: 'processing',
    date: '2026-03-01',
  },
];

export const stockItems: StockItem[] = [
  { productId: '1', productName: 'Wireless Headphones', currentStock: 25, lowStockThreshold: 5 },
  { productId: '2', productName: 'Smart Watch', currentStock: 15, lowStockThreshold: 3 },
  { productId: '3', productName: 'Bluetooth Speaker', currentStock: 40, lowStockThreshold: 10 },
  { productId: '4', productName: 'Gaming Mouse', currentStock: 30, lowStockThreshold: 8 },
  { productId: '5', productName: 'Mechanical Keyboard', currentStock: 20, lowStockThreshold: 5 },
  { productId: '6', productName: 'External SSD', currentStock: 35, lowStockThreshold: 10 },
];
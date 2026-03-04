export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
    price: 199.99,
    image: '/product1.jpg',
    stock: 25,
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Advanced smartwatch with heart rate monitor and GPS tracking',
    price: 249.99,
    image: '/product2.jpg',
    stock: 15,
  },
  {
    id: '3',
    name: 'Bluetooth Speaker',
    description: 'Portable Bluetooth speaker with deep bass and 12-hour playback',
    price: 89.99,
    image: '/product3.jpg',
    stock: 40,
  },
  {
    id: '4',
    name: 'Gaming Mouse',
    description: 'High precision gaming mouse with customizable RGB lighting',
    price: 59.99,
    image: '/product4.jpg',
    stock: 30,
  },
  {
    id: '5',
    name: 'Mechanical Keyboard',
    description: 'Tenkeyless mechanical keyboard with brown switches',
    price: 129.99,
    image: '/product5.jpg',
    stock: 20,
  },
  {
    id: '6',
    name: 'External SSD',
    description: '1TB portable SSD with USB 3.2 interface',
    price: 149.99,
    image: '/product6.jpg',
    stock: 35,
  },
];
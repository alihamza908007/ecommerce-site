import 'server-only';
import { prisma } from './database';
import type { Product } from '@prisma/client';

export type { Product };

export async function getProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' },
  });
  return products;
}

export async function getProductById(id: string): Promise<Product | null> {
  return await prisma.product.findUnique({
    where: { id },
  });
}

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  image: string;
  stock: number;
}): Promise<Product> {
  return await prisma.product.create({
    data,
  });
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    image: string;
    stock: number;
  }>
): Promise<Product> {
  return await prisma.product.update({
    where: { id },
    data,
  });
}

export async function deleteProduct(id: string): Promise<Product> {
  return await prisma.product.delete({
    where: { id },
  });
}

export async function updateStock(
  id: string,
  stock: number
): Promise<Product> {
  return await prisma.product.update({
    where: { id },
    data: { stock },
  });
}
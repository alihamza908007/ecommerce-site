import { NextResponse } from 'next/server';
import { products } from '@/lib/products';

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real application, this would save to a database
    return NextResponse.json({
      success: true,
      message: 'Product added successfully',
      data: { ...data, id: Date.now().toString() },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add product' },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/database";

const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

// GET orders (or single order by id)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");

    if (id) {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        return NextResponse.json(
          { success: false, error: "Order not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ success: true, data: order });
    }

    const where = status ? { status } : {};

    const orders = await prisma.order.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit ? parseInt(limit) : 50,
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}



// POST create order from checkout
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { customerName, email, items, userId } = data;

    if (!customerName || !email || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "customerName, email, and at least one item are required" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email" },
        { status: 400 },
      );
    }

    const normalizedItems = items.map((item: { id: string; name: string; quantity: number; price: number }) => ({
      productId: item.id,
      productName: item.name,
      quantity: Number(item.quantity),
      price: Number(item.price),
    }));

    const invalidItem = normalizedItems.find((item: { quantity: number; price: number; productId: string }) =>
      !item.productId || Number.isNaN(item.quantity) || item.quantity <= 0 || Number.isNaN(item.price) || item.price < 0,
    );

    if (invalidItem) {
      return NextResponse.json(
        { success: false, error: "Invalid cart item data" },
        { status: 400 },
      );
    }

    const productIds = normalizedItems.map((item: { productId: string }) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, stock: true },
    });

    const stockMap = new Map(products.map((product: { id: string; stock: number }) => [product.id, product.stock]));
    const stockProblem = normalizedItems.find((item: { productId: string; quantity: number }) => {
      const stock = stockMap.get(item.productId);
      return stock === undefined || stock < item.quantity;
    });

    if (stockProblem) {
      return NextResponse.json(
        { success: false, error: `Insufficient stock for product ${stockProblem.productId}` },
        { status: 400 },
      );
    }

    const total = normalizedItems.reduce((sum: number, item: { quantity: number; price: number }) => sum + item.quantity * item.price, 0);

    const order = await prisma.$transaction(async (tx) => {
      for (const item of normalizedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return tx.order.create({
        data: {
          customerName: String(customerName).trim(),
          email: String(email).trim(),
          total,
          status: 'pending',
          userId: userId || null,
          items: {
            create: normalizedItems,
          },
        },
        include: { items: true },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 },
    );
  }
}

// PUT update order fields
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 },
      );
    }

    const data = await request.json();
    const updateData: {
      status?: string;
      customerName?: string;
      email?: string;
      total?: number;
    } = {};

    if (data.status !== undefined) {
      if (!validStatuses.includes(data.status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 },
        );
      }
      updateData.status = data.status;
    }

    if (data.customerName !== undefined) {
      if (!String(data.customerName).trim()) {
        return NextResponse.json(
          { success: false, error: "Customer name cannot be empty" },
          { status: 400 },
        );
      }
      updateData.customerName = String(data.customerName).trim();
    }

    if (data.email !== undefined) {
      const email = String(data.email).trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: "Please provide a valid email" },
          { status: 400 },
        );
      }
      updateData.email = email;
    }

    if (data.total !== undefined) {
      const parsedTotal = Number(data.total);
      if (Number.isNaN(parsedTotal) || parsedTotal < 0) {
        return NextResponse.json(
          { success: false, error: "Total must be a valid non-negative number" },
          { status: 400 },
        );
      }
      updateData.total = parsedTotal;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one field must be provided for update" },
        { status: 400 },
      );
    }

    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 },
    );
  }
}

// DELETE order
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 },
      );
    }

    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    await prisma.order.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete order" },
      { status: 500 },
    );
  }
}

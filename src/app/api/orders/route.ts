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

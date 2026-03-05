import { NextResponse } from "next/server";
import { getProducts, createProduct, getProductById } from "@/lib/products";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // If ID exists → return single product
    if (id) {
      const product = await getProductById(id);

      if (!product) {
        return NextResponse.json(
          { success: false, error: "Product not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        data: product,
      });
    }

    // Otherwise return all products
    const products = await getProducts();

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);

    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (
      !data.name ||
      !data.description ||
      data.price === undefined ||
      !data.image
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const product = await createProduct({
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      image: data.image,
      stock: data.stock || 0,
    });

    return NextResponse.json({
      success: true,
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    console.error("Failed to add product:", error);

    return NextResponse.json(
      { success: false, error: "Failed to add product" },
      { status: 500 },
    );
  }
}

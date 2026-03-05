import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function POST(request: Request) {
  try {
    const { email, role } = await request.json();

    // Validate input
    if (!email || !role) {
      return NextResponse.json(
        { success: false, error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== 'admin' && role !== 'user') {
      return NextResponse.json(
        { success: false, error: 'Role must be either "admin" or "user"' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found with this email' },
        { status: 404 }
      );
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Failed to update user role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user role' },
      { status: 500 }
    );
  }
}

// Also export a helper function to update role
export async function updateUserRole(email: string, role: 'admin' | 'user') {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return updatedUser;
}
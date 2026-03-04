import { NextResponse } from 'next/server';
import { initDB } from '@/lib/database';

export async function GET() {
  try {
    await initDB();
    return NextResponse.json({ success: true, message: 'Database initialized' });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
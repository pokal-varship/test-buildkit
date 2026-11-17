import { NextResponse } from 'next/server';
import { getPageConfig } from '../../../services/homePage';

export async function GET() {
  try {
    const data = await getPageConfig('HOME');
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
} 
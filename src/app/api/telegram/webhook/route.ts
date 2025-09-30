
import { NextResponse } from 'next/server';
import { handleTelegramUpdate } from '@/lib/actions';

export async function POST(request: Request) {
  try {
    const update = await request.json();
    
    // Don't await this, to make sure Telegram gets a quick response
    handleTelegramUpdate(update);

    // Respond to Telegram immediately to acknowledge receipt of the update
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error in Telegram webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

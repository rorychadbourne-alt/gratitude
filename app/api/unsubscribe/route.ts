// app/api/push/unsubscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { subscriptionStorage } from 'lib/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Check if subscription exists
    const subscription = subscriptionStorage.get(userId);
    
    if (!subscription) {
      console.log('No subscription found for user:', userId);
      return NextResponse.json({ 
        success: true, 
        message: 'No subscription found for this user'
      });
    }

    // Remove subscription from storage
    subscriptionStorage.delete(userId);

    console.log('Push subscription removed for user:', userId);

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription removed successfully'
    });

  } catch (error: any) {
    console.error('Error removing subscription:', error);
    return NextResponse.json({ 
      error: 'Failed to remove subscription',
      details: error.message 
    }, { status: 500 });
  }
}
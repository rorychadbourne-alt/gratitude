// app/api/push/test-reminder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  'mailto:rorychadbourne@gmail.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Import subscriptions (you'll need to implement a proper shared storage solution)
const subscriptions = new Map();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user's subscription
    const subscription = subscriptions.get(userId);
    
    if (!subscription || !subscription.active) {
      return NextResponse.json({ error: 'No active subscription found for user' }, { status: 404 });
    }

    // Send test notification
    const payload = JSON.stringify({
      title: '🧪 Test Gratitude Reminder',
      body: 'This is a test reminder - your daily notifications are working!',
      url: '/',
      tag: 'test-reminder',
      timestamp: Date.now()
    });

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth
      }
    };

    await webpush.sendNotification(pushSubscription, payload);

    console.log(`Test reminder sent to user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Test reminder sent successfully'
    });

  } catch (error: any) {
    console.error('Error sending test reminder:', error);
    return NextResponse.json({
      error: 'Failed to send test reminder',
      details: error.message
    }, { status: 500 });
  }
}

// GET method to send test reminder to all active subscriptions
export async function GET() {
  try {
    const activeSubscriptions = Array.from(subscriptions.values()).filter((sub: any) => sub.active);
    
    if (activeSubscriptions.length === 0) {
      return NextResponse.json({
        message: 'No active subscriptions found',
        subscriptionsCount: 0
      });
    }

    let sent = 0;
    let failed = 0;

    for (const sub of activeSubscriptions) {
      try {
        const payload = JSON.stringify({
          title: '🧪 Test Daily Reminder',
          body: 'Testing your gratitude notifications - this is what your daily reminders will look like!',
          url: '/',
          tag: 'test-reminder',
          timestamp: Date.now()
        });

        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        await webpush.sendNotification(pushSubscription, payload);
        sent++;
      } catch (error) {
        console.error(`Failed to send test to user ${sub.userId}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Test reminders sent to ${sent} users, ${failed} failed`,
      results: { sent, failed }
    });

  } catch (error: any) {
    console.error('Error sending test reminders:', error);
    return NextResponse.json({
      error: 'Failed to send test reminders',
      details: error.message
    }, { status: 500 });
  }
}
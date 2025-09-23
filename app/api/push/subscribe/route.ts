// app/api/push/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  'mailto:rorychadbourne@gmail.com', // Use your email
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Shared subscriptions storage (in memory for now)
// In production, you'd use a proper database
const subscriptions = new Map();

export async function POST(request: NextRequest) {
  try {
    const { subscription, userData } = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    // Store subscription (in memory for now - you can add database later)
    const subscriptionDoc = {
      userId: userData.userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      reminderTime: userData.reminderTime || '19:00',
      reminderDays: userData.reminderDays || {
        monday: true, tuesday: true, wednesday: true, thursday: true,
        friday: true, saturday: true, sunday: true
      },
      timezone: userData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true
    };

    // Store in memory (replace with database later)
    subscriptions.set(userData.userId, subscriptionDoc);

    console.log('Push subscription saved:', userData.userId, {
      reminderTime: subscriptionDoc.reminderTime,
      timezone: subscriptionDoc.timezone,
      days: Object.entries(subscriptionDoc.reminderDays).filter(([, enabled]) => enabled).map(([day]) => day)
    });

    // Send welcome notification
    try {
      const welcomePayload = JSON.stringify({
        title: 'Daily Gratitude Reminders Enabled! 🎉',
        body: `You'll receive reminders at ${subscriptionDoc.reminderTime} in your local time.`,
        url: '/',
        tag: 'welcome'
      });

      await webpush.sendNotification(subscription, welcomePayload);
      console.log('Welcome notification sent');
    } catch (welcomeError) {
      console.error('Failed to send welcome notification:', welcomeError);
      // Don't fail the subscription if welcome notification fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription saved successfully',
      settings: {
        reminderTime: subscriptionDoc.reminderTime,
        reminderDays: subscriptionDoc.reminderDays,
        timezone: subscriptionDoc.timezone
      }
    });

  } catch (error: any) {
    console.error('Error saving subscription:', error);
    return NextResponse.json({ 
      error: 'Failed to save subscription',
      details: error.message 
    }, { status: 500 });
  }
}

// GET method to check current subscriptions (for debugging)
export async function GET() {
  return NextResponse.json({
    subscriptionsCount: subscriptions.size,
    subscriptions: Array.from(subscriptions.entries()).map(([userId, sub]: [string, any]) => ({
      userId,
      reminderTime: sub.reminderTime,
      timezone: sub.timezone,
      active: sub.active,
      createdAt: sub.createdAt
    }))
  });
}

// Make subscriptions available to other modules
export { subscriptions };
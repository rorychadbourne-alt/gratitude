// app/api/push/send-daily-reminders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  'mailto:rorychadbourne@gmail.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Import the subscriptions from the subscribe route
// Note: In production, you'd use a proper database
let subscriptions = new Map();

export async function POST(request: NextRequest) {
  // Security: Only allow POST requests with correct auth token
  const authToken = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (authToken !== process.env.CRON_SECRET_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    console.log(`Sending daily reminders for ${currentDay} at ${now.toISOString()}`);

    // Get all subscriptions that should receive notifications today
    const eligibleSubscriptions = Array.from(subscriptions.values()).filter((sub: any) => {
      return sub.active && sub.reminderDays && sub.reminderDays[currentDay];
    });

    console.log(`Found ${eligibleSubscriptions.length} eligible subscriptions`);

    const results = {
      sent: 0,
      failed: 0,
      skipped: 0
    };

    for (const sub of eligibleSubscriptions) {
      try {
        // Check if user should receive notification at this time
        const shouldSend = await shouldSendReminderNow(sub, now);
        
        if (!shouldSend) {
          results.skipped++;
          continue;
        }

        // For now, we'll skip the "already completed today" check since we don't have gratitude entries yet
        // In a real app, you'd check: const hasCompletedToday = await checkIfCompletedToday(sub.userId);

        // Send notification
        const payload = JSON.stringify({
          title: 'Daily Gratitude Time 🙏',
          body: 'Take a moment to reflect on what you\'re grateful for today.',
          url: '/',
          tag: 'daily-reminder',
          timestamp: now.getTime()
        });

        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth
          }
        };

        await webpush.sendNotification(pushSubscription, payload);
        results.sent++;
        
        console.log(`Sent reminder to user ${sub.userId}`);

      } catch (error: any) {
        console.error(`Failed to send to user ${sub.userId}:`, error);
        results.failed++;
        
        // If subscription is invalid, deactivate it
        if (error.statusCode === 410 || error.statusCode === 404) {
          sub.active = false;
          console.log(`Deactivated invalid subscription for user ${sub.userId}`);
        }
      }
    }

    console.log('Daily reminders completed:', results);

    return NextResponse.json({
      success: true,
      results,
      message: `Sent ${results.sent} reminders, failed ${results.failed}, skipped ${results.skipped}`
    });

  } catch (error: any) {
    console.error('Error sending daily reminders:', error);
    return NextResponse.json({
      error: 'Failed to send daily reminders',
      details: error.message
    }, { status: 500 });
  }
}

// Helper function to check if reminder should be sent now
async function shouldSendReminderNow(subscription: any, currentTime: Date): Promise<boolean> {
  try {
    const userTimezone = subscription.timezone || 'UTC';
    const reminderTime = subscription.reminderTime || '19:00';
    
    // Convert current time to user's timezone
    const userTime = new Date(currentTime.toLocaleString('en-US', { timeZone: userTimezone }));
    const userHour = userTime.getHours();
    const userMinute = userTime.getMinutes();
    
    // Parse reminder time
    const [reminderHour, reminderMinute] = reminderTime.split(':').map(Number);
    
    // Check if current time matches reminder time (within 60 minutes window for testing)
    const currentMinutes = userHour * 60 + userMinute;
    const reminderMinutes = reminderHour * 60 + reminderMinute;
    const timeDiff = Math.abs(currentMinutes - reminderMinutes);
    
    // For testing, we'll use a 60-minute window. In production, you might use 30 minutes
    return timeDiff <= 60;
  } catch (error) {
    console.error('Error checking reminder time:', error);
    return false;
  }
}

// GET method for testing (you can call this manually)
export async function GET() {
  return NextResponse.json({
    message: 'Daily reminders endpoint is working',
    subscriptionsCount: subscriptions.size,
    currentTime: new Date().toISOString()
  });
}

// Export the subscriptions so the subscribe route can use it
export { subscriptions };
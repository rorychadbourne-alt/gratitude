// app/api/push/send-daily-reminders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { subscriptionStorage } from 'lib/subscriptions';

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  'mailto:rorychadbourne@gmail.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  // Security: Only allow POST requests with correct auth token
  const authToken = request.headers.get('authorization')?.replace('Bearer ', '');
  
  if (authToken !== process.env.CRON_SECRET_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    console.log(`🕐 Daily reminder check running at ${now.toISOString()}`);

    // Get all active subscriptions
    const allSubscriptions = subscriptionStorage.getWhere(sub => sub.active);
    console.log(`📊 Checking ${allSubscriptions.length} active subscriptions`);

    const results = {
      sent: 0,
      failed: 0,
      skipped: 0,
      total: allSubscriptions.length
    };

    for (const sub of allSubscriptions) {
      try {
        // Check if user should receive notification now
        const shouldSend = shouldSendReminderNow(sub, now);
        
        if (!shouldSend.send) {
          results.skipped++;
          console.log(`⏭️ Skipping ${sub.userId}: ${shouldSend.reason}`);
          continue;
        }

        // Send notification
        const payload = JSON.stringify({
          title: '🌟 Daily Gratitude Time',
          body: 'Take a moment to reflect on what you\'re grateful for today.',
          url: '/',
          tag: 'daily-reminder',
          timestamp: now.getTime(),
          actions: [
            {
              action: 'open',
              title: 'Add Gratitude'
            }
          ]
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
        
        console.log(`✅ Sent reminder to ${sub.userId} at ${sub.reminderTime} (${sub.timezone})`);

      } catch (error: any) {
        console.error(`❌ Failed to send to user ${sub.userId}:`, error);
        results.failed++;
        
        // If subscription is invalid, deactivate it
        if (error.statusCode === 410 || error.statusCode === 404) {
          sub.active = false;
          subscriptionStorage.set(sub.userId, sub);
          console.log(`🚫 Deactivated invalid subscription for user ${sub.userId}`);
        }
      }
    }

    console.log(`📈 Daily reminders completed:`, results);

    return NextResponse.json({
      success: true,
      results,
      timestamp: now.toISOString(),
      message: `Sent ${results.sent} reminders, failed ${results.failed}, skipped ${results.skipped} out of ${results.total} total subscriptions`
    });

  } catch (error: any) {
    console.error('💥 Error in daily reminder system:', error);
    return NextResponse.json({
      error: 'Failed to send daily reminders',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Enhanced logic to check if reminder should be sent now
function shouldSendReminderNow(subscription: any, currentTime: Date): { send: boolean; reason: string } {
  try {
    const userTimezone = subscription.timezone || 'UTC';
    const reminderTime = subscription.reminderTime || '19:00';
    
    // Get current day of week in user's timezone
    const userTime = new Date(currentTime.toLocaleString('en-US', { timeZone: userTimezone }));
    const currentDay = userTime.toLocaleDateString('en-US', { weekday: 'short' });
    
    // Check if today is enabled for reminders
    if (!subscription.reminderDays || !subscription.reminderDays[currentDay]) {
      return { send: false, reason: `${currentDay} not enabled for reminders` };
    }
    
    const userHour = userTime.getHours();
    const userMinute = userTime.getMinutes();
    
    // Parse reminder time
    const [reminderHour, reminderMinute] = reminderTime.split(':').map(Number);
    
    // Check if current time matches reminder time (within 15-minute window)
    const currentMinutes = userHour * 60 + userMinute;
    const reminderMinutes = reminderHour * 60 + reminderMinute;
    const timeDiff = Math.abs(currentMinutes - reminderMinutes);
    
    // Send notification if we're within 15 minutes of reminder time
    if (timeDiff <= 15) {
      return { send: true, reason: `Within reminder window (${timeDiff}min difference)` };
    }
    
    return { 
      send: false, 
      reason: `Outside reminder window (${timeDiff}min difference, user time: ${userHour}:${userMinute.toString().padStart(2, '0')})` 
    };
    
  } catch (error) {
    console.error('Error checking reminder time:', error);
    return { send: false, reason: 'Error checking timing' };
  }
}

// GET method for manual testing
export async function GET() {
  const subscriptions = subscriptionStorage.getAll();
  
  return NextResponse.json({
    message: 'Daily reminders endpoint is ready',
    subscriptionsCount: subscriptionStorage.size(),
    currentTime: new Date().toISOString(),
    subscriptions: subscriptions.map(sub => ({
      userId: sub.userId,
      reminderTime: sub.reminderTime,
      timezone: sub.timezone,
      enabledDays: Object.entries(sub.reminderDays).filter(([, enabled]) => enabled).map(([day]) => day)
    }))
  });
}
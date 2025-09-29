// utils/pushNotifications.ts
// Client-side push notification utilities

import { useState, useEffect } from 'react';

interface UserData {
  userId: string;
  reminderTime?: string;
  reminderDays?: {
    [key: string]: boolean;
  };
  timezone?: string;
}

interface SetupResult {
  success: boolean;
  subscription?: PushSubscription;
  error?: string;
}

class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private vapidPublicKey: string;

  constructor() {
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  }

  // Convert VAPID key to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Check if push notifications are supported
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  // Register service worker
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported');
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.registration);
      
      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported');
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      return true;
    } else if (permission === 'denied') {
      console.log('Notification permission denied');
      throw new Error('Notification permission denied');
    } else {
      console.log('Notification permission dismissed');
      throw new Error('Notification permission not granted');
    }
  }

  // Subscribe to push notifications
  async subscribe(): Promise<PushSubscription> {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    try {
      this.subscription = await this.registration!.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      console.log('Push subscription successful:', this.subscription);
      return this.subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      throw error;
    }
  }

  // Get existing subscription
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    this.subscription = await this.registration!.pushManager.getSubscription();
    return this.subscription;
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    const subscription = await this.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      this.subscription = null;
      console.log('Unsubscribed from push notifications');
      return true;
    }
    
    return false;
  }

  // Send subscription to server
  async sendSubscriptionToServer(subscription: PushSubscription, userData: UserData): Promise<any> {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          userData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }

      const result = await response.json();
      console.log('Subscription sent to server:', result);
      return result;
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      throw error;
    }
  }

  // Remove subscription from server
  async removeSubscriptionFromServer(userId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
      }

      console.log('Subscription removed from server');
      return true;
    } catch (error) {
      console.error('Error removing subscription from server:', error);
      throw error;
    }
  }

  // Complete setup flow
  async setup(userData: UserData): Promise<SetupResult> {
    try {
      // 1. Register service worker
      await this.registerServiceWorker();
      
      // 2. Request permission
      await this.requestPermission();
      
      // 3. Subscribe to push notifications
      const subscription = await this.subscribe();
      
      // 4. Send subscription to server
      await this.sendSubscriptionToServer(subscription, userData);
      
      return {
        success: true,
        subscription
      };
    } catch (error: any) {
      console.error('Push notification setup failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const pushNotificationManager = new PushNotificationManager();

// React hook for push notifications
export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check support
    setIsSupported(pushNotificationManager.isSupported());
    
    // Check permission
    setPermission(pushNotificationManager.getPermissionStatus());
    
    // Check existing subscription
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const subscription = await pushNotificationManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const enableNotifications = async (userData: UserData): Promise<SetupResult> => {
    setLoading(true);
    try {
      const result = await pushNotificationManager.setup(userData);
      if (result.success) {
        setIsSubscribed(true);
        setPermission('granted');
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const disableNotifications = async (userId: string) => {
    setLoading(true);
    try {
      await pushNotificationManager.removeSubscriptionFromServer(userId);
      await pushNotificationManager.unsubscribe();
      setIsSubscribed(false);
    } catch (error) {
      console.error('Error disabling notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    enableNotifications,
    disableNotifications
  };
};
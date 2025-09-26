// lib/subscriptions.ts
// Shared storage for push notification subscriptions
// In production, you'd replace this with a proper database

interface SubscriptionData {
    userId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    reminderTime: string;
    reminderDays: {
      [key: string]: boolean;
    };
    timezone: string;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
  }
  
  // In-memory storage (replace with database in production)
  const subscriptions = new Map<string, SubscriptionData>();
  
  export const subscriptionStorage = {
    // Save or update a subscription
    set: (userId: string, data: SubscriptionData) => {
      subscriptions.set(userId, data);
    },
  
    // Get a subscription by user ID
    get: (userId: string): SubscriptionData | undefined => {
      return subscriptions.get(userId);
    },
  
    // Get all subscriptions
    getAll: (): SubscriptionData[] => {
      return Array.from(subscriptions.values());
    },
  
    // Get subscriptions by criteria
    getWhere: (filter: (sub: SubscriptionData) => boolean): SubscriptionData[] => {
      return Array.from(subscriptions.values()).filter(filter);
    },
  
    // Remove a subscription
    delete: (userId: string): boolean => {
      return subscriptions.delete(userId);
    },
  
    // Get count of subscriptions
    size: (): number => {
      return subscriptions.size;
    },
  
    // Clear all subscriptions (for testing)
    clear: () => {
      subscriptions.clear();
    }
  };
  
  export type { SubscriptionData };
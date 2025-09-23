'use client'

import React from 'react';
import { usePushNotifications } from '../utils/pushNotifications';

export default function NotificationTest() {
  const {
    isSupported,
    permission,
    isSubscribed,
    loading,
    enableNotifications,
    disableNotifications
  } = usePushNotifications();

  const handleEnableNotifications = async () => {
    const result = await enableNotifications({
      userId: 'test-user-123',
      reminderTime: '19:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    if (result.success) {
      alert('🎉 Notifications enabled! You should receive a welcome notification.');
    } else {
      alert('❌ Failed to enable notifications: ' + result.error);
    }
  };

  const handleDisableNotifications = async () => {
    await disableNotifications();
    alert('🔕 Notifications disabled');
  };

  if (!isSupported) {
    return (
      <div style={{ 
        padding: '20px', 
        border: '2px solid #f39c12', 
        borderRadius: '8px', 
        backgroundColor: '#fef9e7',
        margin: '20px 0'
      }}>
        <h3>📱 Push Notifications</h3>
        <p>❌ Push notifications are not supported in your browser.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      border: '2px solid #3498db', 
      borderRadius: '8px', 
      backgroundColor: '#ebf3fd',
      margin: '20px 0'
    }}>
      <h3>📱 Push Notification Test</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Status:</strong>
        <ul>
          <li>Supported: {isSupported ? '✅ Yes' : '❌ No'}</li>
          <li>Permission: {permission === 'granted' ? '✅ Granted' : permission === 'denied' ? '❌ Denied' : '⏳ Not requested'}</li>
          <li>Subscribed: {isSubscribed ? '✅ Yes' : '❌ No'}</li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {!isSubscribed ? (
          <button
            onClick={handleEnableNotifications}
            disabled={loading || permission === 'denied'}
            style={{
              padding: '12px 20px',
              backgroundColor: loading ? '#95a5a6' : '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⏳ Setting up...' : '🔔 Enable Notifications'}
          </button>
        ) : (
          <button
            onClick={handleDisableNotifications}
            disabled={loading}
            style={{
              padding: '12px 20px',
              backgroundColor: loading ? '#95a5a6' : '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⏳ Disabling...' : '🔕 Disable Notifications'}
          </button>
        )}
      </div>

      {permission === 'denied' && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#fadbd8',
          borderRadius: '4px',
          color: '#721c24'
        }}>
          <strong>⚠️ Notifications Blocked</strong>
          <p>Please enable notifications in your browser settings and refresh the page.</p>
        </div>
      )}
    </div>
  );
}
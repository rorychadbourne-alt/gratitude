'use client'

import React, { useState } from 'react';
import { usePushNotifications } from '../utils/pushNotifications';

interface NotificationSettingsProps {
  userId?: string;
  userTimezone?: string;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ 
  userId = 'default-user', 
  userTimezone 
}) => {
  const {
    isSupported,
    permission,
    isSubscribed,
    loading,
    enableNotifications,
    disableNotifications 
  } = usePushNotifications();

  const [savedSettings, setSavedSettings] = useState(false);
  const [testingReminder, setTestingReminder] = useState(false);

  const handleEnableNotifications = async () => {
    const result = await enableNotifications({
      userId,
      reminderTime: '19:00', // Default time for backend
      reminderDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true
      },
      timezone: userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    });

    if (result.success) {
      setSavedSettings(true);
      setTimeout(() => setSavedSettings(false), 3000);
    } else {
      alert('Failed to enable notifications: ' + result.error);
    }
  };

  const handleDisableNotifications = async () => {
    await disableNotifications();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 3000);
  };

  const handleTestReminder = async () => {
    setTestingReminder(true);
    try {
      const response = await fetch('/api/push/test-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Test reminder sent! Check your notifications.');
      } else {
        alert('Failed to send test reminder: ' + result.error);
      }
    } catch (error) {
      alert('Error sending test reminder');
      console.error('Test reminder error:', error);
    } finally {
      setTestingReminder(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="notification-settings unsupported">
        <h3>Daily Reminders</h3>
        <div className="alert alert-warning">
          <p>Push notifications are not supported in your browser. You can still use in-app notifications!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-settings">
      <h3>Daily Reminder Settings</h3>
      
      <div className="notification-status">
        <div className={`status-badge ${isSubscribed ? 'enabled' : 'disabled'}`}>
          {isSubscribed ? '✓ Enabled' : 'Disabled'}
        </div>
        {permission === 'denied' && (
          <p className="warning-text">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        )}
      </div>

      <div className="toggle-section">
        <div className="toggle-card">
          <div className="toggle-content">
            <div className="toggle-info">
              <h4>Daily Gratitude Reminder</h4>
              <p className="toggle-description">
                Receive one notification per day to remind you to add your gratitude entry
              </p>
            </div>
            <div className="toggle-switch-container">
              {!isSubscribed ? (
                <button
                  onClick={handleEnableNotifications}
                  disabled={loading || permission === 'denied'}
                  className="btn btn-primary"
                >
                  {loading ? 'Enabling...' : 'Enable'}
                </button>
              ) : (
                <button
                  onClick={handleDisableNotifications}
                  disabled={loading}
                  className="btn btn-danger"
                >
                  {loading ? 'Disabling...' : 'Disable'}
                </button>
              )}
            </div>
          </div>
          
          {isSubscribed && (
            <div className="test-section">
              <button
                onClick={handleTestReminder}
                disabled={loading || testingReminder}
                className="btn btn-test"
              >
                {testingReminder ? 'Sending...' : 'Send Test Notification'}
              </button>
            </div>
          )}
        </div>
      </div>

      {savedSettings && (
        <div className="success-message">
          ✓ Settings saved successfully!
        </div>
      )}

      <div className="info-section">
        <div className="info-banner">
          <span className="info-icon">ℹ️</span>
          <div>
            <strong>Free Tier Notification</strong>
            <p>Due to free tier limitations, reminders are sent once daily. You'll receive your notification at a consistent time each day.</p>
          </div>
        </div>
        
        <div className="how-it-works">
          <h4>How it works</h4>
          <ul>
            <li>Get one reminder notification per day</li>
            <li>Tap the notification to quickly add your gratitude</li>
            <li>Use the test button to preview your reminder anytime</li>
            <li>Disable anytime if you prefer not to receive reminders</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .notification-settings {
          max-width: 550px;
          padding: 24px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border: 1px solid #e1e5e9;
          margin: 20px 0;
        }

        .notification-settings h3 {
          margin-top: 0;
          margin-bottom: 20px;
          color: #2c3e50;
          font-size: 1.25rem;
        }

        .notification-status {
          margin-bottom: 24px;
        }

        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .status-badge.enabled {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .status-badge.disabled {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .toggle-section {
          margin: 24px 0;
        }

        .toggle-card {
          border: 2px solid #e1e5e9;
          border-radius: 12px;
          padding: 20px;
          background: #f8f9fa;
        }

        .toggle-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .toggle-info {
          flex: 1;
        }

        .toggle-info h4 {
          margin: 0 0 8px 0;
          color: #2c3e50;
          font-size: 1.1rem;
        }

        .toggle-description {
          margin: 0;
          color: #6c757d;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .toggle-switch-container {
          flex-shrink: 0;
        }

        .test-section {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #dee2e6;
        }

        .btn {
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          font-size: 0.9rem;
          text-align: center;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #007bff;
          color: white;
          min-width: 100px;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
          transform: translateY(-1px);
        }

        .btn-danger {
          background: #dc3545;
          color: white;
          min-width: 100px;
        }

        .btn-danger:hover:not(:disabled) {
          background: #c82333;
          transform: translateY(-1px);
        }

        .btn-test {
          background: #17a2b8;
          color: white;
          width: 100%;
        }

        .btn-test:hover:not(:disabled) {
          background: #138496;
          transform: translateY(-1px);
        }

        .success-message {
          background: #d4edda;
          color: #155724;
          padding: 12px 16px;
          border-radius: 8px;
          margin: 16px 0;
          text-align: center;
          border: 1px solid #c3e6cb;
          font-weight: 500;
        }

        .warning-text {
          color: #856404;
          background: #fff3cd;
          padding: 12px 16px;
          border-radius: 8px;
          margin: 12px 0 0 0;
          border: 1px solid #ffeaa7;
          font-size: 0.9rem;
        }

        .info-section {
          margin-top: 28px;
        }

        .info-banner {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: #e7f3ff;
          border-left: 4px solid #2196f3;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .info-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .info-banner strong {
          display: block;
          color: #1976d2;
          margin-bottom: 4px;
        }

        .info-banner p {
          margin: 0;
          color: #1976d2;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .how-it-works {
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
        }

        .how-it-works h4 {
          color: #2c3e50;
          margin: 0 0 12px 0;
          font-size: 1rem;
        }

        .how-it-works ul {
          color: #6c757d;
          line-height: 1.6;
          padding-left: 20px;
          margin: 0;
        }

        .how-it-works li {
          margin-bottom: 6px;
        }

        .alert {
          padding: 16px;
          border-radius: 8px;
          margin: 16px 0;
        }

        .alert-warning {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }

        .unsupported {
          max-width: 400px;
        }

        @media (max-width: 600px) {
          .notification-settings {
            padding: 20px;
            margin: 10px;
          }
          
          .toggle-content {
            flex-direction: column;
            align-items: stretch;
          }

          .toggle-switch-container {
            display: flex;
            justify-content: center;
          }

          .btn-primary, .btn-danger {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationSettings;
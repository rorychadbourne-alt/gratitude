'use client'

import React, { useState, useEffect } from 'react';
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

  const [reminderTime, setReminderTime] = useState('19:00'); // Default 7 PM
  const [reminderDays, setReminderDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true
  });
  const [savedSettings, setSavedSettings] = useState(false);
  const [testingReminder, setTestingReminder] = useState(false);

  const handleEnableNotifications = async () => {
    const result = await enableNotifications({
      userId,
      reminderTime,
      reminderDays,
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

  const handleDayToggle = (day: keyof typeof reminderDays) => {
    setReminderDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReminderTime(e.target.value);
  };

  // Generate time options in 15-minute intervals
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 15, 30, 45]) {
        const timeValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const hourStr = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const minuteStr = minute === 0 ? '00' : minute.toString();
        const timeLabel = `${hourStr}:${minuteStr} ${ampm}`;
        
        options.push({
          value: timeValue,
          label: timeLabel
        });
      }
    }
    return options;
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
          {isSubscribed ? 'Notifications Enabled' : 'Notifications Disabled'}
        </div>
        {permission === 'denied' && (
          <p className="warning-text">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        )}
      </div>

      <div className="settings-section">
        <label htmlFor="reminder-time">
          <strong>Reminder Time</strong>
        </label>
        <select
          id="reminder-time"
          value={reminderTime}
          onChange={handleTimeChange}
          className="time-select"
        >
          {generateTimeOptions().map(time => (
            <option key={time.value} value={time.value}>
              {time.label}
            </option>
          ))}
        </select>
        <p className="help-text">Choose when you'd like your daily gratitude reminder</p>
      </div>

      <div className="settings-section">
        <label><strong>Reminder Days</strong></label>
        <div className="days-selector">
          {Object.entries(reminderDays).map(([day, enabled]) => (
            <label key={day} className="day-checkbox">
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => handleDayToggle(day as keyof typeof reminderDays)}
              />
              <span className="day-label">
                {day.charAt(0).toUpperCase() + day.slice(1, 3)}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="action-buttons">
        {!isSubscribed ? (
          <button
            onClick={handleEnableNotifications}
            disabled={loading || permission === 'denied'}
            className="btn btn-primary"
          >
            {loading ? 'Setting up...' : 'Enable Daily Reminders'}
          </button>
        ) : (
          <div className="enabled-actions">
            <button
              onClick={handleEnableNotifications}
              disabled={loading}
              className="btn btn-secondary"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleDisableNotifications}
              disabled={loading}
              className="btn btn-outline"
            >
              {loading ? 'Disabling...' : 'Disable Reminders'}
            </button>
            <button
              onClick={handleTestReminder}
              disabled={loading || testingReminder}
              className="btn btn-test"
            >
              {testingReminder ? 'Sending...' : 'Send Test Reminder'}
            </button>
          </div>
        )}
      </div>

      {savedSettings && (
        <div className="success-message">
          Settings saved successfully!
        </div>
      )}

      <div className="info-section">
        <h4>How it works</h4>
        <ul>
          <li>Get gentle daily reminders at your chosen time</li>
          <li>Reminders only on the days you select</li>
          <li>Tap the notification to quickly add your gratitude</li>
          <li>No reminders if you've already completed your daily entry</li>
          <li>Use the test button to preview what your reminders will look like</li>
        </ul>
      </div>

      <style jsx>{`
        .notification-settings {
          max-width: 500px;
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

        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
          margin-bottom: 20px;
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

        .settings-section {
          margin: 24px 0;
        }

        .settings-section label {
          display: block;
          margin-bottom: 8px;
          color: #2c3e50;
          font-size: 1rem;
        }

        .time-select {
          padding: 12px 16px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-size: 16px;
          width: 200px;
          background: white;
          transition: border-color 0.2s;
          cursor: pointer;
        }

        .time-select:focus {
          outline: none;
          border-color: #3498db;
        }

        .help-text {
          color: #6c757d;
          font-size: 14px;
          margin-top: 6px;
          font-style: italic;
        }

        .days-selector {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 12px;
        }

        .day-checkbox {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .day-checkbox:hover {
          background-color: #f8f9fa;
        }

        .day-checkbox input[type="checkbox"] {
          margin: 0;
        }

        .day-label {
          font-weight: 500;
          color: #495057;
          font-size: 0.9rem;
        }

        .action-buttons {
          margin: 28px 0 20px 0;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          font-size: 0.95rem;
          text-align: center;
          text-decoration: none;
          display: inline-block;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #28a745;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #1e7e34;
          transform: translateY(-1px);
        }

        .btn-outline {
          background: white;
          color: #dc3545;
          border: 2px solid #dc3545;
        }

        .btn-outline:hover:not(:disabled) {
          background: #dc3545;
          color: white;
          transform: translateY(-1px);
        }

        .btn-test {
          background: #17a2b8;
          color: white;
        }

        .btn-test:hover:not(:disabled) {
          background: #138496;
          transform: translateY(-1px);
        }

        .enabled-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
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
          margin: 12px 0;
          border: 1px solid #ffeaa7;
          font-size: 0.9rem;
        }

        .info-section {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e9ecef;
        }

        .info-section h4 {
          color: #2c3e50;
          margin-bottom: 12px;
          font-size: 1rem;
        }

        .info-section ul {
          color: #6c757d;
          line-height: 1.6;
          padding-left: 20px;
          margin: 0;
        }

        .info-section li {
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
          
          .enabled-actions {
            flex-direction: column;
          }
          
          .time-select {
            width: 100%;
            max-width: 250px; 
          }

          .days-selector {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationSettings;
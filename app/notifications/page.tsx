import NotificationSettings from '../../components/NotificationSettings';

export default function NotificationsPage() {
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Notification Settings</h1>
      <NotificationSettings userId="test-user-123" />
    </div>
  );
}
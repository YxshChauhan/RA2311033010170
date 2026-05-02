"use client";

import NotificationCard from "./NotificationCard";

export default function PriorityPanel({ notifications, onToggleSeen }) {
  return (
    <section className="priority-panel">
      <div className="panel-header">
        <span className="panel-icon">⭐</span>
        <h2 className="panel-title">Priority Inbox</h2>
        <span className="panel-badge">{notifications.length}</span>
      </div>
      {notifications.length === 0 ? (
        <div className="empty-state">
          <span>No priority notifications</span>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => (
            <NotificationCard key={n.id} notification={n} onToggleSeen={onToggleSeen} />
          ))}
        </div>
      )}
    </section>
  );
}

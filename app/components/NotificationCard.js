"use client";

const TYPE_META = {
  Placement: { icon: "🏆", color: "placement" },
  Result:    { icon: "📊", color: "result" },
  Event:     { icon: "📅", color: "event" },
};

function formatTime(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (isNaN(d)) return ts;
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function NotificationCard({ notification, onToggleSeen }) {
  const { id, type, message, timestamp, seen } = notification;
  const meta = TYPE_META[type] ?? { icon: "🔔", color: "default" };

  return (
    <div
      className={`notif-card notif-${meta.color}${seen ? " seen" : " unseen"}`}
      onClick={() => onToggleSeen(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onToggleSeen(id)}
      aria-label={`Notification: ${message}. Mark as ${seen ? "unseen" : "seen"}`}
    >
      <div className="notif-left">
        <span className="notif-icon">{meta.icon}</span>
        <div className="notif-body">
          <div className="notif-meta-row">
            <span className={`notif-type-badge badge-${meta.color}`}>{type}</span>
            <span className="notif-id">#{id}</span>
          </div>
          <p className="notif-message">{message}</p>
          <span className="notif-time">{formatTime(timestamp)}</span>
        </div>
      </div>
      <div className="notif-right">
        <span className={`seen-dot ${seen ? "dot-seen" : "dot-unseen"}`}
          title={seen ? "Seen" : "Unseen"} />
      </div>
    </div>
  );
}

"use client";

export default function Navbar({ totalUnseen }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-icon">⚡</span>
        <span className="navbar-title">Campus Pulse</span>
      </div>
      <div className="navbar-right">
        {totalUnseen > 0 && (
          <span className="unseen-badge">{totalUnseen} new</span>
        )}
        <span className="navbar-sub">Notification Center</span>
      </div>
    </nav>
  );
}

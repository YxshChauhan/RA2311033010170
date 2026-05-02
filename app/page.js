"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "./components/Navbar";
import Filters from "./components/Filters";
import PriorityPanel from "./components/PriorityPanel";
import NotificationCard from "./components/NotificationCard";
import { fetchNotifications, sortByPriority, filterNotifications } from "../services/api";
import logger from "../utils/logger";

export default function HomePage() {
  const [notifications, setNotifications] = useState([]);
  const [seenIds, setSeenIds] = useState(new Set());
  const [activeFilter, setActiveFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchNotifications();
        logger.info("Notifications loaded into state", { count: data.length });
        setNotifications(data);
      } catch (err) {
        logger.error("Failed to load notifications", { error: err.message });
        setError("Could not load notifications. Please try again later.");
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggleSeen = useCallback((id) => {
    setSeenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }, []);

  const markAllSeen = useCallback(() => {
    setSeenIds(new Set(notifications.map((n) => n.id)));
  }, [notifications]);

  // Enrich with seen flag
  const enriched = notifications.map((n) => ({ ...n, seen: seenIds.has(n.id) }));

  // Priority inbox: top 10 sorted by priority
  const prioritySorted = sortByPriority(enriched).slice(0, 10);

  // All notifications: filter + sort by latest timestamp
  const filtered = filterNotifications(enriched, activeFilter);
  const allSorted = [...filtered].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  const totalUnseen = enriched.filter((n) => !n.seen).length;

  // Counts per filter button
  const counts = {
    All: enriched.length,
    Event: enriched.filter((n) => n.type === "Event").length,
    Result: enriched.filter((n) => n.type === "Result").length,
    Placement: enriched.filter((n) => n.type === "Placement").length,
  };

  return (
    <>
      <Navbar totalUnseen={totalUnseen} />
      <main className="page-wrapper">
        {loading && (
          <div className="loading-wrap">
            <div className="spinner" />
            <span className="loading-text">Loading notifications…</span>
          </div>
        )}

        {!loading && error && (
          <div className="error-wrap">
            <span style={{ fontSize: "2rem" }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Filters row */}
            <div className="filters-wrap">
              <p className="filters-label">Filter by type</p>
              <Filters active={activeFilter} onChange={setActiveFilter} counts={counts} />
            </div>

            {/* Priority Inbox */}
            <PriorityPanel notifications={prioritySorted} onToggleSeen={toggleSeen} />

            {/* All Notifications */}
            <section className="all-panel">
              <div className="panel-header">
                <span className="panel-icon">🔔</span>
                <h2 className="panel-title">All Notifications</h2>
                <span className="panel-badge">{allSorted.length}</span>
              </div>
              {allSorted.length === 0 ? (
                <div className="empty-state">No notifications match this filter.</div>
              ) : (
                <>
                  <div className="notif-list">
                    {allSorted.map((n) => (
                      <NotificationCard key={n.id} notification={n} onToggleSeen={toggleSeen} />
                    ))}
                  </div>
                  {totalUnseen > 0 && (
                    <button className="mark-all-btn" onClick={markAllSeen}>
                      Mark all as seen
                    </button>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}

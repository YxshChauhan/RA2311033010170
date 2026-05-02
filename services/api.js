import logger from "../utils/logger";

const PRIORITY_ORDER = { Placement: 3, Result: 2, Event: 1 };

/**
 * Fetch notifications from the internal API proxy.
 * @returns {Promise<Array>} notifications array
 */
export async function fetchNotifications() {
  try {
    logger.info("Fetching notifications from /api/notifications");
    const res = await fetch("/api/notifications", { cache: "no-store" });

    if (!res.ok) {
      logger.error("API responded with non-OK status", { status: res.status });
      return [];
    }

    const data = await res.json();

    // Handle all possible response shapes from the proxy
    let notifications = [];
    if (Array.isArray(data)) {
      notifications = data;
    } else if (data && Array.isArray(data.notifications)) {
      notifications = data.notifications;
    } else if (data && typeof data === "object") {
      // Find the first array value in the object (any key name)
      const firstArr = Object.values(data).find((v) => Array.isArray(v));
      notifications = firstArr ?? [];
    }

    logger.info("Notifications fetched successfully", { count: notifications.length });
    return notifications;
  } catch (err) {
    logger.error("Failed to fetch notifications", { error: err.message });
    return [];
  }
}

/**
 * Sort notifications by priority type, then by latest timestamp.
 */
export function sortByPriority(notifications) {
  return [...notifications].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.type] ?? 0;
    const pb = PRIORITY_ORDER[b.type] ?? 0;
    if (pb !== pa) return pb - pa;
    return new Date(b.timestamp) - new Date(a.timestamp);
  });
}

/**
 * Filter notifications by type label.
 * @param {Array} notifications
 * @param {"All"|"Event"|"Result"|"Placement"} filter
 */
export function filterNotifications(notifications, filter) {
  if (!filter || filter === "All") return notifications;
  return notifications.filter((n) => n.type === filter);
}

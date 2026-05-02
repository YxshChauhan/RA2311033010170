import logger from "../../../utils/logger";

const AUTH_URL         = process.env.AUTH_URL;
const NOTIFICATIONS_URL = process.env.NOTIFICATIONS_URL;
const CLIENT_ID        = process.env.CLIENT_ID;
const CLIENT_SECRET    = process.env.CLIENT_SECRET;
const ACCESS_CODE      = process.env.ACCESS_CODE;
const EMAIL            = process.env.EMAIL;
const NAME             = process.env.NAME;
const ROLL_NO          = process.env.ROLL_NO;

// Simple in-memory token cache (survives across requests in same server instance)
let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Call /auth to get a fresh Bearer token.
 */
async function getAccessToken() {
  const now = Date.now();

  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && now < tokenExpiresAt - 60_000) {
    logger.info("Using cached access token");
    return cachedToken;
  }

  logger.info("Fetching fresh access token from auth endpoint");

  const body = {
    clientID:     CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    accessCode:   ACCESS_CODE,
    email:        EMAIL,
    name:         NAME,
    rollNo:       ROLL_NO,
  };

  const res = await fetch(AUTH_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
    cache:   "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    logger.error("Auth request failed", { status: res.status, body: text.slice(0, 300) });
    throw new Error(`Auth failed: ${res.status}`);
  }

  const data = await res.json();
  logger.info("Auth response received", { keys: Object.keys(data) });

  // Handle both { access_token } and { token_type, access_token, expires_in }
  const token      = data.access_token ?? data.token ?? data.accessToken;
  const expiresIn  = data.expires_in ?? 900; // default 15 min

  if (!token) {
    logger.error("No token found in auth response", { data });
    throw new Error("Auth response missing token");
  }

  cachedToken    = token;
  tokenExpiresAt = now + expiresIn * 1000;

  logger.info("Access token obtained and cached", { expiresIn });
  return token;
}

/**
 * Recursively find a notifications array from any response shape.
 */
function extractArray(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const knownKeys = ["notifications", "data", "results", "items", "records", "payload", "content", "list"];
    for (const key of knownKeys) {
      if (Array.isArray(data[key])) return data[key];
    }
    const firstArr = Object.values(data).find((v) => Array.isArray(v));
    if (firstArr) return firstArr;
  }
  return [];
}

export async function GET() {
  try {
    // Step 1: get token
    const token = await getAccessToken();

    // Step 2: fetch notifications
    logger.info("Fetching notifications", { url: NOTIFICATIONS_URL });

    const res = await fetch(NOTIFICATIONS_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    logger.info("Notifications response", { status: res.status, contentType: res.headers.get("content-type") });

    if (!res.ok) {
      const text = await res.text();
      logger.error("Notifications API error", { status: res.status, body: text.slice(0, 300) });
      return Response.json({ notifications: [] }, { status: 200 });
    }

    const rawText = await res.text();
    logger.info("Raw notifications preview", { preview: rawText.slice(0, 500) });

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      logger.error("Failed to parse notifications JSON", { error: e.message });
      return Response.json({ notifications: [] }, { status: 200 });
    }

    const notifications = extractArray(data);
    logger.info("Notifications extracted", { count: notifications.length });

    return Response.json({ notifications }, { status: 200 });

  } catch (err) {
    logger.error("Notifications route error", { error: err.message });
    return Response.json({ notifications: [] }, { status: 200 });
  }
}

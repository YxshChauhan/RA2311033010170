const AUTH_URL          = process.env.AUTH_URL;
const NOTIFICATIONS_URL = process.env.NOTIFICATIONS_URL;
const CLIENT_ID         = process.env.CLIENT_ID;
const CLIENT_SECRET     = process.env.CLIENT_SECRET;
const ACCESS_CODE       = process.env.ACCESS_CODE;
const EMAIL             = process.env.EMAIL;
const NAME              = process.env.NAME;
const ROLL_NO           = process.env.ROLL_NO;

export async function GET() {
  const result = { env: {}, auth: {}, notifications: {} };

  // Check env vars are loaded (mask secrets)
  result.env = {
    AUTH_URL:          AUTH_URL ?? "MISSING",
    NOTIFICATIONS_URL: NOTIFICATIONS_URL ?? "MISSING",
    CLIENT_ID:         CLIENT_ID ? CLIENT_ID.slice(0, 8) + "..." : "MISSING",
    CLIENT_SECRET:     CLIENT_SECRET ? "****" : "MISSING",
    ACCESS_CODE:       ACCESS_CODE ?? "MISSING",
    EMAIL:             EMAIL ?? "MISSING",
    ROLL_NO:           ROLL_NO ?? "MISSING",
  };

  // Try auth
  try {
    const authRes = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientID: CLIENT_ID, clientSecret: CLIENT_SECRET, accessCode: ACCESS_CODE, email: EMAIL, name: NAME, rollNo: ROLL_NO }),
      cache: "no-store",
    });
    const authText = await authRes.text();
    let authData;
    try { authData = JSON.parse(authText); } catch { authData = authText; }

    result.auth = {
      status: authRes.status,
      ok: authRes.ok,
      keys: authData && typeof authData === "object" ? Object.keys(authData) : null,
      hasToken: !!(authData?.access_token ?? authData?.token ?? authData?.accessToken),
      preview: typeof authData === "string" ? authData.slice(0, 200) : authData,
    };

    // If auth worked, try notifications
    const token = authData?.access_token ?? authData?.token ?? authData?.accessToken;
    if (token) {
      const notifRes = await fetch(NOTIFICATIONS_URL, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
      });
      const notifText = await notifRes.text();
      let notifData;
      try { notifData = JSON.parse(notifText); } catch { notifData = notifText; }

      result.notifications = {
        status: notifRes.status,
        ok: notifRes.ok,
        topLevelType: Array.isArray(notifData) ? "array" : typeof notifData,
        topLevelKeys: notifData && typeof notifData === "object" && !Array.isArray(notifData) ? Object.keys(notifData) : null,
        count: Array.isArray(notifData) ? notifData.length : null,
        firstItem: Array.isArray(notifData) && notifData.length > 0 ? notifData[0] : 
                   notifData?.notifications?.[0] ?? notifData?.data?.[0] ?? null,
      };
    }
  } catch (err) {
    result.auth.error = err.message;
  }

  return Response.json(result, { status: 200 });
}

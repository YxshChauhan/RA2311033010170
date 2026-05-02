import "./globals.css";

export const metadata = {
  title: "Campus Pulse — Notification Center",
  description: "Smart campus notification hub with priority inbox",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

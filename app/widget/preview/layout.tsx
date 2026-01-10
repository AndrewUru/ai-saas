export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#05070f" }}>{children}</body>
    </html>
  );
}

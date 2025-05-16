// app/some-route/page.tsx

import Newspaper from "@/components/types/Newspaper";

// Optional: prevent layout or dynamic rendering issues
// export const dynamic = "force-static"; // or "force-dynamic" if needed
// export const revalidate = 0; // disable caching

export default function Page() {
  return (
    <html>
      <body style={{ margin: 0, padding: 0 }}>
        <Newspaper />
      </body>
    </html>
  );
}

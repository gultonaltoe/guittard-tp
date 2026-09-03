import { Analytics } from "@vercel/analytics/next";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <Analytics />
    </>
  );
}

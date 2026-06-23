import type { Metadata } from "next";
import "./globals.css";

export const dynamic = 'force-dynamic';


export const metadata: Metadata = {
  title: "EduExpress Social Dashboard",
  description: "Live social media management dashboard for EduExpress International",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

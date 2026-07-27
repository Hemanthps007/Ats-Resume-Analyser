import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume ATS Analyser",
  description: "Analyse your resume against target roles and live job listings.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

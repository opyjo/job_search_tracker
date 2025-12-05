import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Tailor AI | Generate Job-Specific Resumes",
  description:
    "AI-powered resume tailoring tool. Paste a job description and get a customized resume optimized for ATS systems and human recruiters.",
  keywords: [
    "resume",
    "CV",
    "job application",
    "ATS",
    "AI",
    "career",
    "job search",
  ],
  authors: [{ name: "Johnson Ojo" }],
  openGraph: {
    title: "Resume Tailor AI",
    description: "Generate job-specific resumes with AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Satoshi Font */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
          rel="stylesheet"
        />
        {/* JetBrains Mono for code/monospace */}
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

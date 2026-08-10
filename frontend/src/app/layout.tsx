import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SmartHire AI - Enterprise Applicant Tracking System',
  description: 'AI-Powered Resume Shortlisting and ATS Platform. Extract, parse, score and shortlist candidates with Gemini.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NUMU Admin Console | Assessment, Problem Bank & Student Governance',
  description: 'Centralized Administration & Proctoring Portal for the NUMU Ed-Tech Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

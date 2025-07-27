import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import Footer from './components/Footer';

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
});

export const metadata: Metadata = {
  title: 'Patchly | Remote Codebase Auditor',
  description: 'Audit your codebases for known vulnerabilities, hassle-free. Patchly is an AI-powered tool that scans Git repositories to detect security vulnerabilities in open-source dependencies and provides actionable insights. Detect vulnerabilities with no setup required.',
  keywords: 'codebase audit, security vulnerabilities, dependency scanning, AI security, Git repository scanner, open source security, vulnerability detection, automated security audit, CVE scanner, software security, code security analysis, patchly',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
  verification: {
    google: 'snOFUtkJWdWSSOA0DKvRet3UOcQjgm3kEo8tcj1Zn9g',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable}>
      <body className="font-sans">
        {children}
        <Footer />
      </body>
    </html>
  );
}

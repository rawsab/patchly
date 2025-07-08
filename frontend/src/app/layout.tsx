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
  description: 'Audit your codebases for known vulnerabilities, hassle-free.',
  icons: {
    icon: '/favicon.ico',
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

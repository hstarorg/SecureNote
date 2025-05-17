import './globals.css';
import { Inter } from 'next/font/google';

import { ClientWrapper } from './ClientWrapper';
import { WalletConnectProvider } from './WalletConnectProvider';

import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Secure Note',
  description: 'Protect your data with cryptography.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientWrapper>
          <WalletConnectProvider>{children}</WalletConnectProvider>
        </ClientWrapper>
      </body>
    </html>
  );
}

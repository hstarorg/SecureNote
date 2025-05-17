'use client';

import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren } from 'react';
import { WagmiProvider } from 'wagmi';
import { mainnet } from 'wagmi/chains';

import { AppConfig } from './constants';

const queryClient = new QueryClient();

export const config = getDefaultConfig({
  appName: 'SecureNote',
  projectId: AppConfig.walletConnectId,
  chains: [mainnet as any],
  ssr: true // If your dApp uses server side rendering (SSR)
});

export function WalletConnectProvider(props: PropsWithChildren<unknown>) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{props.children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

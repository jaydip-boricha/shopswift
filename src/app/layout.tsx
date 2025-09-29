
'use client';

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { CartProvider } from '@/context/cart-context';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>ShopSwift - Your one-stop shop</title>
        <meta name="description" content="A modern e-commerce platform built with Next.js and Firebase." />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/logo.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#64B5F6" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.variable
        )}
      >
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}

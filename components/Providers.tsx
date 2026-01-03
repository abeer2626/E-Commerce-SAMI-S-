'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { CartProvider } from '@/contexts/CartContext';

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthSessionProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </NextAuthSessionProvider>
  );
}

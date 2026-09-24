// app/providers/QueryProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  
  const [queryClient] = useState(() => new QueryClient({
      defaultOptions: {
          queries: {
              staleTime: 1000 * 5, 
          }
      }
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
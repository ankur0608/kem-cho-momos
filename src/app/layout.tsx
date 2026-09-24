// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

import QueryProvider from './providers/QueryProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kem Cho Momos - Admin Panel",
  description: "Restaurant Management System",
  icons: {
    icon: "/logo.png",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-800`}>
        <QueryProvider>
          {children}
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              className: 'text-sm font-semibold shadow-lg',
              success: {
                style: { background: '#ecfdf5', color: '#065f46' },
              },
              error: {
                style: { background: '#fef2f2', color: '#b91c1c' },
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
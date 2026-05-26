import './globals.css';
import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata = {
  title: 'OneAtlas.dev — AI-Native Internal Tools Platform',
  description: 'Deploy business apps and dashboards instantly using AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

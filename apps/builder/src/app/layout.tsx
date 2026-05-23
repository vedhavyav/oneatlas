import './globals.css';
import React from 'react';

export const metadata = {
  title: 'OneAtlas.dev Builder — Conversational Application Generator',
  description: 'Design, preview, and deploy custom business tools with AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

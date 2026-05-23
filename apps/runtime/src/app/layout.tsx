import './globals.css';
import React from 'react';

export const metadata = {
  title: 'OneAtlas.dev Runtime Engine',
  description: 'AI-Generated operational user interfaces.',
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

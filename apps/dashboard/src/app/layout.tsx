import './globals.css';
import React from 'react';

export const metadata = {
  title: 'OneAtlas.dev — AI-Native Internal Tools Platform',
  description: 'Deploy business apps and dashboards instantly using AI.',
};

// Simple Mock Clerk Provider in case keys are not configured yet
function MockClerkProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  if (hasClerk) {
    try {
      const { ClerkProvider } = require('@clerk/nextjs');
      return (
        <ClerkProvider>
          <html lang="en">
            <body>{children}</body>
          </html>
        </ClerkProvider>
      );
    } catch (e) {
      console.warn("Clerk module load failed:", e);
    }
  }

  // Local fallback provider
  return (
    <html lang="en">
      <body className="antialiased">
        <MockClerkProvider>{children}</MockClerkProvider>
      </body>
    </html>
  );
}

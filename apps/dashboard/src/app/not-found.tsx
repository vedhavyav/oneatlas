import React from 'react';

export const runtime = 'edge';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20 mb-6">
        <span className="font-extrabold text-white text-lg">O</span>
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">404</h1>
      <p className="text-slate-400 mb-6">This page does not exist or has not been deployed yet.</p>
      <a href="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-semibold">
        Return to Dashboard
      </a>
    </div>
  );
}

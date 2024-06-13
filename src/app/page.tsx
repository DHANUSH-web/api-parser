'use client';

import { DownloadIcon, Loader2 } from "lucide-react";
import React from "react";

export default function Home() {
  const [isDownloadComplete, setDownloadTimeout] = React.useState(true);

  const handleDownloadEvent = () => {
    setDownloadTimeout(false);
    setTimeout(() => {
      setDownloadTimeout(true);
    }, 3000);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <button onClick={handleDownloadEvent} className="flex items-center justify-center min-w-28 gap-2 text-sm font-medium bg-black text-white px-4 py-2 rounded-md active:scale-75 duration-200">
        {isDownloadComplete ? "Download" : <Loader2 size={20} className="animate-spin" />}
      </button>
    </main>
  );
}

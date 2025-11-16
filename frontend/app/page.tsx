'use client';

import HomePage from "@/components/HomePage";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HomePage onBrowseCatalog={() => (window.location.href = "/catalog")} />
    </div>
  );
}

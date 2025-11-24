'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import HomePage from '@/components/HomePage';
import Catalog from '@/components/Catalog';
import ProfilePage from '@/components/ProfilePage';


export default function Page() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="max-w-6xl mx-auto p-6">
        {currentPage === 'home' && (
          <HomePage onBrowseCatalog={() => setCurrentPage('catalog')} />
        )}
        
        {currentPage === 'catalog' && (
          <Catalog/>
        )}
        
        {currentPage === 'profile' && (
          <ProfilePage />
        )}
      </main>
    </div>
  );
}
'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import HomePage from '@/components/HomePage';
import Catalog from '@/components/Catalog';
import ProfilePage from '@/components/ProfilePage';
import { Item, Review, items } from '@/types';


export default function Page() {
  const [currentPage, setCurrentPage] = useState('home');
  const [reviews, setReviews] = useState<Review[]>([]);

  const handleAddReview = (name: string, rating: number, comment: string) => {
    if (!name || !comment) return;
    
    const newReview: Review = {
      id: Date.now(),
      itemName: name,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0],
    };
    
    setReviews([newReview, ...reviews]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="max-w-6xl mx-auto p-6">
        {currentPage === 'home' && (
          <HomePage onBrowseCatalog={() => setCurrentPage('catalog')} />
        )}
        
        {currentPage === 'catalog' && (
          <Catalog items={items} />
        )}
        
        {currentPage === 'profile' && (
          <ProfilePage reviews={reviews} onAddReview={handleAddReview} />
        )}
      </main>
    </div>
  );
}
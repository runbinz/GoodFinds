'use client';
import { useState } from 'react';
import { Item, Review, items, categories } from '../types';
import Header from '@/components/Header';
import Catalog from '@/components/Catalog';
import ProfilePage from '@/components/ProfilePage';
import SearchBar from '@/components/SearchBar';
import HomePage from '@/components/HomePage';

export default function Home() {
  const [page, setPage] = useState('home');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [reviews, setReviews] = useState<Review[]>([]);

  const filteredItems = items.filter(item => {
    const match = item.name.toLowerCase().includes(search.toLowerCase());
    const cat = category === 'All' || item.category === category;
    return match && cat;
  });

  const addReview = (name: string, rating: number, comment: string) => {
    if (!name || !comment) return;
    setReviews([
      { 
        id: Date.now(), 
        itemName: name, 
        rating, 
        comment, 
        date: new Date().toISOString().split('T')[0] 
      }, 
      ...reviews
    ]);
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage onBrowseCatalog={() => setPage('catalog')} />;
      case 'catalog':
        return (
          <div>
            <SearchBar
              search={search}
              onSearchChange={setSearch}
              category={category}
              onCategoryChange={setCategory}
              categories={categories}
            />
            <Catalog items={filteredItems} />
          </div>
        );
      case 'profile':
        return <ProfilePage reviews={reviews} onAddReview={addReview} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={page} onPageChange={setPage} />
      <div className="max-w-6xl mx-auto p-6">
        {renderPage()}
      </div>
    </div>
  );
}
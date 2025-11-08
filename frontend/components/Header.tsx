'use client';
import { Home, Grid, User } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Header({ currentPage, onPageChange }: HeaderProps) {
  return (
    <nav className="bg-emerald-600 text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">GoodFinds</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => onPageChange('home')} 
            className="flex items-center gap-2 hover:bg-emerald-700 px-3 py-2 rounded transition-colors"
          >
            <Home size={20} /> Home
          </button>
          <button 
            onClick={() => onPageChange('catalog')} 
            className="flex items-center gap-2 hover:bg-emerald-700 px-3 py-2 rounded transition-colors"
          >
            <Grid size={20} /> Catalog
          </button>
          <button 
            onClick={() => onPageChange('profile')} 
            className="flex items-center gap-2 hover:bg-emerald-700 px-3 py-2 rounded transition-colors"
          >
            <User size={20} /> Profile
          </button>
        </div>
      </div>
    </nav>
  );
}
'use client';
import React from 'react';
import { Home, Grid, User } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export default function Header({ currentPage, onPageChange }: HeaderProps) {
  const { isSignedIn } = useUser();

  return (
    <nav className="bg-emerald-600 text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">GoodFinds</h1>
        <div className="flex gap-4 items-center">
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
          
          {isSignedIn ? (
            <>
              <button 
                onClick={() => onPageChange('profile')} 
                className="flex items-center gap-2 hover:bg-emerald-700 px-3 py-2 rounded transition-colors"
              >
                <User size={20} /> Profile
              </button>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="flex items-center gap-2 hover:bg-emerald-700 px-3 py-2 rounded transition-colors">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Sign Up
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
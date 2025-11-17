'use client';
import React from 'react';
import { Home, Grid, User } from 'lucide-react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

import Link from "next/link";
import { useEffect, useState } from "react";
import { Home, Grid, User, LogIn, UserPlus, LogOut } from "lucide-react";

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkLogin = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  useEffect(() => {
    checkLogin();

    const handler = () => {
      checkLogin();
    };

    window.addEventListener("auth-change", handler);
    return () => window.removeEventListener("auth-change", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth-change"));
  };

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
          </Link>

          <Link href="/catalog" className="flex items-center gap-2 hover:bg-emerald-700 px-3 py-2 rounded">
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

"use client";

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

  return (
    <nav className="bg-emerald-600 text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Link href="/">GoodFinds</Link>
        </h1>

        <div className="flex gap-4">
          <Link href="/" className="flex items-center gap-2 hover:bg-emerald-700 px-3 py-2 rounded">
            <Home size={20} /> Home
          </Link>

          <Link href="/catalog" className="flex items-center gap-2 hover:bg-emerald-700 px-3 py-2 rounded">
            <Grid size={20} /> Catalog
          </Link>

          {isLoggedIn ? (
            <>
              <Link href="/profile" className="flex items-center gap-2 hover:bg-emerald-700 px-3 py-2 rounded">
                <User size={20} /> Profile
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 hover:bg-emerald-700 px-3 py-2 rounded"
              >
                <LogOut size={20} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="flex items-center gap-2 hover:bg-emerald-700 px-3 py-2 rounded">
                <LogIn size={20} /> Sign In
              </Link>

              <Link href="/register" className="flex items-center gap-2 hover:bg-emerald-700 px-3 py-2 rounded">
                <UserPlus size={20} /> Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

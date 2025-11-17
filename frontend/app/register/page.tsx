'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://127.0.0.1:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Registration failed");
        return;
      }

      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);

    } catch (err) {
      setError("Network error, please try again");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow mt-10">

      <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

      {error && (
        <p className="text-red-600 mb-4">{error}</p>
      )}

      {success && (
        <p className="text-green-600 mb-4">{success}</p>
      )}

      <form onSubmit={handleRegister} className="space-y-4">

        <div>
          <label className="block text-gray-700 mb-1">Username</label>
          <input 
            type="text"
            className="w-full border px-3 py-2 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input 
            type="email"
            className="w-full border px-3 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-1">Password</label>
          <input 
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button 
          type="submit"
          className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700"
        >
          Register
        </button>

      </form>

      <p className="text-center mt-4">
        Already have an account?
        <a href="/login" className="text-emerald-600 ml-1 underline">
          Sign In
        </a>
      </p>

    </div>
  );
}

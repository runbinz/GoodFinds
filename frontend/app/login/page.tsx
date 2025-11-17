"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "Login failed");
        return;
      }

      const data = await res.json();

      localStorage.setItem("token", data.token);

      window.dispatchEvent(new Event("auth-change"));

      router.push("/");
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">Sign In</h1>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}

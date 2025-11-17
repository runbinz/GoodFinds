'use client';

import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import Catalog from "@/components/Catalog";
import { Item, categories } from "@/types";

export default function CatalogPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await fetch("http://127.0.0.1:8000/posts");
        if (!res.ok) throw new Error("Failed to fetch items");
        const data = await res.json();

        const formatted = data.map((p: any) => ({
          id: p.id,
          name: p.item_title,
          category: p.category || "Other",
          price: 0, 
          images: p.images || [],
        }));

        setItems(formatted);
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    const match = item.name.toLowerCase().includes(search.toLowerCase());
    const cat = category === "All" || item.category === category;
    return match && cat;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-gray-500">
        Loading items...
      </div>
    );
  }

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
}

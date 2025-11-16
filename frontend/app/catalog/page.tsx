'use client';

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import Catalog from "@/components/Catalog";
import { items, categories } from "@/types";

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredItems = items.filter(item => {
    const match = item.name.toLowerCase().includes(search.toLowerCase());
    const cat = category === "All" || item.category === category;
    return match && cat;
  });

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

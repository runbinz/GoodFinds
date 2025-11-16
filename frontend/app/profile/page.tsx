'use client';

import { useState } from "react";
import ProfilePage from "@/components/ProfilePage";
import { Review } from "@/types";

export default function Profile() {
  const [reviews, setReviews] = useState<Review[]>([]);

  const addReview = (name: string, rating: number, comment: string) => {
    if (!name || !comment) return;

    setReviews([
      {
        id: Date.now(),
        itemName: name,
        rating,
        comment,
        date: new Date().toISOString().split("T")[0]
      },
      ...reviews
    ]);
  };

  return <ProfilePage reviews={reviews} onAddReview={addReview} />;
}

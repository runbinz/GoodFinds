'use client';
import { useState } from 'react';

interface ReviewFormProps {
  onSubmit: (name: string, rating: number, comment: string) => void;
}

export default function ReviewForm({ onSubmit }: ReviewFormProps) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit(name, rating, comment);
    setName('');
    setRating(5);
    setComment('');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-xl font-bold mb-4">Leave a Review</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">User Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Rating</label>
          <select 
            value={rating} 
            onChange={(e) => setRating(Number(e.target.value))} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            {[5, 4, 3, 2, 1].map(n => (
              <option key={n} value={n}>{n} Stars</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <button 
          onClick={handleSubmit} 
          className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
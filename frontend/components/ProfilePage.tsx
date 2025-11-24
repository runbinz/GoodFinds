import React from 'react';
import { useUser } from '@clerk/clerk-react';

export default function ProfilePage() {
  const { user, isSignedIn } = useUser();

  if (!isSignedIn) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <p className="text-gray-600">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
        <p className="text-gray-600 mb-2">Username: {user.username || user.firstName || 'User'}</p>
        <p className="text-gray-600 mb-2">Email: {user.primaryEmailAddress?.emailAddress}</p>
      </div>
    </div>
  );
}
import { Package, Users, Heart } from 'lucide-react';

interface HomePageProps {
  onBrowseCatalog: () => void;
}

export default function HomePage({ onBrowseCatalog }: HomePageProps) {
  return (
    <div className="space-y-10">
      <div className="bg-emerald-600 text-white rounded-lg p-12 text-center shadow-lg">
        <h2 className="text-5xl font-bold mb-4">Welcome to GoodFinds</h2>
        <p className="text-2xl mb-2">Find Hidden Treasures!</p>
        <p className="text-lg mb-8 opacity-90">Give items a second life and discover amazing finds in your community</p>
        <button 
          onClick={onBrowseCatalog} 
          className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-md text-lg"
        >
          Browse Catalog
        </button>
      </div>

      <div>
        <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">Why GoodFinds?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Package className="text-emerald-600" size={24} />
            </div>
            <h4 className="text-xl font-semibold mb-2 text-gray-800">Free Items</h4>
            <p className="text-gray-600">Discover quality items available for free. From furniture to electronics, find what you need.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Heart className="text-emerald-600" size={24} />
            </div>
            <h4 className="text-xl font-semibold mb-2 text-gray-800">Reduce Waste</h4>
            <p className="text-gray-600">Give items a second life instead of throwing them away. Help create a sustainable community.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Users className="text-emerald-600" size={24} />
            </div>
            <h4 className="text-xl font-semibold mb-2 text-gray-800">Community</h4>
            <p className="text-gray-600">Connect and build a stronger local community.</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-8">
        <h3 className="text-3xl font-bold text-center mb-8 text-gray-800">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-emerald-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
            <h4 className="font-semibold text-lg mb-2 text-gray-800">Sign Up</h4>
            <p className="text-gray-600">Create your free account in seconds</p>
          </div>

          <div className="text-center">
            <div className="bg-emerald-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
            <h4 className="font-semibold text-lg mb-2 text-gray-800">Browse</h4>
            <p className="text-gray-600">Explore available items near you</p>
          </div>

          <div className="text-center">
            <div className="bg-emerald-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
            <h4 className="font-semibold text-lg mb-2 text-gray-800">Claim</h4>
            <p className="text-gray-600">Reserve items you want instantly</p>
          </div>

          <div className="text-center">
            <div className="bg-emerald-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">4</div>
            <h4 className="font-semibold text-lg mb-2 text-gray-800">Pick Up</h4>
            <p className="text-gray-600">Pickup at the location posted</p>
          </div>
        </div>
      </div>
    </div>
  );
}
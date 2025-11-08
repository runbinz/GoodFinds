interface HomePageProps {
  onBrowseCatalog: () => void;
}

export default function HomePage({ onBrowseCatalog }: HomePageProps) {
  return (
    <div>
      <div className="bg-emerald-600 text-white rounded-lg p-12 text-center mb-8">
        <h2 className="text-4xl font-bold mb-4">Welcome to GoodFinds</h2>
        <p className="text-xl mb-6">Find Hidden Treasures!</p>
        <button 
          onClick={onBrowseCatalog} 
          className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Browse Catalog
        </button>
      </div>
    </div>
  );
}
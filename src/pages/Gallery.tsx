import { Search, Filter, MoreHorizontal, Heart, Download } from 'lucide-react';

const assets = [
  { id: 1, height: 'h-64', color: 'bg-red-100', title: 'Cyberpunk City' },
  { id: 2, height: 'h-96', color: 'bg-blue-100', title: 'Abstract Waves' },
  { id: 3, height: 'h-72', color: 'bg-green-100', title: 'Forest Mist' },
  { id: 4, height: 'h-80', color: 'bg-yellow-100', title: 'Golden Hour' },
  { id: 5, height: 'h-60', color: 'bg-purple-100', title: 'Neon Lights' },
  { id: 6, height: 'h-96', color: 'bg-indigo-100', title: 'Deep Space' },
  { id: 7, height: 'h-72', color: 'bg-pink-100', title: 'Sakura Bloom' },
  { id: 8, height: 'h-64', color: 'bg-orange-100', title: 'Desert Dunes' },
  { id: 9, height: 'h-80', color: 'bg-teal-100', title: 'Ocean Depth' },
  { id: 10, height: 'h-72', color: 'bg-gray-100', title: 'Minimalist Architecture' },
  { id: 11, height: 'h-64', color: 'bg-lime-100', title: 'Citrus Splash' },
  { id: 12, height: 'h-96', color: 'bg-sky-100', title: 'Cloud Formation' },
];

export default function Gallery() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Asset Gallery</h1>
          <p className="text-gray-500">Your collection of generated masterpieces</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search assets..." 
              className="pl-10 pr-4 py-2 rounded-full border border-black/10 focus:outline-none focus:ring-2 focus:ring-black/5 w-64"
            />
          </div>
          <button className="p-2 border border-black/10 rounded-full hover:bg-gray-50">
            <Filter size={20} />
          </button>
        </div>
      </header>

      {/* Masonry Layout using CSS Columns */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
        {assets.map((asset) => (
          <div 
            key={asset.id} 
            className="break-inside-avoid relative group rounded-3xl overflow-hidden cursor-pointer"
          >
            <div className={`w-full ${asset.height} ${asset.color} transition-transform duration-500 group-hover:scale-105`}>
              {/* Placeholder Image Content */}
              <div className="w-full h-full flex items-center justify-center opacity-20 font-bold text-4xl tracking-tighter">
                AI
              </div>
            </div>
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <div className="flex justify-between items-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div>
                  <h3 className="text-white font-medium">{asset.title}</h3>
                  <p className="text-white/70 text-xs">Generated 2h ago</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-colors">
                    <Heart size={16} />
                  </button>
                  <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-colors">
                    <Download size={16} />
                  </button>
                </div>
              </div>
              
              <button className="absolute top-4 right-4 p-2 text-white/70 hover:text-white">
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Wand2 } from 'lucide-react';

const inspirationItems = [
  {
    id: 1,
    title: "Modern Banking Hall",
    prompt: "A futuristic modern banking hall with sleek glass counters, warm ambient lighting, marble floors, busy professionals, wide angle shot, 8k resolution, architectural photography",
    image: "bg-gradient-to-br from-gray-800 to-gray-900"
  },
  {
    id: 2,
    title: "Corporate Brainstorming",
    prompt: "Diverse team of professionals brainstorming in a sunlit glass meeting room, whiteboard with colorful diagrams, casual business attire, depth of field, candid shot",
    image: "bg-gradient-to-br from-blue-900 to-blue-800"
  },
  {
    id: 3,
    title: "Tech Conference Stage",
    prompt: "Ted-talk style stage design, large LED screens displaying data visualization, spotlight on speaker, dark audience foreground, vibrant purple and blue stage lighting",
    image: "bg-gradient-to-br from-purple-900 to-indigo-900"
  },
  {
    id: 4,
    title: "Private Wealth Lounge",
    prompt: "Luxury private banking lounge, leather armchairs, mahogany wood paneling, soft warm lighting, expensive art on walls, whiskey glass on table, cinematic atmosphere",
    image: "bg-gradient-to-br from-amber-900 to-orange-900"
  },
  {
    id: 5,
    title: "Fintech Startup Office",
    prompt: "Open plan office, industrial loft style, brick walls, hanging plants, standing desks, young creative people working on macbooks, natural light, modern furniture",
    image: "bg-gradient-to-br from-emerald-900 to-teal-900"
  },
  {
    id: 6,
    title: "Global Trading Floor",
    prompt: "Busy stock exchange trading floor, multiple monitors per desk, stock tickers, high energy, motion blur people, cool blue tones, cyberpunk aesthetic",
    image: "bg-gradient-to-br from-cyan-900 to-blue-950"
  },
];

export default function Inspiration() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8 max-w-[1600px] mx-auto">
      <header className="mb-12">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Sparkles className="text-accent-primary" />
          Inspiration Gallery
        </h1>
        <p className="text-gray-500 text-lg">Explore curated scenarios for banking and corporate environments</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {inspirationItems.map((item) => (
          <div 
            key={item.id} 
            className="group relative h-[400px] rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 border border-black/5"
          >
            {/* Placeholder Image Background */}
            <div className={`absolute inset-0 ${item.image} transition-transform duration-700 group-hover:scale-105`}>
               <div className="w-full h-full flex items-center justify-center text-white/10 font-bold text-6xl">
                 AI
               </div>
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-white/70 line-clamp-2 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                  {item.prompt}
                </p>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/text-to-image', { state: { prompt: item.prompt } });
                  }}
                  className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-accent-promotion hover:text-white transition-all duration-300 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                >
                  <Wand2 size={20} />
                  Make Similar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

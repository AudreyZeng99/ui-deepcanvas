import { useNavigate } from 'react-router-dom';
import { Wand2, LayoutTemplate } from 'lucide-react';

const inspirationCategories = [
  {
    id: 'backgrounds',
    title: '背景底图',
    items: [
      {
        id: 'bg-1',
        title: "Modern Banking Hall",
        prompt: "A futuristic modern banking hall with sleek glass counters, warm ambient lighting, marble floors, busy professionals, wide angle shot, 8k resolution, architectural photography",
        image: "bg-gradient-to-br from-gray-800 to-gray-900",
        imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=800&q=80"
      },
      {
        id: 'bg-2',
        title: "Global Network",
        prompt: "Abstract technology background, circuit board patterns, glowing blue lines, dark background, 8k resolution",
        image: "bg-gradient-to-br from-blue-900 to-slate-900",
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"
      },
      {
        id: 'bg-3',
        title: "Nature Landscape",
        prompt: "Close up texture of green leaves, water droplets, fresh nature background, high detail, macro photography",
        image: "bg-gradient-to-br from-green-800 to-emerald-900",
        imageUrl: "https://images.unsplash.com/photo-1501854140884-074bf86ee911?w=800&q=80"
      },
      {
        id: 'bg-4',
        title: "Urban Cityscape",
        prompt: "Cyberpunk city street, neon lights, rain, futuristic cars, night time, cinematic shot",
        image: "bg-gradient-to-br from-purple-900 to-indigo-900",
        imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80"
      },
      {
        id: 'bg-5',
        title: "Minimalist Studio",
        prompt: "Clean minimalist interior, white walls, soft shadows, plant in corner, wooden floor",
        image: "bg-gradient-to-br from-gray-100 to-white",
        imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
      }
    ]
  },
  {
    id: 'materials',
    title: '素材制作',
    items: [
      {
        id: 'mat-1',
        title: "Frosted Glass 2025",
        prompt: "Number 2025 made of frosted glass, soft lighting, depth of field, 3d render, abstract background",
        image: "bg-gradient-to-br from-purple-600 to-pink-600",
        imageUrl: "https://images.unsplash.com/photo-1633511090164-b43840ea1607?w=800&q=80"
      },
      {
        id: 'mat-2',
        title: "3D White Horse",
        prompt: "White horse statue, 3d render style, minimalist, studio lighting, soft shadows, elegant",
        image: "bg-gradient-to-br from-orange-400 to-red-500",
        imageUrl: "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80"
      },
      {
        id: 'mat-3',
        title: "Glass Morphism",
        prompt: "Glass morphism UI elements, frosted glass effect, blur, transparency, modern design",
        image: "bg-gradient-to-br from-cyan-400 to-blue-500",
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80"
      },
      {
        id: 'mat-4',
        title: "3D Shapes",
        prompt: "Abstract 3D geometric shapes, floating, colorful, matte finish, high quality render",
        image: "bg-gradient-to-br from-pink-400 to-purple-500",
        imageUrl: "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=800&q=80"
      },
      {
        id: 'mat-5',
        title: "Liquid Metal",
        prompt: "Liquid metal texture, chrome, reflective, flowing, abstract art, silver and gold",
        image: "bg-gradient-to-br from-gray-300 to-gray-500",
        imageUrl: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800&q=80"
      }
    ]
  },
  {
    id: 'marketing',
    title: '营销海报',
    items: [
      {
        id: 'mkt-1',
        title: "Product Launch",
        prompt: "Product launch poster, sleek modern product, dramatic lighting, bold typography, minimalist design",
        image: "bg-gradient-to-br from-indigo-600 to-purple-700"
      },
      {
        id: 'mkt-2',
        title: "Sale Event",
        prompt: "Big sale event poster, vibrant colors, confetti, bold percentage signs, excitement",
        image: "bg-gradient-to-br from-red-600 to-orange-600"
      },
      {
        id: 'mkt-3',
        title: "Webinar Promo",
        prompt: "Webinar promotion banner, professional speaker photo, clean layout, corporate colors",
        image: "bg-gradient-to-br from-blue-600 to-indigo-600"
      }
    ]
  },
  {
    id: 'festivals',
    title: '节日节气',
    items: [
      {
        id: 'fest-1',
        title: "Chinese New Year",
        prompt: "Chinese New Year celebration, red lanterns, gold ingots, dragon dance, festive atmosphere",
        image: "bg-gradient-to-br from-red-800 to-yellow-600"
      },
      {
        id: 'fest-2',
        title: "Mid-Autumn Festival",
        prompt: "Mid-Autumn Festival, full moon, mooncakes, rabbits, traditional chinese painting style",
        image: "bg-gradient-to-br from-indigo-900 to-blue-800"
      },
      {
        id: 'fest-3',
        title: "Christmas",
        prompt: "Christmas scene, decorated christmas tree, snow, fireplace, cozy atmosphere, warm lighting",
        image: "bg-gradient-to-br from-green-900 to-red-900"
      }
    ]
  },
  {
    id: 'more',
    title: '更多',
    items: [
      {
        id: 'more-1',
        title: "Cyberpunk City",
        prompt: "Cyberpunk city street, neon lights, rain, futuristic cars, night time, cinematic shot",
        image: "bg-gradient-to-br from-fuchsia-900 to-purple-900"
      },
      {
        id: 'more-2',
        title: "Fantasy Landscape",
        prompt: "Fantasy landscape, floating islands, waterfalls, magical creatures, dreamlike atmosphere",
        image: "bg-gradient-to-br from-teal-800 to-cyan-800"
      },
      {
        id: 'more-3',
        title: "Space Exploration",
        prompt: "Space exploration, astronaut, distant planets, nebula, stars, sci-fi art",
        image: "bg-gradient-to-br from-slate-900 to-black"
      }
    ]
  }
];

export default function Inspiration() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-8 max-w-[1600px] mx-auto">
      <header className="mb-8 flex items-center justify-between">
        <div className="text-xl text-gray-500 font-medium">
          灵感库 <span className="mx-2">|</span> 探索精选的金融与企业场景素材
        </div>
        <button
          onClick={() => navigate('/templates')}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
        >
          <LayoutTemplate size={20} />
          浏览模版库
        </button>
      </header>

      <div className="space-y-16">
        {inspirationCategories.map((category) => (
          <section key={category.id}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-accent-primary rounded-full"></span>
              {category.title}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
              {category.items.map((item) => (
                <div 
                  key={item.id} 
                  className="group relative h-[300px] rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 border border-black/5"
                >
                  {/* Placeholder Image Background */}
                  <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                    {/* @ts-ignore */}
                    {item.imageUrl ? (
                      <img 
                        /* @ts-ignore */
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full ${item.image} flex items-center justify-center text-white/10 font-bold text-6xl`}>
                        AI
                      </div>
                    )}
                  </div>

                  {/* Content Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                      <p className="text-white/70 line-clamp-2 text-sm mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                        {item.prompt}
                      </p>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/text-to-image', { state: { prompt: item.prompt } });
                        }}
                        className="w-full bg-white text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-accent-promotion hover:text-white transition-all duration-300 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 text-sm"
                      >
                        <Wand2 size={16} />
                        做同款
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

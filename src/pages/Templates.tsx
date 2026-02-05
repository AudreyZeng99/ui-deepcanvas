import { useState } from 'react';
import { Search, Camera, ChevronRight, Play, Heart, ChevronDown, Plus } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

// Mock Data Interfaces
interface Template {
  id: string;
  title: string;
  imageUrl: string;
  type?: 'video' | 'image';
  author: {
    name: string;
    avatar: string;
  };
  stats?: {
    views: number;
  };
  tags?: string[];
}

interface Section {
  id: string;
  title: string;
  subtitle: string;
  items: Template[];
}

// Mock Data Generation
const generateMockData = (): Section[] => {
  const categories = [
    {
      id: 'new-arrivals',
      title: '新品推荐',
      subtitle: '模板上新，爆款来袭',
    },
    {
      id: 'cny-2026',
      title: '抢占春节流量C位',
      subtitle: '2026马年爆款营销案例持续更新',
    },
    {
      id: 'daily-hot',
      title: '每日热门',
      subtitle: '今日最受欢迎的设计模板',
    },
    {
      id: 'marketing-banner',
      title: '营销Banner',
      subtitle: '高点击率电商营销Banner',
    },
    {
      id: 'social-media',
      title: '社媒配图',
      subtitle: '朋友圈、小红书吸粉神器',
    },
    {
      id: 'poster-design',
      title: '海报设计',
      subtitle: '活动宣传、节日祝福海报',
    }
  ];

  const authors = [
    { name: '大大大林子lin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { name: '星火YY', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
    { name: 'Ody0', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
    { name: '用户NrUiLk9y', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cal' },
  ];

  // CNY Red/Gold themed images from Unsplash
  const cnyImages = [
    'https://images.unsplash.com/photo-1548625361-9f9392e2133f?q=80&w=400&auto=format&fit=crop', // Red envelope/lanterns
    'https://images.unsplash.com/photo-1518600570419-86927d7f7e0b?q=80&w=400&auto=format&fit=crop', // Red festive
    'https://images.unsplash.com/photo-1611003446057-08c35359146c?q=80&w=400&auto=format&fit=crop', // Red background
    'https://images.unsplash.com/photo-1580259830304-4e4b52583842?q=80&w=400&auto=format&fit=crop', // Red paper cut
    'https://images.unsplash.com/photo-1643285747683-9b98c3635749?q=80&w=400&auto=format&fit=crop', // Chinese knot
    'https://images.unsplash.com/photo-1613426742510-4497e8838507?q=80&w=400&auto=format&fit=crop', // Gold ingot
    'https://images.unsplash.com/photo-1643940889271-70337c76742b?q=80&w=400&auto=format&fit=crop', // Tiger/Animal
    'https://images.unsplash.com/photo-1548126959-1c9f71c4c95f?q=80&w=400&auto=format&fit=crop', // Lanterns
  ];

  return categories.map((cat, catIndex) => ({
    ...cat,
    items: Array.from({ length: 12 }).map((_, i) => ({
      id: `${cat.id}-${i}`,
      title: `CNY Template ${i}`,
      imageUrl: cnyImages[(catIndex * 8 + i) % cnyImages.length],
      type: i % 3 === 0 ? 'video' : 'image',
      author: authors[i % authors.length],
      stats: {
        views: Math.floor(Math.random() * 10000),
      },
    })),
  }));
};

const sections = generateMockData();

const TemplateCard = ({ item }: { item: Template }) => {
  return (
    <div className="flex-shrink-0 w-full group cursor-pointer flex flex-col gap-2">
      {/* Card Image Container */}
      <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-100 border border-gray-100 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-full object-cover"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        
        {item.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white">
              <Play size={20} fill="currentColor" />
            </div>
          </div>
        )}

        {/* Hover Actions - Optional */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <button className="p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-700">
             <Heart size={14} />
           </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-2 px-1">
        <img 
          src={item.author.avatar} 
          alt={item.author.name} 
          className="w-5 h-5 rounded-full bg-gray-200"
        />
        <span className="text-xs text-gray-500 truncate flex-1">{item.author.name}</span>
        {/* Optional: Views/More */}
        {/* <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={14} />
        </button> */}
      </div>
    </div>
  );
};

export default function Templates() {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [visibleSectionsCount, setVisibleSectionsCount] = useState(3);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleLoadMore = () => {
    setVisibleSectionsCount(prev => Math.min(prev + 3, sections.length));
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full px-8 py-6 space-y-10 pb-20">
          
          {/* Standard Header */}
          <header className="mb-8 flex items-center justify-between">
            <div className="text-xl text-gray-500 font-medium">
              模版社区 <span className="mx-2">|</span> 探索高质量设计模版，激发无限创意
            </div>
            <button onClick={() => navigate('/editor')} className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
              <Plus size={20} />
              创建新设计
            </button>
          </header>

          {/* Search Bar */}
          <div className="relative group max-w-2xl">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="搜索模版、风格或场景..." 
              className="w-full h-12 pl-12 pr-12 bg-gray-50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-black/10 rounded-xl outline-none transition-all text-sm"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
              <Camera size={20} />
            </button>
          </div>

          {sections.slice(0, visibleSectionsCount).map((section) => (
            <section key={section.id} className="space-y-4">
              {/* Section Header */}
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                  <p className="text-xs text-gray-500">{section.subtitle}</p>
                </div>
                <button 
                  onClick={() => toggleSection(section.id)}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                >
                  {expandedSections[section.id] ? '收起' : '更多'} 
                  <ChevronRight 
                    size={14} 
                    className={clsx("transition-transform duration-300", expandedSections[section.id] && "rotate-90")} 
                  />
                </button>
              </div>

              {/* Grid List (No Horizontal Scroll) */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 transition-all duration-300">
                {(expandedSections[section.id] ? section.items : section.items.slice(0, 6)).map((item) => (
                  <TemplateCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}

          {/* Expand More Button */}
          {visibleSectionsCount < sections.length && (
            <div className="flex justify-center pt-8">
              <button 
                onClick={handleLoadMore}
                className="flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full font-medium transition-colors"
              >
                展开更多
                <ChevronDown size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

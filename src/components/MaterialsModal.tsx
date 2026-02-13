import { useState } from 'react';
import { 
  X, Search, Upload, 
  Package, ChevronLeft, ChevronRight,
  User, Globe, LayoutGrid, Image as ImageIcon,
  FolderOpen
} from 'lucide-react';
import clsx from 'clsx';

interface MaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddElement: (type: string, subType?: string, props?: any, content?: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  personalMaterials: string[];
}

export default function MaterialsModal({ 
  isOpen, 
  onClose, 
  onAddElement, 
  onUpload, 
  personalMaterials 
}: MaterialsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'official' | 'logo' | 'background'>('personal');
  const [currentPage, setCurrentPage] = useState(1);

  if (!isOpen) return null;

  // Mock Data
  const deer1Items = Array.from({ length: 12 }).map((_, i) => ({ 
    id: `deer1-${i}`, 
    label: `小福鹿1-${i+1}`, 
    color: 'bg-orange-50 text-orange-600 border-orange-100' 
  }));
  
  const deer2Items = Array.from({ length: 18 }).map((_, i) => ({ 
    id: `deer2-${i}`, 
    label: `小福鹿2-${i+1}`, 
    color: 'bg-red-50 text-red-600 border-red-100' 
  }));

  // Combine for "Official" pagination demo
  const officialItems = [...deer1Items, ...deer2Items];
  
  const logoItems = [
     { id: 'logo-1', label: 'Bank of Comm.', color: 'bg-blue-50 text-blue-700 border-blue-100' },
     { id: 'logo-2', label: 'Icon Only', color: 'bg-white text-gray-500 border-gray-200' },
     { id: 'logo-3', label: 'White Logo', color: 'bg-gray-800 text-white border-gray-700' },
     { id: 'logo-4', label: 'Blue Logo', color: 'bg-blue-600 text-white border-blue-700' },
     { id: 'logo-5', label: 'Black Logo', color: 'bg-gray-100 text-gray-800 border-gray-200' },
     { id: 'logo-6', label: 'Outline Logo', color: 'bg-transparent text-gray-600 border-gray-400 border-dashed' },
  ];
  
  const backgroundItems = [
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80',
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80',
    'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80',
    'https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?w=400&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&q=80',
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&q=80',
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80',
    'https://images.unsplash.com/photo-1533135096725-51053efc6f29?w=400&q=80',
    'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=400&q=80',
  ];

  const ITEMS_PER_PAGE = 12;

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Upload Banner */}
            <label className="w-full flex items-center justify-center gap-3 p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 hover:border-accent-primary transition-all text-gray-500 hover:text-accent-primary group">
              <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                <Upload size={20} />
              </div>
              <span className="text-sm font-medium">点击上传本地素材</span>
              <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
            </label>
            
            {/* Personal Items Grid */}
            {personalMaterials.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {personalMaterials.map((url, i) => (
                  <button 
                    key={i} 
                    onClick={() => onAddElement('image', 'personal', { src: url })} 
                    className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative group cursor-pointer hover:border-accent-primary hover:shadow-md hover:scale-105 transition-all"
                  >
                    <img src={url} alt="Personal" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white" onClick={(e) => { e.stopPropagation(); /* Add delete handler here if needed */ }}>
                      <X size={14} />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 py-12 bg-gray-50/50 rounded-xl border border-gray-100 border-dashed">
                <FolderOpen size={48} className="mb-3 opacity-20" />
                <p className="text-sm">暂无个人素材</p>
                <p className="text-xs text-gray-400 mt-1">支持 JPG, PNG, GIF 格式</p>
              </div>
            )}
          </div>
        );

      case 'official':
        const OFFICIAL_ITEMS_PER_PAGE = 32;
        const totalPages = Math.ceil(officialItems.length / OFFICIAL_ITEMS_PER_PAGE);
        const currentOfficialItems = officialItems.slice(
          (currentPage - 1) * OFFICIAL_ITEMS_PER_PAGE,
          currentPage * OFFICIAL_ITEMS_PER_PAGE
        );

        return (
          <div className="space-y-4 animate-in fade-in duration-300 flex flex-col h-full">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <h3 className="text-sm font-medium text-gray-500">小福鹿系列 ({officialItems.length})</h3>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-medium text-gray-600">{currentPage} / {totalPages}</span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-8 gap-3 content-start">
              {currentOfficialItems.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => onAddElement('bocom', item.id)} 
                  className={clsx("aspect-square rounded-lg flex items-center justify-center text-[10px] font-bold border hover:shadow-sm hover:scale-105 transition-all p-1", item.color)}
                >
                  <span className="truncate w-full text-center">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="flex-1" />
          </div>
        );

      case 'logo':
        return (
          <div className="grid grid-cols-3 gap-4 animate-in fade-in duration-300">
            {logoItems.map((item) => (
              <button 
                key={item.id} 
                onClick={() => onAddElement('bocom', item.id)} 
                className={clsx("h-24 rounded-xl flex items-center justify-center text-sm font-bold border hover:shadow-md hover:scale-105 transition-all p-4", item.color)}
              >
                {item.label}
              </button>
            ))}
          </div>
        );

      case 'background':
        const bgTotalPages = Math.ceil(backgroundItems.length / ITEMS_PER_PAGE);
        const currentBgItems = backgroundItems.slice(
          (currentPage - 1) * ITEMS_PER_PAGE,
          currentPage * ITEMS_PER_PAGE
        );

        return (
          <div className="space-y-4 animate-in fade-in duration-300">
             {bgTotalPages > 1 && (
                <div className="flex items-center justify-end gap-2 mb-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-medium text-gray-600">{currentPage} / {bgTotalPages}</span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(bgTotalPages, p + 1))}
                    disabled={currentPage === bgTotalPages}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            <div className="grid grid-cols-3 gap-4">
              {currentBgItems.map((url, i) => (
                <div 
                  key={i} 
                  onClick={() => onAddElement('image', undefined, { src: url })} 
                  className="aspect-video bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all group relative border border-gray-100"
                >
                  <img src={url} alt="Background" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-white text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                    点击应用
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-[900px] h-[600px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0 z-20 relative">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent-primary/10 rounded-lg">
              <Package className="text-accent-primary" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">素材百宝箱</h2>
              <p className="text-xs text-gray-500">管理和使用您的创意素材</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent-primary transition-colors" />
              <input 
                type="text" 
                placeholder="搜索素材..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-accent-primary/20 focus:ring-2 focus:ring-accent-primary/10 rounded-full text-sm outline-none transition-all w-64"
              />
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 bg-gray-50 border-r border-gray-100 flex flex-col p-4 gap-6 overflow-y-auto">
            
            {/* Personal Section */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">个人库</div>
              <button 
                onClick={() => handleTabChange('personal')}
                className={clsx(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  activeTab === 'personal' 
                    ? "bg-white text-accent-primary shadow-sm ring-1 ring-gray-100" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <User size={18} />
                个人素材
              </button>
            </div>

            {/* Public Section */}
            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">公共库</div>
              <button 
                onClick={() => handleTabChange('official')}
                className={clsx(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  activeTab === 'official' 
                    ? "bg-white text-accent-primary shadow-sm ring-1 ring-gray-100" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Globe size={18} />
                官方素材
              </button>
              <button 
                onClick={() => handleTabChange('logo')}
                className={clsx(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  activeTab === 'logo' 
                    ? "bg-white text-accent-primary shadow-sm ring-1 ring-gray-100" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <LayoutGrid size={18} />
                品牌标识
              </button>
              <button 
                onClick={() => handleTabChange('background')}
                className={clsx(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  activeTab === 'background' 
                    ? "bg-white text-accent-primary shadow-sm ring-1 ring-gray-100" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <ImageIcon size={18} />
                背景素材
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 bg-white p-6 overflow-y-auto custom-scrollbar">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
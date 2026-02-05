import { useState } from 'react';
import { 
  X, Search, Upload, 
  Package, ChevronDown, ChevronUp
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
  const [isOfficialExpanded, setIsOfficialExpanded] = useState(false);

  if (!isOpen) return null;

  // Mock Data
  const deer1Items = Array.from({ length: 12 }).map((_, i) => ({ 
    id: `deer1-${i}`, 
    label: `小福鹿1-${i+1}`, 
    color: 'bg-orange-50 text-orange-600 border-orange-100' 
  }));
  
  const deer2Items = Array.from({ length: 8 }).map((_, i) => ({ 
    id: `deer2-${i}`, 
    label: `小福鹿2-${i+1}`, 
    color: 'bg-red-50 text-red-600 border-red-100' 
  }));
  
  const logoItems = [
     { id: 'logo-1', label: 'Bank of Comm.', color: 'bg-blue-50 text-blue-700 border-blue-100' },
     { id: 'logo-2', label: 'Icon Only', color: 'bg-white text-gray-500 border-gray-200' },
     { id: 'logo-3', label: 'White Logo', color: 'bg-gray-800 text-white border-gray-700' },
     { id: 'logo-4', label: 'Blue Logo', color: 'bg-blue-600 text-white border-blue-700' },
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
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-[900px] h-[700px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="h-14 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <Package className="text-accent-primary" />
            素材百宝箱
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="搜索素材..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-gray-50 border border-transparent focus:bg-white focus:border-accent-primary/20 rounded-full text-sm outline-none transition-all w-64"
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

        {/* Content - Single Scroll View */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white space-y-10">
          
          {/* 1. Personal Materials (Horizontal Scroll) */}
          <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-4 bg-accent-primary rounded-full"></span>
                个人素材
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {/* Upload Button */}
                  <label className="flex-shrink-0 w-32 h-32 flex flex-col items-center justify-center gap-2 bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 hover:border-accent-primary transition-all text-gray-500 hover:text-accent-primary group">
                      <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                        <Upload size={20} />
                      </div>
                      <span className="text-xs font-medium">上传素材</span>
                      <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                  </label>
                  
                  {/* Personal Items */}
                  {personalMaterials.map((url, i) => (
                      <div key={i} onClick={() => onAddElement('image', 'personal', { src: url })} className="flex-shrink-0 w-32 h-32 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative group cursor-pointer hover:border-accent-primary hover:shadow-md transition-all">
                          <img src={url} alt="Personal" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                  ))}
                  
                  {personalMaterials.length === 0 && (
                    <div className="flex items-center text-sm text-gray-400 italic px-4">
                      暂无上传素材
                    </div>
                  )}
              </div>
          </div>

          <div className="w-full h-px bg-gray-100" />

          {/* 2. Official Materials */}
          <div className="space-y-6">
              <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                    <span className="w-1 h-4 bg-accent-primary rounded-full"></span>
                    官方素材
                  </h3>
                  <button 
                    onClick={() => setIsOfficialExpanded(!isOfficialExpanded)}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-accent-primary transition-colors px-3 py-1 hover:bg-gray-50 rounded-full"
                  >
                    {isOfficialExpanded ? '收起' : '展开更多'}
                    {isOfficialExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
              </div>
              
              <div className={clsx("space-y-8 overflow-hidden transition-all duration-500 ease-in-out", isOfficialExpanded ? "max-h-[2000px]" : "max-h-[360px]")}>
                  {/* Xiao Fu Lu 1 */}
                  <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        分行特色小福鹿1
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-[10px] rounded-full">New</span>
                      </h4>
                      <div className="grid grid-cols-6 gap-4">
                          {deer1Items.map((item) => (
                               <button 
                                 key={item.id} 
                                 onClick={() => onAddElement('bocom', item.id)} 
                                 className={clsx("aspect-square rounded-xl flex items-center justify-center text-xs font-bold border hover:shadow-md hover:scale-105 transition-all", item.color)}
                               >
                                  {item.label}
                               </button>
                          ))}
                      </div>
                  </div>
                   {/* Xiao Fu Lu 2 */}
                  <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-500">小福鹿2</h4>
                      <div className="grid grid-cols-6 gap-4">
                          {deer2Items.map((item) => (
                               <button 
                                 key={item.id} 
                                 onClick={() => onAddElement('bocom', item.id)} 
                                 className={clsx("aspect-square rounded-xl flex items-center justify-center text-xs font-bold border hover:shadow-md hover:scale-105 transition-all", item.color)}
                               >
                                  {item.label}
                               </button>
                          ))}
                      </div>
                  </div>
                   {/* Logo */}
                  <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-500">交行 Logo</h4>
                      <div className="grid grid-cols-4 gap-4">
                          {logoItems.map((item) => (
                               <button 
                                 key={item.id} 
                                 onClick={() => onAddElement('bocom', item.id)} 
                                 className={clsx("h-16 rounded-xl flex items-center justify-center text-sm font-bold border hover:shadow-md hover:scale-105 transition-all", item.color)}
                               >
                                  {item.label}
                               </button>
                          ))}
                      </div>
                  </div>
              </div>
              
              {/* Gradient fade overlay if collapsed */}
              {!isOfficialExpanded && (
                <div className="absolute left-0 right-0 h-24 -mt-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              )}
          </div>

          <div className="w-full h-px bg-gray-100" />

          {/* 3. Background Materials */}
          <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <span className="w-1 h-4 bg-accent-primary rounded-full"></span>
                背景素材
              </h3>
              <div className="grid grid-cols-4 gap-4">
                  {backgroundItems.map((url, i) => (
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

        </div>
      </div>
    </div>
  );
}
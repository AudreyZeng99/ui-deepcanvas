import { useState } from 'react';
import { 
  X, Search, Upload, 
  Shapes, Image as ImageIcon, Type, Package,
  Square, Circle, Triangle, Star, Heart, Hexagon, Octagon,
  Minus, MoveRight, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Smile, MessageCircle, Zap, Cloud, Check, Sun, Moon, Umbrella, Music, Headphones, Camera
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
  const [activeTab, setActiveTab] = useState<'materials' | 'shapes' | 'images' | 'text'>('materials');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-[900px] h-[600px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="h-14 border-b border-gray-100 flex items-center justify-between px-6 bg-white">
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

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 bg-gray-50 border-r border-gray-100 flex flex-col p-2 gap-1">
            {[
              { id: 'materials', label: '我的素材', icon: Package },
              { id: 'shapes', label: '基础形状', icon: Shapes },
              { id: 'images', label: '图片资源', icon: ImageIcon },
              { id: 'text', label: '文本样式', icon: Type },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  activeTab === tab.id 
                    ? "bg-white text-accent-primary shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white">
            
            {activeTab === 'materials' && (
              <div className="space-y-8">
                {/* Personal Materials */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                     <h3 className="text-base font-medium text-gray-800">个人素材</h3>
                     <label className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-lg text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity">
                        <Upload size={14} />
                        上传素材
                        <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                     </label>
                   </div>
                   
                   {personalMaterials.length > 0 ? (
                     <div className="grid grid-cols-4 gap-4">
                        {personalMaterials.map((url, i) => (
                          <div 
                            key={i} 
                            onClick={() => onAddElement('image', 'personal', { src: url })}
                            className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative group cursor-pointer hover:border-accent-primary hover:shadow-md transition-all"
                          >
                             <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </div>
                        ))}
                     </div>
                   ) : (
                     <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400">
                        <Upload size={32} className="mb-2 opacity-50" />
                        <span className="text-sm">暂无个人素材，点击右上角上传</span>
                     </div>
                   )}
                </div>

                {/* BoCom Assets (Moved from sidebar) */}
                <div className="space-y-4">
                   <h3 className="text-base font-medium text-gray-800">分行特色小福鹿</h3>
                   <div className="grid grid-cols-6 gap-4">
                      {['北京', '上海', '广东', '深圳', '江苏', '浙江'].map((branch, i) => (
                        <button 
                         key={i} 
                         onClick={() => onAddElement('bocom', 'branch-' + i)}
                         className="aspect-square bg-white rounded-xl flex flex-col items-center justify-center gap-2 border border-gray-100 hover:border-accent-primary hover:shadow-md transition-all group"
                       >
                          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-sm text-blue-500 font-bold group-hover:scale-110 transition-transform">{branch.slice(0,1)}</div>
                          <span className="text-xs text-gray-500 group-hover:text-gray-800">{branch}</span>
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-base font-medium text-gray-800">交行 Logo</h3>
                   <div className="grid grid-cols-4 gap-4">
                      <button onClick={() => onAddElement('bocom', 'logo-1')} className="h-16 bg-blue-50 rounded-xl flex items-center justify-center text-sm text-blue-700 font-bold border border-blue-100 hover:shadow-md transition-all">Bank of Comm.</button>
                      <button onClick={() => onAddElement('bocom', 'logo-2')} className="h-16 bg-white rounded-xl flex items-center justify-center text-sm text-gray-500 font-bold border border-gray-200 hover:shadow-md transition-all">Icon Only</button>
                      <button onClick={() => onAddElement('bocom', 'logo-3')} className="h-16 bg-gray-800 rounded-xl flex items-center justify-center text-sm text-white font-bold border border-gray-700 hover:shadow-md transition-all">White Logo</button>
                      <button onClick={() => onAddElement('bocom', 'logo-4')} className="h-16 bg-blue-600 rounded-xl flex items-center justify-center text-sm text-white font-bold border border-blue-700 hover:shadow-md transition-all">Blue Logo</button>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'shapes' && (
              <div className="space-y-8">
                {/* Basic Shapes */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-gray-800">基础形状</h3>
                  <div className="grid grid-cols-6 gap-4">
                    {[
                      { icon: Square, label: '正方形', type: 'square' },
                      { icon: clsx, label: '矩形', type: 'rect', customIcon: <div className="w-6 h-4 border-2 border-current rounded-sm" /> },
                      { icon: Circle, label: '圆形', type: 'circle' },
                      { icon: clsx, label: '椭圆形', type: 'ellipse', customIcon: <div className="w-6 h-4 border-2 border-current rounded-full" /> },
                      { icon: Triangle, label: '三角形', type: 'triangle' },
                      { icon: Star, label: '星形', type: 'star' },
                      { icon: Heart, label: '心形', type: 'heart' },
                      { icon: Hexagon, label: '六边形', type: 'hexagon' },
                      { icon: Octagon, label: '八边形', type: 'octagon' },
                    ].map((item, i) => (
                      <button 
                        key={i}
                        onClick={() => onAddElement('shape', item.type)}
                        className="aspect-square flex flex-col items-center justify-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all"
                      >
                        {item.customIcon ? item.customIcon : <item.icon size={28} strokeWidth={1.5} />}
                        <span className="text-xs text-gray-500">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lines & Arrows */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-gray-800">线段与箭头</h3>
                  <div className="grid grid-cols-6 gap-4">
                    {[
                       { icon: Minus, label: '直线段', type: 'line' },
                       { icon: MoveRight, label: '箭头线段', type: 'arrow' },
                       { icon: ArrowUp, label: '上箭头', type: 'arrow-up' },
                       { icon: ArrowDown, label: '下箭头', type: 'arrow-down' },
                       { icon: ArrowLeft, label: '左箭头', type: 'arrow-left' },
                       { icon: ArrowRight, label: '右箭头', type: 'arrow-right' },
                    ].map((item, i) => (
                      <button 
                        key={i}
                        onClick={() => onAddElement('shape', item.type)}
                        className="aspect-square flex flex-col items-center justify-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all"
                      >
                        <item.icon size={28} strokeWidth={1.5} />
                        <span className="text-xs text-gray-500">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icons */}
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-gray-800">常用图标</h3>
                  <div className="grid grid-cols-8 gap-4">
                    {[
                       { icon: Smile, label: '笑脸', type: 'smile' },
                       { icon: MessageCircle, label: '气泡', type: 'bubble' },
                       { icon: Zap, label: '闪电', type: 'zap' },
                       { icon: Cloud, label: '云朵', type: 'cloud' },
                       { icon: Check, label: '对勾', type: 'check' },
                       { icon: Sun, label: '太阳', type: 'sun' },
                       { icon: Moon, label: '月亮', type: 'moon' },
                       { icon: Umbrella, label: '雨伞', type: 'umbrella' },
                       { icon: Music, label: '音乐', type: 'music' },
                       { icon: Headphones, label: '耳机', type: 'headphones' },
                       { icon: Camera, label: '相机', type: 'camera' },
                    ].map((item, i) => (
                      <button 
                        key={i}
                        onClick={() => onAddElement('shape', item.type)}
                        className="aspect-square flex flex-col items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 hover:scale-105 transition-all"
                      >
                        <item.icon size={24} strokeWidth={1.5} />
                        <span className="text-[10px] text-gray-500">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'images' && (
               <div className="space-y-6">
                 <div className="grid grid-cols-3 gap-4">
                    {[
                      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
                      'https://images.unsplash.com/photo-1614850523018-c4fd03882696?w=400&q=80',
                      'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&q=80',
                      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&q=80',
                      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80',
                      'https://images.unsplash.com/photo-1535930749574-1399327ce78f?w=400&q=80'
                    ].map((url, i) => (
                       <div 
                         key={i}
                         onClick={() => onAddElement('image', undefined, { src: url })}
                         className="group relative aspect-video bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                       >
                         <img src={url} alt="Stock" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                         <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                         <div className="absolute bottom-3 left-3 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">
                           Unsplash Image
                         </div>
                       </div>
                    ))}
                 </div>
               </div>
            )}

            {activeTab === 'text' && (
               <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-4">
                     <button 
                       onClick={() => onAddElement('text', undefined, { fontSize: 64, fontWeight: 'bold' }, '添加标题')}
                       className="p-6 bg-gray-50 hover:bg-gray-100 rounded-xl text-left border border-transparent hover:border-black/5 transition-all group"
                     >
                       <span className="text-4xl font-bold text-gray-800 group-hover:text-black">添加标题</span>
                       <p className="text-xs text-gray-400 mt-2">点击添加大号标题文字</p>
                     </button>
                     <button 
                       onClick={() => onAddElement('text', undefined, { fontSize: 32, fontWeight: 'semibold' }, '添加副标题')}
                       className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left border border-transparent hover:border-black/5 transition-all group"
                     >
                       <span className="text-2xl font-semibold text-gray-800 group-hover:text-black">添加副标题</span>
                       <p className="text-xs text-gray-400 mt-1">点击添加中号副标题文字</p>
                     </button>
                     <button 
                       onClick={() => onAddElement('text', undefined, { fontSize: 16, fontWeight: 'normal' }, '添加正文内容')}
                       className="p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-left border border-transparent hover:border-black/5 transition-all group"
                     >
                       <span className="text-base text-gray-600 group-hover:text-gray-900">添加正文内容</span>
                       <p className="text-xs text-gray-400 mt-1">点击添加小号正文文字</p>
                     </button>
                  </div>

                  <div className="space-y-4">
                     <h3 className="text-base font-medium text-gray-800">艺术字特效</h3>
                     <div className="grid grid-cols-2 gap-4">
                       {[
                           { label: '霓虹光效', style: { color: '#00ff00', textShadow: '0 0 10px #00ff00', fontWeight: 'bold', fontSize: 32 } },
                           { label: '金属质感', style: { background: 'linear-gradient(to bottom, #eee, #999)', backgroundClip: 'text', color: 'transparent', fontWeight: 'bold', fontSize: 32 } },
                           { label: '复古风格', style: { fontFamily: 'serif', color: '#8B4513', letterSpacing: '2px', fontSize: 32 } },
                           { label: '故障艺术', style: { textShadow: '2px 0 red, -2px 0 blue', fontWeight: 'bold', fontSize: 32 } },
                           { label: '火焰特效', style: { color: '#ff4500', textShadow: '0 -2px 4px #ffd700', fontWeight: 'bold', fontSize: 32 } },
                           { label: '冰霜冻结', style: { color: '#e0ffff', textShadow: '0 0 5px #00bfff', fontWeight: 'bold', fontSize: 32 } },
                       ].map((item, i) => (
                         <button 
                           key={i} 
                           onClick={() => onAddElement('text', undefined, { ...item.style }, item.label)}
                           className="h-24 bg-gray-900 rounded-xl border border-transparent hover:border-gray-700 transition-all overflow-hidden flex items-center justify-center relative group"
                         >
                           <div className="absolute inset-0 bg-grid-white/[0.05]" />
                           <span style={item.style as any} className="relative z-10 group-hover:scale-110 transition-transform">{item.label}</span>
                         </button>
                       ))}
                     </div>
                  </div>
               </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
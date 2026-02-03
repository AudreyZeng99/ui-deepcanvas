import { useState } from 'react';
import { 
  MousePointer2, 
  Hand, 
  Square, 
  Type, 
  Image as ImageIcon, 
  PenTool, 
  Undo2, 
  Redo2,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  Plus,
  Ruler,
  Layers,
  ArrowUp,
  ArrowDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  AlignVerticalJustifyCenter,
  AlignVerticalSpaceAround,
  Lock,
  Unlock,
  CornerUpLeft,
  CornerUpRight,
  MoveUp,
  MoveDown,
  ShieldCheck,
  Eye,
  ScanEye,
  Component
} from 'lucide-react';
import clsx from 'clsx';
import CreateCanvasModal from '../components/CreateCanvasModal';
import { Tooltip } from '../components/Tooltip';

export default function Editor() {
  const [activeTool, setActiveTool] = useState('select');
  const [isCanvasModalOpen, setIsCanvasModalOpen] = useState(false);
  const [showRulers, setShowRulers] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [showLayers, setShowLayers] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [borderRadius, setBorderRadius] = useState(0);

  return (
    <div className="h-[calc(100vh-3rem)] relative bg-white/50 rounded-3xl overflow-hidden border border-black/5 flex flex-col">
      <CreateCanvasModal 
        isOpen={isCanvasModalOpen} 
        onClose={() => setIsCanvasModalOpen(false)} 
      />

      {/* Top Bar - Level 1: File & Main Actions */}
      <header className="h-14 border-b border-black/5 bg-white/30 backdrop-blur-md px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Tooltip content="新建画布" position="bottom">
            <button 
              onClick={() => setIsCanvasModalOpen(true)}
              className="p-1.5 bg-black text-white rounded-lg hover:bg-black/80 transition-all flex items-center gap-2 text-sm font-medium pr-3"
            >
              <Plus size={16} />
              New Canvas
            </button>
          </Tooltip>
          <div className="h-5 w-px bg-black/10" />
          <h1 className="font-semibold text-base">Untitled Project</h1>
          <div className="px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-500 font-medium">DRAFT</div>
        </div>
        
        <div className="flex items-center gap-2">
           <Tooltip content="撤销 (Ctrl+Z)" position="bottom">
             <button className="p-2 hover:bg-black/5 rounded-lg transition-colors">
               <Undo2 size={18} />
             </button>
           </Tooltip>
           <Tooltip content="重做 (Ctrl+Shift+Z)" position="bottom">
             <button className="p-2 hover:bg-black/5 rounded-lg transition-colors">
               <Redo2 size={18} />
             </button>
           </Tooltip>
           <div className="h-5 w-px bg-black/10 mx-1" />
           <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <Tooltip content="缩小" position="bottom">
                <button className="p-1 hover:bg-white rounded transition-colors" onClick={() => setZoom(Math.max(10, zoom - 10))}>
                  <ZoomOut size={14} />
                </button>
              </Tooltip>
              <span className="text-xs font-mono w-10 text-center select-none">{zoom}%</span>
              <Tooltip content="放大" position="bottom">
                <button className="p-1 hover:bg-white rounded transition-colors" onClick={() => setZoom(Math.min(500, zoom + 10))}>
                  <ZoomIn size={14} />
                </button>
              </Tooltip>
           </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audit Buttons */}
          <div className="flex items-center gap-1 mr-2">
            <Tooltip content="检查设计是否符合消费者权益保护规范" position="bottom">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors">
                <ShieldCheck size={14} />
                消保审核
              </button>
            </Tooltip>
            <Tooltip content="检查用户体验与交互规范" position="bottom">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors">
                <ScanEye size={14} />
                体验审核
              </button>
            </Tooltip>
          </div>

          <div className="h-5 w-px bg-black/10 mr-2" />

          <Tooltip content="分享" position="bottom">
            <button className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-2 rounded-lg">
              <Share2 size={16} />
              Share
            </button>
          </Tooltip>
          <Tooltip content="导出" position="bottom">
            <button className="btn-primary py-1.5 px-3 text-sm flex items-center gap-2 rounded-lg">
              <Download size={16} />
              Export
            </button>
          </Tooltip>
        </div>
      </header>

      {/* Top Bar - Level 2: Tools & Properties */}
      <div className="h-12 border-b border-black/5 bg-white/50 backdrop-blur-sm px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-1">
          {/* Layer Controls */}
          <div className="flex items-center gap-1 p-1 pr-2 border-r border-black/5">
             <Tooltip content={showLayers ? "隐藏图层" : "显示图层"} position="bottom">
               <button 
                 className={clsx("p-1.5 rounded-lg transition-colors", showLayers ? "bg-black text-white" : "hover:bg-black/5")}
                 onClick={() => setShowLayers(!showLayers)}
               >
                 <Layers size={18} />
               </button>
             </Tooltip>
             <div className="flex items-center gap-0.5 ml-1">
                <Tooltip content="置顶图层" position="bottom"><button className="p-1.5 hover:bg-black/5 rounded-lg"><MoveUp size={16} className="rotate-0" /></button></Tooltip>
                <Tooltip content="上移一层" position="bottom"><button className="p-1.5 hover:bg-black/5 rounded-lg"><ArrowUp size={16} /></button></Tooltip>
                <Tooltip content="下移一层" position="bottom"><button className="p-1.5 hover:bg-black/5 rounded-lg"><ArrowDown size={16} /></button></Tooltip>
                <Tooltip content="置底图层" position="bottom"><button className="p-1.5 hover:bg-black/5 rounded-lg"><MoveDown size={16} className="rotate-0" /></button></Tooltip>
             </div>
          </div>

          {/* Alignment Controls */}
          <div className="flex items-center gap-0.5 p-1 pr-2 border-r border-black/5 ml-1">
             <Tooltip content="左对齐" position="bottom"><button className="p-1.5 hover:bg-black/5 rounded-lg"><AlignLeft size={16} /></button></Tooltip>
             <Tooltip content="水平居中" position="bottom"><button className="p-1.5 hover:bg-black/5 rounded-lg"><AlignCenter size={16} /></button></Tooltip>
             <Tooltip content="右对齐" position="bottom"><button className="p-1.5 hover:bg-black/5 rounded-lg"><AlignRight size={16} /></button></Tooltip>
             <div className="w-px h-4 bg-black/10 mx-1" />
             <Tooltip content="顶对齐" position="bottom"><button className="p-1.5 hover:bg-black/5 rounded-lg"><AlignVerticalSpaceAround size={16} className="rotate-180" /></button></Tooltip>
             <Tooltip content="垂直居中" position="bottom"><button className="p-1.5 hover:bg-black/5 rounded-lg"><AlignVerticalJustifyCenter size={16} /></button></Tooltip>
             <Tooltip content="底对齐" position="bottom"><button className="p-1.5 hover:bg-black/5 rounded-lg"><AlignVerticalSpaceAround size={16} /></button></Tooltip>
          </div>

          {/* Locking & Radius */}
          <div className="flex items-center gap-2 p-1 ml-1">
             <Tooltip content={isLocked ? "解锁" : "锁定"} position="bottom">
               <button 
                 className={clsx("p-1.5 rounded-lg transition-colors", isLocked ? "bg-red-50 text-red-600" : "hover:bg-black/5")}
                 onClick={() => setIsLocked(!isLocked)}
               >
                 {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
               </button>
             </Tooltip>
             
             <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-black/5 rounded-lg ml-2">
               <CornerUpLeft size={14} className="text-gray-400" />
               <input 
                 type="number" 
                 value={borderRadius}
                 onChange={(e) => setBorderRadius(Number(e.target.value))}
                 className="w-8 text-xs font-mono bg-transparent outline-none text-right" 
               />
               <span className="text-[10px] text-gray-400">px</span>
             </div>
          </div>
        </div>

        {/* View Options */}
        <div className="flex items-center gap-2">
           <Tooltip content="显示/隐藏标尺" position="bottom">
             <button 
               className={clsx("p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium", showRulers ? "bg-black/5 text-black" : "hover:bg-black/5 text-gray-500")}
               onClick={() => setShowRulers(!showRulers)}
             >
               <Ruler size={16} />
               Rulers
             </button>
           </Tooltip>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-[#F9FAFB] overflow-hidden flex">
        {/* Rulers */}
        {showRulers && (
          <>
            {/* Horizontal Ruler */}
            <div className="absolute top-0 left-8 right-0 h-6 bg-white border-b border-black/5 z-10 flex overflow-hidden select-none">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[100px] h-full relative border-l border-black/5 text-[9px] text-gray-400 pl-1 pt-0.5 font-mono">
                  {i * 100}
                  <div className="absolute bottom-0 left-1/4 h-1 w-px bg-black/10" />
                  <div className="absolute bottom-0 left-1/2 h-2 w-px bg-black/10" />
                  <div className="absolute bottom-0 left-3/4 h-1 w-px bg-black/10" />
                </div>
              ))}
            </div>
            {/* Vertical Ruler */}
            <div className="absolute top-6 left-0 bottom-0 w-8 bg-white border-r border-black/5 z-10 flex flex-col overflow-hidden select-none">
              {[...Array(15)].map((_, i) => (
                <div key={i} className="flex-shrink-0 h-[100px] w-full relative border-t border-black/5 text-[9px] text-gray-400 pt-1 pl-1 font-mono">
                  <span className="block transform -rotate-90 origin-top-left translate-y-4">{i * 100}</span>
                  <div className="absolute right-0 top-1/4 w-1 h-px bg-black/10" />
                  <div className="absolute right-0 top-1/2 w-2 h-px bg-black/10" />
                  <div className="absolute right-0 top-3/4 w-1 h-px bg-black/10" />
                </div>
              ))}
            </div>
            {/* Corner Box */}
            <div className="absolute top-0 left-0 w-8 h-6 bg-white border-r border-b border-black/5 z-20 flex items-center justify-center">
              <div className="w-1 h-1 bg-black/20 rounded-full" />
            </div>
          </>
        )}

        {/* Canvas Content */}
        <div className={clsx("flex-1 relative overflow-auto custom-scrollbar p-12", showRulers && "pt-12 pl-14")}>
          {/* Dot Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
          />

          <div className="min-w-full min-h-full flex items-center justify-center">
            <div 
              className="bg-white shadow-2xl transition-all duration-300 relative group"
              style={{ 
                width: '800px', 
                height: '600px',
                transform: `scale(${zoom / 100})`,
                borderRadius: `${borderRadius}px`
              }}
            >
               <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300">
                  <ImageIcon size={64} className="mb-4 opacity-20" />
                  <p className="text-lg font-medium">1920 x 1080</p>
                  <p className="text-sm">Drag assets here</p>
               </div>
               
               {/* Selection UI Example */}
               <div className="absolute top-20 left-20 w-40 h-40 bg-blue-50/50 border-2 border-accent-blue rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  <div className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-white border-2 border-accent-blue rounded-full" />
                  <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-white border-2 border-accent-blue rounded-full" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 bg-white border-2 border-accent-blue rounded-full" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-white border-2 border-accent-blue rounded-full" />
               </div>
            </div>
          </div>
        </div>

        {/* Floating Toolbar (Left) */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-white p-2 rounded-2xl shadow-xl border border-black/5 z-30">
          <ToolButton 
            icon={MousePointer2} 
            label="选择 (V)" 
            isActive={activeTool === 'select'} 
            onClick={() => setActiveTool('select')} 
          />
          <ToolButton 
            icon={Hand} 
            label="拖拽 (H)" 
            isActive={activeTool === 'pan'} 
            onClick={() => setActiveTool('pan')} 
          />
          <div className="w-full h-px bg-black/5 my-1" />
          <ToolButton 
            icon={Square} 
            label="形状 (R)" 
            isActive={activeTool === 'shape'} 
            onClick={() => setActiveTool('shape')} 
          />
          <ToolButton 
            icon={Type} 
            label="文本 (T)" 
            isActive={activeTool === 'text'} 
            onClick={() => setActiveTool('text')} 
          />
          <ToolButton 
            icon={ImageIcon} 
            label="图片 (I)" 
            isActive={activeTool === 'image'} 
            onClick={() => setActiveTool('image')} 
          />
          <ToolButton 
            icon={PenTool} 
            label="绘画 (P)" 
            isActive={activeTool === 'draw'} 
            onClick={() => setActiveTool('draw')} 
          />
        </div>

        {/* Bottom Bar: Canvas Info & Guide Hand */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-black/5 z-30 flex items-center gap-4 text-xs font-medium text-gray-600">
           <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500" />
             <span>1920 x 1080 px</span>
           </div>
           <div className="w-px h-3 bg-black/10" />
           <div className="flex items-center gap-2 cursor-pointer hover:text-black transition-colors" title="点击添加辅助线">
             <Component size={14} />
             <span>辅助线工具</span>
           </div>
        </div>
      </div>
    </div>
  );
}

function ToolButton({ icon: Icon, label, isActive, onClick }: { icon: React.ElementType, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <Tooltip content={label} position="right">
      <button
        onClick={onClick}
        className={clsx(
          "p-3 rounded-xl transition-all relative group",
          isActive 
            ? "bg-black text-white shadow-md" 
            : "text-gray-500 hover:bg-gray-100 hover:text-black"
        )}
      >
        <Icon size={20} />
      </button>
    </Tooltip>
  );
}

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
  Plus
} from 'lucide-react';
import clsx from 'clsx';
import CreateCanvasModal from '../components/CreateCanvasModal';
import { Tooltip } from '../components/Tooltip';

export default function Editor() {
  const [activeTool, setActiveTool] = useState('select');
  const [isCanvasModalOpen, setIsCanvasModalOpen] = useState(false);

  return (
    <div className="h-[calc(100vh-3rem)] relative bg-white/50 rounded-3xl overflow-hidden border border-black/5 flex flex-col">
      <CreateCanvasModal 
        isOpen={isCanvasModalOpen} 
        onClose={() => setIsCanvasModalOpen(false)} 
      />

      {/* Top Bar */}
      <header className="h-16 border-b border-black/5 bg-white/30 backdrop-blur-md px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <Tooltip content="新建画布" position="bottom">
            <button 
              onClick={() => setIsCanvasModalOpen(true)}
              className="p-2 bg-black text-white rounded-xl hover:bg-black/80 transition-all flex items-center gap-2 text-sm font-medium pr-3"
            >
              <Plus size={18} />
              New Canvas
            </button>
          </Tooltip>
          <div className="h-6 w-px bg-black/10" />
          <h1 className="font-semibold text-lg">Untitled Project</h1>
          <div className="px-2 py-1 bg-gray-100 rounded-lg text-xs text-gray-500">Draft</div>
        </div>
        
        <div className="flex items-center gap-2">
           <Tooltip content="撤销" position="bottom">
             <button className="p-2 hover:bg-black/5 rounded-xl transition-colors">
               <Undo2 size={20} />
             </button>
           </Tooltip>
           <Tooltip content="重做" position="bottom">
             <button className="p-2 hover:bg-black/5 rounded-xl transition-colors">
               <Redo2 size={20} />
             </button>
           </Tooltip>
           <div className="h-6 w-px bg-black/10 mx-2" />
           <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
              <Tooltip content="缩小" position="bottom">
                <button className="p-1 hover:bg-white rounded-lg transition-colors">
                  <ZoomOut size={16} />
                </button>
              </Tooltip>
              <span className="text-xs font-mono w-12 text-center">100%</span>
              <Tooltip content="放大" position="bottom">
                <button className="p-1 hover:bg-white rounded-lg transition-colors">
                  <ZoomIn size={16} />
                </button>
              </Tooltip>
           </div>
        </div>

        <div className="flex items-center gap-3">
          <Tooltip content="分享" position="bottom">
            <button className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
              <Share2 size={16} />
              Share
            </button>
          </Tooltip>
          <Tooltip content="导出" position="bottom">
            <button className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
              <Download size={16} />
              Export
            </button>
          </Tooltip>
        </div>
      </header>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-[#F9FAFB] overflow-hidden">
        {/* Dot Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
        />

        {/* Floating Toolbar */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 bg-white p-2 rounded-2xl shadow-xl border border-black/5 z-10">
          <ToolButton 
            icon={MousePointer2} 
            label="选择" 
            isActive={activeTool === 'select'} 
            onClick={() => setActiveTool('select')} 
          />
          <ToolButton 
            icon={Hand} 
            label="拖拽" 
            isActive={activeTool === 'pan'} 
            onClick={() => setActiveTool('pan')} 
          />
          <div className="w-full h-px bg-black/5 my-1" />
          <ToolButton 
            icon={Square} 
            label="形状" 
            isActive={activeTool === 'shape'} 
            onClick={() => setActiveTool('shape')} 
          />
          <ToolButton 
            icon={Type} 
            label="文本" 
            isActive={activeTool === 'text'} 
            onClick={() => setActiveTool('text')} 
          />
          <ToolButton 
            icon={ImageIcon} 
            label="图片" 
            isActive={activeTool === 'image'} 
            onClick={() => setActiveTool('image')} 
          />
          <ToolButton 
            icon={PenTool} 
            label="绘画" 
            isActive={activeTool === 'draw'} 
            onClick={() => setActiveTool('draw')} 
          />
        </div>

        {/* Canvas Content Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[400px] bg-white shadow-2xl rounded-xl border border-black/5 flex items-center justify-center relative group">
             <div className="text-center text-gray-400">
                <ImageIcon size={48} className="mx-auto mb-4 opacity-20" />
                <p>Drag and drop assets here</p>
                <p className="text-sm">or press '/' for commands</p>
             </div>
             
             {/* Selection UI Example */}
             <div className="absolute -inset-1 border-2 border-accent-blue rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                <div className="absolute -top-3 -left-3 w-3 h-3 bg-white border-2 border-accent-blue rounded-full" />
                <div className="absolute -top-3 -right-3 w-3 h-3 bg-white border-2 border-accent-blue rounded-full" />
                <div className="absolute -bottom-3 -left-3 w-3 h-3 bg-white border-2 border-accent-blue rounded-full" />
                <div className="absolute -bottom-3 -right-3 w-3 h-3 bg-white border-2 border-accent-blue rounded-full" />
             </div>
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

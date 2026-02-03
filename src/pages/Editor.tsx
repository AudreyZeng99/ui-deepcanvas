import { useState } from 'react';
import { 
  MousePointer2, 
  Hand, 
  Type, 
  Image as ImageIcon, 
  PenTool, 
  Undo2, 
  Redo2,
  Save,
  Download,
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
  AlignVerticalJustifyCenter,
  AlignVerticalSpaceAround,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  Lock,
  Unlock,
  CornerUpLeft,
  MoveUp,
  MoveDown,
  ShieldCheck,
  ScanEye,
  Component,
  LayoutGrid,
  AppWindow,
  Table,
  Sparkles,
  X
} from 'lucide-react';
import clsx from 'clsx';
import CreateCanvasModal from '../components/CreateCanvasModal';
import { Tooltip } from '../components/Tooltip';
import { useProject } from '../context/ProjectContext';
import { useEffect } from 'react';

export default function Editor() {
  const { currentProject, createProject, saveProject, markAsDirty, isDirty } = useProject();
  const [activeTool, setActiveTool] = useState('select');
  const [isCanvasModalOpen, setIsCanvasModalOpen] = useState(false);
  const [showRulers, setShowRulers] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [showLayers, setShowLayers] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [borderRadius, setBorderRadius] = useState(0);
  
  // New State for Interactions
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [elementProps, setElementProps] = useState({ x: 300, y: 250, w: 200, h: 100, opacity: 100 });
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [leftPanelContent, setLeftPanelContent] = useState<string | null>(null);

  const handleAlign = (type: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => {
    if (!selectedElement) return;
    // Assuming canvas is 800x600 for prototype
    const canvasW = 800;
    const canvasH = 600;
    
    setElementProps(prev => {
      const newProps = { ...prev };
      switch (type) {
        case 'left': newProps.x = 0; break;
        case 'center-h': newProps.x = (canvasW - prev.w) / 2; break;
        case 'right': newProps.x = canvasW - prev.w; break;
        case 'top': newProps.y = 0; break;
        case 'center-v': newProps.y = (canvasH - prev.h) / 2; break;
        case 'bottom': newProps.y = canvasH - prev.h; break;
      }
      return newProps;
    });
  };

  useEffect(() => {
    if (!currentProject) {
      createProject(1920, 1080);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveProject();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveProject]);

  const handleBorderRadiusChange = (val: number) => {
    setBorderRadius(val);
    markAsDirty();
  };

  const handleToolClick = (tool: string) => {
    setActiveTool(tool);
    
    if (tool === 'text') {
      setShowLeftPanel(true);
      setLeftPanelContent('text');
      // Simulate adding text
      setSelectedElement('text-1');
    } else {
      setShowLeftPanel(false);
      setLeftPanelContent(null);
      if (tool !== 'select') {
         setSelectedElement(null);
      }
    }
  };

  const handleElementClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedElement(id);
    setActiveTool('select');
  };

  const handleCanvasClick = () => {
    setSelectedElement(null);
  };

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
              className="p-1.5 bg-accent-primary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 text-sm font-medium pr-3"
            >
              <Plus size={16} />
              New Canvas
            </button>
          </Tooltip>
          <div className="h-5 w-px bg-black/10" />
          <h1 className="font-semibold text-base">{currentProject?.name || 'Untitled Project'}</h1>
          <div className={clsx(
            "px-2 py-0.5 rounded text-[10px] font-medium",
            isDirty ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600"
          )}>
            {isDirty ? 'UNSAVED' : 'SAVED'}
          </div>
          
          {/* Canvas Size Display (Moved to Top) */}
          <div className="ml-4 flex items-center gap-2 text-xs font-medium text-gray-500 bg-black/5 px-2 py-1 rounded-md">
             <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
             <span>{currentProject?.width || 1920} x {currentProject?.height || 1080} px</span>
          </div>
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
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent-primary bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/20 rounded-lg transition-colors">
                <ScanEye size={14} />
                体验审核
              </button>
            </Tooltip>
          </div>

          <div className="h-5 w-px bg-black/10 mr-2" />

          <Tooltip content="导出" position="bottom">
            <button className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-2 rounded-lg">
              <Download size={16} />
              Export
            </button>
          </Tooltip>
          <Tooltip content="保存 (Ctrl+S)" position="bottom">
            <button 
              onClick={saveProject}
              className="btn-primary py-1.5 px-3 text-sm flex items-center gap-2 rounded-lg"
            >
              <Save size={16} />
              Save
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

          {/* Alignment & Distribution Controls */}
          <div className="flex items-center gap-0.5 p-1 pr-2 border-r border-black/5 ml-1">
             <Tooltip content="左对齐" position="bottom"><button onClick={() => handleAlign('left')} className="p-1.5 hover:bg-black/5 rounded-lg"><AlignLeft size={16} /></button></Tooltip>
             <Tooltip content="水平居中" position="bottom"><button onClick={() => handleAlign('center-h')} className="p-1.5 hover:bg-black/5 rounded-lg"><AlignCenter size={16} /></button></Tooltip>
             <Tooltip content="右对齐" position="bottom"><button onClick={() => handleAlign('right')} className="p-1.5 hover:bg-black/5 rounded-lg"><AlignRight size={16} /></button></Tooltip>
             <div className="w-px h-4 bg-black/10 mx-1" />
             <Tooltip content="顶对齐" position="bottom"><button onClick={() => handleAlign('top')} className="p-1.5 hover:bg-black/5 rounded-lg"><AlignVerticalSpaceAround size={16} className="rotate-180" /></button></Tooltip>
             <Tooltip content="垂直居中" position="bottom"><button onClick={() => handleAlign('center-v')} className="p-1.5 hover:bg-black/5 rounded-lg"><AlignVerticalJustifyCenter size={16} /></button></Tooltip>
             <Tooltip content="底对齐" position="bottom"><button onClick={() => handleAlign('bottom')} className="p-1.5 hover:bg-black/5 rounded-lg"><AlignVerticalSpaceAround size={16} /></button></Tooltip>
             <div className="w-px h-4 bg-black/10 mx-1" />
             <Tooltip content="水平分布" position="bottom"><button className="p-1.5 hover:bg-black/5 rounded-lg text-gray-400 cursor-not-allowed"><AlignHorizontalDistributeCenter size={16} /></button></Tooltip>
             <Tooltip content="垂直分布" position="bottom"><button className="p-1.5 hover:bg-black/5 rounded-lg text-gray-400 cursor-not-allowed"><AlignVerticalDistributeCenter size={16} /></button></Tooltip>
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
                 onChange={(e) => handleBorderRadiusChange(Number(e.target.value))}
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

      {/* Main Content Area */}
      <div className="flex-1 relative bg-[#F9FAFB] overflow-hidden flex">
        
        {/* Left Sidebar - Tool Details */}
        {showLeftPanel && (
          <div className="w-64 bg-white border-r border-black/5 flex flex-col animate-in slide-in-from-left duration-200 z-30">
            <div className="h-12 border-b border-black/5 flex items-center justify-between px-4">
              <span className="font-semibold text-sm">
                {leftPanelContent === 'text' && 'Text Tools'}
                {leftPanelContent === 'material' && 'Assets'}
              </span>
              <button onClick={() => setShowLeftPanel(false)} className="p-1 hover:bg-black/5 rounded">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {leftPanelContent === 'text' && (
                <div className="space-y-4">
                   <div className="space-y-2">
                     <div className="text-xs font-medium text-gray-500">Presets</div>
                     <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left text-2xl font-bold border border-transparent hover:border-black/5 transition-all">
                       Heading
                     </button>
                     <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left text-lg font-semibold border border-transparent hover:border-black/5 transition-all">
                       Subheading
                     </button>
                     <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left text-sm text-gray-600 border border-transparent hover:border-black/5 transition-all">
                       Body text
                     </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Center Canvas Area */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
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
          <div 
            className={clsx("flex-1 relative overflow-auto custom-scrollbar p-12", showRulers && "pt-12 pl-14")}
            onClick={handleCanvasClick}
          >
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
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 pointer-events-none">
                    <ImageIcon size={64} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium">1920 x 1080</p>
                    <p className="text-sm">Drag assets here</p>
                 </div>
                 
                 {/* Text Element Example (Shown when Text tool clicked) */}
                 {selectedElement === 'text-1' && (
                    <div 
                      onClick={(e) => handleElementClick(e, 'text-1')}
                      style={{
                        left: elementProps.x,
                        top: elementProps.y,
                        width: elementProps.w,
                        height: elementProps.h,
                        opacity: elementProps.opacity / 100
                      }}
                      className="absolute p-4 border-2 border-accent-primary rounded-lg bg-white shadow-lg cursor-move z-10 flex items-center justify-center"
                    >
                      <h2 className="text-2xl font-bold text-black">Hello World</h2>
                      {/* Selection Handles */}
                      <div className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-white border-2 border-accent-primary rounded-full" />
                      <div className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-white border-2 border-accent-primary rounded-full" />
                      <div className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 bg-white border-2 border-accent-primary rounded-full" />
                      <div className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-white border-2 border-accent-primary rounded-full" />
                    </div>
                 )}
              </div>
            </div>
          </div>

          {/* Toolbar (Bottom Center) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white p-2 rounded-2xl shadow-xl border border-black/5 z-30">
            <ToolButton 
              icon={MousePointer2} 
              label="选择 (V)" 
              isActive={activeTool === 'select'} 
              onClick={() => handleToolClick('select')} 
            />
            <ToolButton 
              icon={Hand} 
              label="拖拽 (H)" 
              isActive={activeTool === 'pan'} 
              onClick={() => handleToolClick('pan')} 
            />
            <div className="w-px h-8 bg-black/5 mx-1" />
            <ToolButton 
              icon={LayoutGrid} 
              label="素材" 
              isActive={activeTool === 'material'} 
              onClick={() => handleToolClick('material')} 
            />
            <ToolButton 
              icon={Type} 
              label="文本 (T)" 
              isActive={activeTool === 'text'} 
              onClick={() => handleToolClick('text')} 
            />
            <ToolButton 
              icon={ImageIcon} 
              label="图片 (I)" 
              isActive={activeTool === 'image'} 
              onClick={() => handleToolClick('image')} 
            />
            <ToolButton 
              icon={AppWindow} 
              label="背景" 
              isActive={activeTool === 'background'} 
              onClick={() => handleToolClick('background')} 
            />
            <ToolButton 
              icon={PenTool} 
              label="画笔 (P)" 
              isActive={activeTool === 'draw'} 
              onClick={() => handleToolClick('draw')} 
            />
            <ToolButton 
              icon={Table} 
              label="表格" 
              isActive={activeTool === 'table'} 
              onClick={() => handleToolClick('table')} 
            />
            <ToolButton 
              icon={Sparkles} 
              label="AI" 
              isActive={activeTool === 'ai'} 
              onClick={() => handleToolClick('ai')} 
            />
            <div className="w-px h-8 bg-black/5 mx-1" />
            <ToolButton 
              icon={Component} 
              label="辅助线" 
              isActive={activeTool === 'guide'} 
              onClick={() => handleToolClick('guide')} 
            />
          </div>
        </div>

        {/* Right Sidebar - Element Properties */}
        {selectedElement && (
            <div className="w-64 bg-white border-l border-black/5 flex flex-col animate-in slide-in-from-right duration-200 z-30">
              <div className="h-12 border-b border-black/5 flex items-center justify-between px-4">
                <span className="font-semibold text-sm">属性</span>
                <button onClick={() => setSelectedElement(null)} className="p-1 hover:bg-black/5 rounded">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-6">
                <div className="space-y-3">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">位置与尺寸</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400">X</label>
                      <input type="number" className="w-full bg-gray-50 border border-transparent hover:border-black/10 rounded-lg px-2 py-1 text-sm outline-none transition-colors" value={elementProps.x} onChange={(e) => setElementProps(p => ({...p, x: Number(e.target.value)}))} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400">Y</label>
                      <input type="number" className="w-full bg-gray-50 border border-transparent hover:border-black/10 rounded-lg px-2 py-1 text-sm outline-none transition-colors" value={elementProps.y} onChange={(e) => setElementProps(p => ({...p, y: Number(e.target.value)}))} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400">W</label>
                      <input type="number" className="w-full bg-gray-50 border border-transparent hover:border-black/10 rounded-lg px-2 py-1 text-sm outline-none transition-colors" value={elementProps.w} onChange={(e) => setElementProps(p => ({...p, w: Number(e.target.value)}))} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400">H</label>
                      <input type="number" className="w-full bg-gray-50 border border-transparent hover:border-black/10 rounded-lg px-2 py-1 text-sm outline-none transition-colors" value={elementProps.h} onChange={(e) => setElementProps(p => ({...p, h: Number(e.target.value)}))} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">外观</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">不透明度</span>
                      <span className="text-xs font-mono text-gray-400">{elementProps.opacity}%</span>
                    </div>
                    <input type="range" className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" value={elementProps.opacity} onChange={(e) => setElementProps(p => ({...p, opacity: Number(e.target.value)}))} />
                  </div>
                </div>

                <div className="space-y-3">
                   <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">图层</div>
                   <div className="flex gap-2">
                      <button className="flex-1 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium transition-colors">置顶</button>
                      <button className="flex-1 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium transition-colors">置底</button>
                   </div>
                </div>
              </div>
            </div>
        )}

      </div>
    </div>
  );
}

function ToolButton({ icon: Icon, label, isActive, onClick }: { icon: React.ElementType, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <Tooltip content={label} position="top">
      <button
        onClick={onClick}
        className={clsx(
          "p-3 rounded-xl transition-all relative group",
          isActive 
            ? "bg-accent-primary text-white shadow-md" 
            : "text-gray-500 hover:bg-gray-100 hover:text-black"
        )}
      >
        <Icon size={20} />
      </button>
    </Tooltip>
  );
}

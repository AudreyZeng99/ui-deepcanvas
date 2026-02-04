import { useState } from 'react';
import { 
  MousePointer2, 
  Hand, 
  Type, 
  RectangleHorizontal,
  Circle,
  Square,
  Triangle,
  Minus,
  MoveRight,
  Upload, 
  Image as ImageIcon, 
  PenTool, 
  Undo2, 
  Redo2,
  Save,
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
  FlipHorizontal,
  FlipVertical,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  ShieldCheck,
  ScanEye,
  LayoutGrid,
  AppWindow,
  Table,
  Sparkles,
  X,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Trash2,
  Copy
} from 'lucide-react';
import clsx from 'clsx';
import CreateCanvasModal from '../components/CreateCanvasModal';
import { Tooltip } from '../components/Tooltip';
import { useProject } from '../context/ProjectContext';
import { useEffect, useRef } from 'react';

export default function Editor() {
  const { currentProject, createProject, saveProject, markAsDirty, isDirty, validateSave, updateProject } = useProject();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Element Management
  interface CanvasElement {
    id: string;
    type: string;
    subType?: string;
    props: any;
    content?: string;
    src?: string;
  }
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const isUpdatingSelection = useRef(false);

  const isFirstRender = useRef(true);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [activeTool, setActiveTool] = useState('select');
  const [isCanvasModalOpen, setIsCanvasModalOpen] = useState(false);
  const [showRulers, setShowRulers] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [showLayers, setShowLayers] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [borderRadius, setBorderRadius] = useState(0);
  
  // New State for Interactions
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [elementProps, setElementProps] = useState({ 
    x: 300, 
    y: 250, 
    w: 200, 
    h: 100, 
    opacity: 100, 
    fill: '#000000',
    stroke: '#000000',
    strokeWidth: 0,
    radius: 0,
    rotation: 0,
    flipX: false,
    flipY: false,
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    textAlign: 'left',
    lineHeight: 1.0,
    letterSpacing: 0,
    writingMode: 'horizontal-tb'
  });
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [leftPanelContent, setLeftPanelContent] = useState<string | null>(null);
  const [activeMaterialTab, setActiveMaterialTab] = useState<'basic' | 'bocom' | 'personal' | 'icons' | 'photos' | 'mockups' | 'none'>('basic');
  const [personalMaterials] = useState<string[]>([]);
  const [showEffectsModal, setShowEffectsModal] = useState(false);
  const [isCursorMenuOpen, setIsCursorMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [effects, setEffects] = useState({
    stroke: false,
    shadow: false,
    glow: false,
    reflection: false,
    threeD: false,
    glass: false
  });

  // Drag & Resize State
  const [dragState, setDragState] = useState<{
    startX: number;
    startY: number;
    startProps: any;
    mode: 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br';
  } | null>(null);

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

  const handleFlip = (direction: 'h' | 'v') => {
    setElementProps(prev => ({
      ...prev,
      [direction === 'h' ? 'flipX' : 'flipY']: !prev[direction === 'h' ? 'flipX' : 'flipY']
    }));
  };

  // Handle Drag & Resize Global Events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState || !selectedElement) return;

      const dx = (e.clientX - dragState.startX) / (zoom / 100);
      const dy = (e.clientY - dragState.startY) / (zoom / 100);
      
      const newProps = { ...dragState.startProps };

      if (dragState.mode === 'move') {
        newProps.x = dragState.startProps.x + dx;
        newProps.y = dragState.startProps.y + dy;
      } else if (dragState.mode === 'resize-br') {
         newProps.w = Math.max(10, dragState.startProps.w + dx);
         newProps.h = Math.max(10, dragState.startProps.h + dy);
      } else if (dragState.mode === 'resize-bl') {
         const w = Math.max(10, dragState.startProps.w - dx);
         newProps.x = dragState.startProps.x + (dragState.startProps.w - w);
         newProps.w = w;
         newProps.h = Math.max(10, dragState.startProps.h + dy);
      } else if (dragState.mode === 'resize-tr') {
         newProps.w = Math.max(10, dragState.startProps.w + dx);
         const h = Math.max(10, dragState.startProps.h - dy);
         newProps.y = dragState.startProps.y + (dragState.startProps.h - h);
         newProps.h = h;
      } else if (dragState.mode === 'resize-tl') {
         const w = Math.max(10, dragState.startProps.w - dx);
         newProps.x = dragState.startProps.x + (dragState.startProps.w - w);
         newProps.w = w;
         
         const h = Math.max(10, dragState.startProps.h - dy);
         newProps.y = dragState.startProps.y + (dragState.startProps.h - h);
         newProps.h = h;
      }

      setElementProps(newProps);
    };

    const handleMouseUp = () => {
      setDragState(null);
    };

    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, selectedElement, zoom]);

  useEffect(() => {
    if (!currentProject) {
      createProject(1920, 1080);
    }
  }, []);

  // Track changes to element properties to mark as dirty
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    markAsDirty();
  }, [elementProps, markAsDirty]);

  // Navigation warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleSaveWrapper = () => {
    if (!currentProject) return;
    const status = validateSave(currentProject.name);
    
    if (status === 'limit_reached') {
      alert('已达到个人文件数量上限 (5个)，无法保存新文件。请先删除部分旧文件。');
      return;
    }
    
    if (status === 'duplicate_name') {
      setRenameValue(currentProject.name);
      setShowRenameModal(true);
      return;
    }
    
    saveProject();
  };

  const handleRenameSave = () => {
    if (!renameValue.trim()) return;
    
    const status = validateSave(renameValue);
    if (status === 'duplicate_name') {
      alert('文件名已存在，请使用其他名称');
      return;
    }
    
    updateProject({ name: renameValue });
    // After renaming, we can try saving again. 
    // Since we just updated the name, we need to wait for state update or pass new name to save.
    // However, saveProject uses currentProject from context. 
    // Let's assume updateProject updates immediately or we need to delay.
    // Actually, updateProject updates state, but saveProject reads from state. 
    // We might need to manually trigger save after update.
    // But since state update is async, we can't do it synchronously.
    // A better way is to update and save in one go or just update here and let user click save again?
    // User expectation: Click "Save" -> Modal -> "Confirm" -> Saved.
    
    // We can directly modify the current project in save logic if we had parameters, 
    // but here we must update first.
    // Let's rely on effect or just call save with a timeout? No that's hacky.
    // Let's just update and close modal, and then call saveProject? 
    // But saveProject will use the OLD state if called immediately in same closure unless we use a ref or updated object.
    
    // Better approach: updateProject updates the context state.
    // We can't guarantee it's updated for saveProject call immediately.
    // BUT, we can manually save the updated object if we had access to the setter.
    // Since we don't, we'll update the name, close modal, and show a message "Name updated, please click save again" or similar?
    // No, that's bad UX.
    
    // Workaround: We will update the project and then call saveProject in a useEffect or use a temporary approach.
    // Actually, let's just update the name in the context and trust React to update.
    // Wait, updateProject sets state.
    // If we call saveProject immediately, it uses `currentProject` from closure? 
    // `saveProject` uses `currentProject` from state in `ProjectContext`. 
    // `handleRenameSave` is in `Editor`.
    
    // Let's just update the project and close the modal. The user can click save again or we can trigger it.
    // To trigger it automatically, we can use a flag `shouldSaveAfterRename`.
    
    updateProject({ name: renameValue });
    setShowRenameModal(false);
    setTimeout(() => {
        // A small delay to allow context to update
        // This is not ideal but might work for now. 
        // A better solution requires refactoring saveProject to accept data.
        // For now, let's just update the name and let the user know they can save now?
        // Or just force a save logic here locally?
        // Let's try calling saveProject after a short timeout.
        const btn = document.getElementById('hidden-save-trigger');
        if (btn) btn.click();
    }, 100);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSaveWrapper();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveProject, currentProject, validateSave]); // Added deps

  const handleBorderRadiusChange = (val: number) => {
    setBorderRadius(val);
    markAsDirty();
  };

  // Sync elementProps and content to selected element
  useEffect(() => {
    if (selectedElement && !isUpdatingSelection.current) {
      setElements(prev => prev.map(el => 
        el.id === selectedElement ? { ...el, props: elementProps, content: selectedContent } : el
      ));
    }
  }, [elementProps, selectedContent, selectedElement]);

  const handleElementMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    // Selection Logic
    isUpdatingSelection.current = true;
    setSelectedElement(id);
    const el = elements.find(e => e.id === id);
    if (el) {
      setElementProps(el.props);
      setSelectedContent(el.content || '');
      // Initialize Drag
      setDragState({
        startX: e.clientX,
        startY: e.clientY,
        startProps: { ...el.props },
        mode: 'move'
      });
    }

    // Auto-highlight corresponding tool based on element type
    if (id.startsWith('text')) setActiveTool('text');
    else if (id.startsWith('shape') || id.startsWith('bocom') || id.startsWith('personal')) setActiveTool('material');
    else if (id.startsWith('image')) setActiveTool('image');
    else if (id.startsWith('bg')) setActiveTool('background');
    else if (id.startsWith('draw')) setActiveTool('draw');
    else if (id.startsWith('table')) setActiveTool('table');
    else if (id.startsWith('ai')) setActiveTool('ai');
    else setActiveTool('select');

    setTimeout(() => {
      isUpdatingSelection.current = false;
    }, 50);
  };

  const handleResizeStart = (e: React.MouseEvent, mode: any) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent text selection
    setDragState({
        startX: e.clientX,
        startY: e.clientY,
        startProps: { ...elementProps },
        mode
    });
  };

  const handleCanvasClick = () => {
    setSelectedElement(null);
    setActiveTool('select');
  };

  const [canvasBackground, setCanvasBackground] = useState('#FFFFFF');

  // --- Actions ---
  const handleAddElement = (type: CanvasElement['type'], subType: string | undefined, specificProps: any = {}, content: string = '') => {
    const newId = `${type}-${Date.now()}`;
    const newEl: CanvasElement = {
      id: newId,
      type,
      subType,
      props: { 
        ...elementProps, 
        x: 100 + elements.length * 20, 
        y: 100 + elements.length * 20, 
        ...specificProps
      },
      content
    };
    setElements(prev => [...prev, newEl]);
    
    // Select the new element
    isUpdatingSelection.current = true;
    setSelectedElement(newId);
    setElementProps(newEl.props);
    setSelectedContent(content);
    setTimeout(() => isUpdatingSelection.current = false, 50);
  };

  const handleToolClick = (tool: string) => {
    setActiveTool(tool);
    
    // Close cursor menu if a different tool is selected (not select/pan)
    if (tool !== 'select' && tool !== 'pan') {
      setIsCursorMenuOpen(false);
    }

    const panelTools = ['text', 'material', 'image', 'background', 'draw', 'table', 'ai'];
    if (panelTools.includes(tool)) {
      setShowLeftPanel(true);
      setLeftPanelContent(tool);
      // Removed immediate element creation for 'text'
    } else {
      setShowLeftPanel(false);
      setLeftPanelContent(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      
      const newId = `personal-${Date.now()}`;
      const newEl: CanvasElement = {
        id: newId,
        type: 'image',
        subType: 'personal',
        props: { 
          ...elementProps, 
          x: 200 + elements.length * 20, 
          y: 200 + elements.length * 20, 
          w: 300, 
          h: 200 
        },
        src: url
      };
      setElements(prev => [...prev, newEl]);
      
      isUpdatingSelection.current = true;
      setSelectedElement(newId);
      setElementProps(newEl.props);
      setTimeout(() => isUpdatingSelection.current = false, 50);
      
      // Reset input value so same file can be selected again
      e.target.value = '';
    }
  };

  const handleLocalImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="h-[calc(100vh-3rem)] relative bg-white/50 rounded-3xl overflow-hidden border border-black/5 flex flex-col">
      <CreateCanvasModal 
        isOpen={isCanvasModalOpen} 
        onClose={() => setIsCanvasModalOpen(false)} 
      />

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-96 overflow-hidden border border-black/5 animate-in zoom-in-95 duration-200">
            <div className="h-12 border-b border-black/5 flex items-center justify-between px-4 bg-gray-50">
              <span className="font-semibold text-sm flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                文件名重复
              </span>
              <button onClick={() => setShowRenameModal(false)} className="p-1 hover:bg-black/5 rounded">
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                当前文件名 "{currentProject?.name}" 已存在。请为您的设计输入一个新的名称。
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">新文件名</label>
                  <input 
                    type="text" 
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent outline-none text-sm"
                    autoFocus
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setShowRenameModal(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleRenameSave}
                    className="px-4 py-2 text-sm text-white bg-accent-primary hover:bg-accent-primary/90 rounded-lg transition-colors"
                  >
                    保存并重命名
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Effects Modal */}
      {showEffectsModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-80 overflow-hidden border border-black/5 animate-in zoom-in-95 duration-200">
            <div className="h-12 border-b border-black/5 flex items-center justify-between px-4 bg-gray-50">
              <span className="font-semibold text-sm">编辑特效</span>
              <button onClick={() => setShowEffectsModal(false)} className="p-1 hover:bg-black/5 rounded">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3">
               {[
                 { key: 'stroke', label: '描边' },
                 { key: 'shadow', label: '投影' },
                 { key: 'glow', label: '发光' },
                 { key: 'reflection', label: '倒影' },
                 { key: 'threeD', label: '3D效果' },
                 { key: 'glass', label: '毛玻璃' },
               ].map((effect) => (
                 <label key={effect.key} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                   <span className="text-sm text-gray-700">{effect.label}</span>
                   <input 
                     type="checkbox" 
                     checked={effects[effect.key as keyof typeof effects]}
                     onChange={(e) => setEffects(prev => ({ ...prev, [effect.key]: e.target.checked }))}
                     className="w-4 h-4 rounded border-gray-300 text-accent-primary focus:ring-accent-primary" 
                   />
                 </label>
               ))}
            </div>
          </div>
        </div>
      )}

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
            {isDirty ? '正在编辑' : '已保存'}
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
           
           <div className="h-5 w-px bg-black/10 mx-1" />
           
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

          <Tooltip content="保存 (Ctrl+S)" position="bottom">
            <button 
              onClick={handleSaveWrapper}
              className="btn-primary py-1.5 px-3 text-sm flex items-center gap-2 rounded-lg"
            >
              <Save size={16} />
              Save
            </button>
          </Tooltip>
          {/* Hidden button to trigger save from timeout */}
          <button id="hidden-save-trigger" className="hidden" onClick={saveProject} />
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
             <Tooltip content="背景设置" position="bottom">
               <button 
                 className={clsx("p-1.5 rounded-lg transition-colors", activeTool === 'background' ? "bg-black/5" : "hover:bg-black/5")}
                 onClick={() => handleToolClick('background')}
               >
                 <AppWindow size={18} />
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
             <div className="w-px h-4 bg-black/10 mx-1" />
             <Tooltip content="辅助线" position="bottom">
                <button 
                  className={clsx("p-1.5 rounded-lg transition-colors", showRulers ? "bg-black/5" : "hover:bg-black/5")}
                  onClick={() => setShowRulers(!showRulers)}
                >
                  <Ruler size={16} />
                </button>
             </Tooltip>
          </div>
          
          {/* Flip Controls */}
          <div className="flex items-center gap-0.5 p-1 pr-2 border-r border-black/5 ml-1">
             <Tooltip content="水平翻转" position="bottom"><button onClick={() => handleFlip('h')} className={clsx("p-1.5 rounded-lg transition-colors", elementProps.flipX ? "bg-black/5 text-black" : "hover:bg-black/5")}><FlipHorizontal size={16} /></button></Tooltip>
             <Tooltip content="垂直翻转" position="bottom"><button onClick={() => handleFlip('v')} className={clsx("p-1.5 rounded-lg transition-colors", elementProps.flipY ? "bg-black/5 text-black" : "hover:bg-black/5")}><FlipVertical size={16} /></button></Tooltip>
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
                 min={0}
               />
               <span className="text-[10px] text-gray-400">px</span>
             </div>

             {/* Import Local Image */}
             <div className="w-px h-4 bg-black/10 mx-2" />
             <input 
               type="file" 
               ref={fileInputRef} 
               className="hidden" 
               accept="image/*" 
               onChange={handleFileUpload} 
             />
             <Tooltip content="打开本地图片" position="bottom">
               <button 
                 onClick={handleLocalImageClick}
                 className="p-1.5 hover:bg-black/5 rounded-lg transition-colors text-gray-700"
               >
                 <ImageIcon size={18} />
               </button>
             </Tooltip>
          </div>
        </div>

        {/* View Options */}
        <div className="flex items-center gap-2">
           {/* Rulers moved to top toolbar */}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-[#F9FAFB] overflow-hidden flex">
        
        {/* Left Sidebar - Tool Details */}
        {showLeftPanel && (
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-white border-r border-black/5 flex flex-col animate-in slide-in-from-left duration-200 z-30 shadow-xl">
            <div className="h-12 border-b border-black/5 flex items-center justify-between px-4">
              <span className="font-semibold text-sm">
                {leftPanelContent === 'text' && '文本工具'}
                {leftPanelContent === 'material' && '素材库'}
                {leftPanelContent === 'image' && '图片资源'}
                {leftPanelContent === 'background' && '背景设置'}
                {leftPanelContent === 'draw' && '画笔工具'}
                {leftPanelContent === 'table' && '表格工具'}
                {leftPanelContent === 'ai' && 'AI 助手'}
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
                     <button 
                       onClick={() => handleAddElement('text', undefined, { fontSize: 48, fontWeight: 'bold' }, 'Heading')}
                       className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left text-2xl font-bold border border-transparent hover:border-black/5 transition-all"
                     >
                       Heading
                     </button>
                     <button 
                       onClick={() => handleAddElement('text', undefined, { fontSize: 32, fontWeight: 'semibold' }, 'Subheading')}
                       className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left text-lg font-semibold border border-transparent hover:border-black/5 transition-all"
                     >
                       Subheading
                     </button>
                     <button 
                       onClick={() => handleAddElement('text', undefined, { fontSize: 16, fontWeight: 'normal' }, 'Body text')}
                       className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left text-sm text-gray-600 border border-transparent hover:border-black/5 transition-all"
                     >
                       Body text
                     </button>
                   </div>
                </div>
              )}

              {leftPanelContent === 'material' && (
                <div className="space-y-4 h-full flex flex-col">
                  {/* Search Bar */}
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="搜索素材..." 
                      className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-accent-primary transition-colors"
                    />
                    <ScanEye className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                  </div>

                  {/* Upload Button */}
                  <label className="flex items-center justify-center gap-2 w-full py-2 bg-black text-white rounded-lg text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity">
                     <Upload size={14} />
                     上传个人素材
                     <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>

                  {/* Content Area - Accordion List */}
                  <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                    {/* Basic Shapes */}
                    <details className="group/accordion" open={activeMaterialTab === 'basic'}>
                      <summary 
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer list-none select-none transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveMaterialTab(activeMaterialTab === 'basic' ? 'none' : 'basic');
                        }}
                      >
                        <div className={clsx("text-gray-400 transition-transform duration-200", activeMaterialTab === 'basic' ? "rotate-90" : "")}>
                          <ChevronRight size={14} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">基础形状</span>
                      </summary>
                      
                      <div className={clsx("pl-2 pt-2", activeMaterialTab === 'basic' ? "block" : "hidden")}>
                        <div className="grid grid-cols-3 gap-3 pb-2">
                          {[
                            { icon: Circle, label: '圆形', type: 'circle' },
                            { icon: Square, label: '正方形', type: 'square' },
                            { icon: Circle, label: '椭圆形', type: 'ellipse' },
                            { icon: Minus, label: '直线段', type: 'line' },
                            { icon: MoveRight, label: '箭头线段', type: 'arrow' },
                            { icon: Triangle, label: '三角形', type: 'triangle' },
                            { icon: RectangleHorizontal, label: '矩形', type: 'rect' },
                          ].map((item, i) => (
                            <button 
                              key={i} 
                              onClick={() => {
                                handleAddElement('shape', item.type, {
                                  w: item.type === 'line' || item.type === 'arrow' ? 200 : 100,
                                  h: item.type === 'line' || item.type === 'arrow' ? 2 : (item.type === 'rect' || item.type === 'ellipse' ? 60 : 100),
                                  radius: item.type === 'circle' ? 50 : 0
                                });
                              }}
                              className="aspect-square flex flex-col items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 rounded-xl border border-transparent hover:border-black/5 transition-all"
                            >
                              <item.icon size={24} className="text-gray-600" />
                              <span className="text-[10px] text-gray-500">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </details>

                    {/* BoCom Materials */}
                    <details className="group/accordion" open={activeMaterialTab === 'bocom'}>
                      <summary 
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer list-none select-none transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveMaterialTab(activeMaterialTab === 'bocom' ? 'none' : 'bocom');
                        }}
                      >
                        <div className={clsx("text-gray-400 transition-transform duration-200", activeMaterialTab === 'bocom' ? "rotate-90" : "")}>
                          <ChevronRight size={14} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">交行素材</span>
                      </summary>

                      <div className={clsx("pl-4 pt-2 space-y-4 pb-2", activeMaterialTab === 'bocom' ? "block" : "hidden")}>
                        {/* 小福鹿系列 */}
                        <details className="group" open>
                          <summary className="flex items-center gap-2 text-xs font-medium text-gray-900 cursor-pointer list-none mb-2 outline-none select-none">
                             <div className="text-gray-400 transition-transform group-open:rotate-90">
                                <ChevronRight size={12} />
                             </div>
                             小福鹿系列 (通用)
                             <span className="text-[10px] text-gray-400 font-normal ml-auto mr-2">24</span>
                          </summary>
                          <div className="pl-2">
                             <div className="grid grid-cols-3 gap-2">
                                {(expandedCategories['bocom-general'] ? Array.from({length: 24}, (_, i) => i + 1) : Array.from({length: 6}, (_, i) => i + 1)).map(i => (
                                  <button 
                                    key={i} 
                                    onClick={() => handleAddElement('bocom', 'series-' + i)}
                                    className="aspect-square bg-white rounded-lg flex flex-col items-center justify-center gap-1 border border-gray-100 hover:border-accent-primary hover:shadow-sm transition-all group/item"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[10px] text-orange-500 font-bold group-hover/item:scale-110 transition-transform">鹿</div>
                                    <span className="text-[9px] text-gray-400">动作 {i}</span>
                                  </button>
                                ))}
                             </div>
                             <button 
                               onClick={() => setExpandedCategories(prev => ({...prev, 'bocom-general': !prev['bocom-general']}))}
                               className="w-full mt-2 py-1.5 flex items-center justify-center gap-1 text-[10px] text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                             >
                                <span>{expandedCategories['bocom-general'] ? '收起' : '查看全部 (24)'}</span>
                                <ChevronDown size={12} className={clsx("transition-transform", expandedCategories['bocom-general'] ? "rotate-180" : "")} />
                             </button>
                          </div>
                        </details>
 
                        {/* 分行特色小福鹿 */}
                        <details className="group" open>
                          <summary className="flex items-center gap-2 text-xs font-medium text-gray-900 cursor-pointer list-none mb-2 outline-none select-none">
                             <div className="text-gray-400 transition-transform group-open:rotate-90">
                                <ChevronRight size={12} />
                             </div>
                             分行特色小福鹿
                          </summary>
                          <div className="grid grid-cols-3 gap-2 pl-2">
                             {['北京', '上海', '广东', '深圳', '江苏', '浙江'].map((branch, i) => (
                               <button 
                                key={i} 
                                onClick={() => handleAddElement('bocom', 'branch-' + i)}
                                className="aspect-square bg-white rounded-lg flex flex-col items-center justify-center gap-1 border border-gray-100 hover:border-accent-primary hover:shadow-sm transition-all group/item"
                              >
                                 <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[10px] text-blue-500 font-bold group-hover/item:scale-110 transition-transform">{branch.slice(0,1)}</div>
                                 <span className="text-[9px] text-gray-400">{branch}</span>
                               </button>
                             ))}
                          </div>
                        </details>
 
                        {/* Logo */}
                        <details className="group" open>
                          <summary className="flex items-center gap-2 text-xs font-medium text-gray-900 cursor-pointer list-none mb-2 outline-none select-none">
                             <div className="text-gray-400 transition-transform group-open:rotate-90">
                                <ChevronRight size={12} />
                             </div>
                             交行logo
                          </summary>
                          <div className="grid grid-cols-2 gap-2 pl-2">
                             <div className="h-12 bg-blue-50 rounded-lg flex items-center justify-center text-xs text-blue-700 font-bold border border-blue-100">
                               Bank of Comm.
                             </div>
                             <div className="h-12 bg-white rounded-lg flex items-center justify-center text-xs text-gray-500 font-bold border border-gray-200">
                               Icon Only
                             </div>
                             <div className="h-12 bg-white rounded-lg flex items-center justify-center text-xs text-gray-500 font-bold border border-gray-200">
                               White Logo
                             </div>
                             <div className="h-12 bg-blue-600 rounded-lg flex items-center justify-center text-xs text-white font-bold border border-blue-700">
                               Blue Logo
                             </div>
                          </div>
                        </details>
                      </div>
                    </details>

                    {/* Personal Materials */}
                    <details className="group/accordion" open={activeMaterialTab === 'personal'}>
                      <summary 
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer list-none select-none transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveMaterialTab(activeMaterialTab === 'personal' ? 'none' : 'personal');
                        }}
                      >
                        <div className={clsx("text-gray-400 transition-transform duration-200", activeMaterialTab === 'personal' ? "rotate-90" : "")}>
                          <ChevronRight size={14} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">个人素材</span>
                      </summary>

                      <div className={clsx("pl-2 pt-2 space-y-3 pb-2", activeMaterialTab === 'personal' ? "block" : "hidden")}>
                         <div className="grid grid-cols-3 gap-2">
                            {personalMaterials.map((url, i) => (
                              <div 
                                key={i} 
                                onClick={() => {
                                  setSelectedElement(`personal-${i}`);
                                  // Set image source for rendering (simulated)
                                }}
                                className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative group cursor-pointer hover:border-accent-primary transition-colors"
                              >
                                 <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                                 <button className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                   <X size={10} />
                                 </button>
                              </div>
                            ))}
                            {personalMaterials.length === 0 && (
                              <div className="col-span-2 py-8 text-center text-xs text-gray-400">
                                暂无个人素材
                              </div>
                            )}
                         </div>
                      </div>
                    </details>

                    {/* Placeholder Categories */}
                    {['图标', '照片', '样机'].map((cat) => (
                      <details key={cat} className="group/accordion">
                        <summary className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer list-none select-none transition-colors">
                          <div className="text-gray-400 transition-transform duration-200 group-open/accordion:rotate-90">
                            <ChevronRight size={14} />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{cat}</span>
                        </summary>
                        <div className="pl-8 py-2 text-xs text-gray-400">
                          暂无{cat}内容
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {leftPanelContent === 'image' && (
                <div className="space-y-4">
                  <label className="flex items-center justify-center gap-2 w-full py-2 bg-black text-white rounded-lg text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity">
                     <Upload size={14} />
                     上传图片
                     <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                  <div className="text-xs font-medium text-gray-500">推荐图片</div>
                  <div className="grid grid-cols-2 gap-2">
                     {[1,2,3,4,5,6].map(i => (
                       <div key={i} className="aspect-video bg-gray-100 rounded-lg border border-black/5" />
                     ))}
                  </div>
                </div>
              )}

              {leftPanelContent === 'background' && (
                <div className="space-y-4">
                   <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-500">纯色填充</div>
                      <div className="grid grid-cols-5 gap-2">
                        {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000', '#ffffff', '#808080', '#c0c0c0'].map(c => (
                          <button key={c} onClick={() => setCanvasBackground(c)} className="w-8 h-8 rounded-full border border-black/5 hover:scale-110 transition-transform" style={{backgroundColor: c}} />
                        ))}
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-500">渐变背景</div>
                      <div className="grid grid-cols-2 gap-2">
                         <div onClick={() => setCanvasBackground('linear-gradient(to right, #3b82f6, #06b6d4)')} className="h-16 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 cursor-pointer" />
                         <div onClick={() => setCanvasBackground('linear-gradient(to right, #a855f7, #ec4899)')} className="h-16 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 cursor-pointer" />
                         <div onClick={() => setCanvasBackground('linear-gradient(to right, #f59e0b, #f97316)')} className="h-16 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 cursor-pointer" />
                         <div onClick={() => setCanvasBackground('linear-gradient(to right, #10b981, #14b8a6)')} className="h-16 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 cursor-pointer" />
                      </div>
                   </div>
                </div>
              )}

              {leftPanelContent === 'draw' && (
                <div className="space-y-4">
                   <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-500">笔刷类型</div>
                      <div className="space-y-2">
                         <button className="w-full flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 border border-transparent hover:border-black/5 transition-all">
                           <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white"><PenTool size={16}/></div>
                           <span className="text-sm">钢笔</span>
                         </button>
                         <button className="w-full flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                           <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600"><Minus size={16}/></div>
                           <span className="text-sm">马克笔</span>
                         </button>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-500">笔刷粗细</div>
                      <input type="range" className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                   </div>
                </div>
              )}

              {leftPanelContent === 'table' && (
                <div className="space-y-4">
                   <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-500">插入表格</div>
                      <div className="grid grid-cols-5 gap-1 p-2 bg-gray-50 rounded-lg border border-black/5">
                         {[...Array(25)].map((_, i) => (
                           <div key={i} className="w-full aspect-square border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-colors" />
                         ))}
                      </div>
                      <div className="flex gap-2">
                        <input type="number" placeholder="行" className="w-full p-2 bg-gray-50 rounded-lg text-xs border border-gray-200 outline-none focus:border-black transition-colors" />
                        <input type="number" placeholder="列" className="w-full p-2 bg-gray-50 rounded-lg text-xs border border-gray-200 outline-none focus:border-black transition-colors" />
                      </div>
                      <button className="w-full py-2 bg-black text-white rounded-lg text-xs font-medium hover:opacity-90 transition-opacity">插入表格</button>
                   </div>
                </div>
              )}

              {leftPanelContent === 'ai' && (
                <div className="space-y-4">
                   <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-500">AI 创意工坊</div>
                      <textarea className="w-full h-32 p-3 bg-gray-50 rounded-lg text-xs resize-none outline-none focus:ring-1 focus:ring-accent-primary border border-gray-200 transition-all" placeholder="描述你想要的画面..." />
                      <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                        <Sparkles size={14} />
                        开始生成
                      </button>
                   </div>
                   <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-[10px] text-purple-700 leading-relaxed">
                      AI 修图功能正在开发中，敬请期待更强大的图像处理能力。
                   </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Center Canvas Area */}
        <div className="w-full h-full relative overflow-hidden flex flex-col">
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
                className="shadow-2xl transition-all duration-300 relative group"
                style={{ 
                  width: '800px', 
                  height: '600px',
                  backgroundColor: canvasBackground,
                  transform: `scale(${zoom / 100})`,
                  borderRadius: `${borderRadius}px`
                }}
              >
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-300 pointer-events-none">
                    <ImageIcon size={64} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium">1920 x 1080</p>
                    <p className="text-sm">Drag assets here</p>
                 </div>
                 
                 {/* Elements Rendering */}
                 {elements.map((el) => {
                   const isSelected = selectedElement === el.id;
                   const props = isSelected ? elementProps : el.props;
                   const currentShapeType = el.subType;
                   
                   return (
                    <div 
                      key={el.id}
                      onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        left: props.x,
                        top: props.y,
                        width: props.w,
                        height: props.h,
                        transform: `rotate(${props.rotation}deg) scaleX(${props.flipX ? -1 : 1}) scaleY(${props.flipY ? -1 : 1}) ${isSelected && effects.threeD ? 'perspective(500px) rotateX(20deg)' : ''}`,
                        opacity: props.opacity / 100,
                        backgroundColor: (currentShapeType === 'line' || currentShapeType === 'arrow' || el.type === 'text') ? 'transparent' : props.fill,
                        borderColor: props.stroke,
                        borderWidth: (currentShapeType === 'line' || currentShapeType === 'arrow') ? 0 : `${props.strokeWidth}px`,
                        borderRadius: currentShapeType === 'circle' ? '50%' : `${props.radius}px`,
                        boxShadow: isSelected ? [
                           effects.shadow ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '',
                           effects.glow ? `0 0 20px ${props.fill}` : ''
                        ].filter(Boolean).join(', ') || 'none' : 'none',
                        WebkitBoxReflect: isSelected && effects.reflection ? 'below 0px linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.4))' : undefined,
                      }}
                      className={clsx(
                        "absolute cursor-move z-10 flex items-center justify-center",
                        isSelected && effects.glass && "backdrop-blur-md bg-white/30",
                        // Special handling for text vs shape
                        isSelected && el.type === 'text' && "bg-transparent border-2 border-accent-primary"
                      )}
                    >
                      {/* Floating Toolbar */}
                      {isSelected && (
                        <div 
                          className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white p-1 rounded-lg shadow-xl border border-black/5 cursor-default pointer-events-auto"
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          style={{ transform: `scaleX(${props.flipX ? -1 : 1}) scaleY(${props.flipY ? -1 : 1})` }}
                        >
                          <Tooltip content="复制" position="top">
                            <button onClick={(e) => { 
                                e.stopPropagation(); 
                                const newId = `${el.type}-${Date.now()}`;
                                const newEl = { ...el, id: newId, props: { ...el.props, x: el.props.x + 20, y: el.props.y + 20 } };
                                setElements(prev => [...prev, newEl]);
                                setSelectedElement(newId);
                                setElementProps(newEl.props);
                            }} className="p-1.5 hover:bg-black/5 rounded text-gray-600 transition-colors">
                              <Copy size={14} />
                            </button>
                          </Tooltip>
                          <div className="w-px h-3 bg-black/10" />
                          <Tooltip content="删除" position="top">
                            <button onClick={(e) => { 
                                e.stopPropagation(); 
                                setElements(prev => prev.filter(item => item.id !== el.id));
                                setSelectedElement(null); 
                            }} className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </Tooltip>
                        </div>
                      )}

                      {el.type === 'text' && (
                        <h2 
                          className="whitespace-nowrap"
                          style={{
                            fontFamily: props.fontFamily,
                            fontSize: `${props.fontSize}px`,
                            fontWeight: props.fontWeight,
                            fontStyle: props.fontStyle,
                            textDecoration: props.textDecoration,
                            textAlign: props.textAlign as any,
                            lineHeight: props.lineHeight,
                            letterSpacing: `${props.letterSpacing}px`,
                            writingMode: props.writingMode as any,
                            color: props.fill,
                          }}
                        >{el.content || 'Hello World'}</h2>
                      )}
                      
                      {currentShapeType === 'triangle' && (
                        <div style={{
                          width: 0,
                          height: 0,
                          borderLeft: `${props.w / 2}px solid transparent`,
                          borderRight: `${props.w / 2}px solid transparent`,
                          borderBottom: `${props.h}px solid ${props.fill}`,
                        }} />
                      )}

                       {(currentShapeType === 'line' || currentShapeType === 'arrow') && (
                          <div className="w-full h-full flex items-center">
                             <div className="w-full h-0.5 bg-black" style={{ backgroundColor: props.stroke, height: Math.max(2, props.strokeWidth) }} />
                             {currentShapeType === 'arrow' && (
                               <div className="w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-8" style={{ borderLeftColor: props.stroke }} />
                             )}
                          </div>
                       )}

                       {(el.type === 'image' || el.type === 'bocom') && (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs overflow-hidden rounded-lg">
                             {el.src ? (
                               <img src={el.src} className="w-full h-full object-cover" alt="" />
                             ) : (
                               <span>{el.type === 'bocom' ? 'BoCom Asset' : 'Image'}</span>
                             )}
                          </div>
                       )}

                       {/* Selection Handles (always show if selected) */}
                      {isSelected && (
                        <>
                          <div onMouseDown={(e) => handleResizeStart(e, 'resize-tl')} className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-white border-2 border-accent-primary rounded-full cursor-nw-resize pointer-events-auto" />
                          <div onMouseDown={(e) => handleResizeStart(e, 'resize-tr')} className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-white border-2 border-accent-primary rounded-full cursor-ne-resize pointer-events-auto" />
                          <div onMouseDown={(e) => handleResizeStart(e, 'resize-bl')} className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 bg-white border-2 border-accent-primary rounded-full cursor-sw-resize pointer-events-auto" />
                          <div onMouseDown={(e) => handleResizeStart(e, 'resize-br')} className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-white border-2 border-accent-primary rounded-full cursor-se-resize pointer-events-auto" />
                        </>
                      )}
                    </div>
                   );
                 })}
              </div>
            </div>
          </div>

          {/* Toolbar (Bottom Center) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white p-2 rounded-2xl shadow-xl border border-black/5 z-30">
            {/* Cursor Tool with Dropdown */}
            <div className="relative">
               <div className="flex items-center gap-0.5 bg-gray-50 rounded-xl p-1">
                 <ToolButton 
                   icon={activeTool === 'pan' ? Hand : MousePointer2} 
                   label={activeTool === 'pan' ? "拖拽 (H)" : "选择 (V)"}
                   isActive={activeTool === 'select' || activeTool === 'pan'} 
                   onClick={() => handleToolClick(activeTool === 'pan' ? 'pan' : 'select')} 
                 />
                 <button 
                   onClick={() => setIsCursorMenuOpen(!isCursorMenuOpen)}
                   className={clsx(
                     "p-1 rounded-lg hover:bg-black/5 text-gray-500 transition-colors",
                     isCursorMenuOpen && "bg-black/5 text-black"
                   )}
                 >
                   <ChevronDown size={14} />
                 </button>
               </div>
               
               {isCursorMenuOpen && (
                 <div className="absolute bottom-full left-0 mb-2 w-40 bg-gray-800 text-white rounded-xl shadow-xl overflow-hidden py-1 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
                    <button 
                      onClick={() => { handleToolClick('select'); setIsCursorMenuOpen(false); }}
                      className="w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MousePointer2 size={16} />
                        <span>Move</span>
                      </div>
                      <span className="text-xs text-white/50">V</span>
                      {activeTool === 'select' && <div className="w-1.5 h-1.5 bg-accent-primary rounded-full ml-auto" />}
                    </button>
                    <button 
                      onClick={() => { handleToolClick('pan'); setIsCursorMenuOpen(false); }}
                      className="w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Hand size={16} />
                        <span>Hand tool</span>
                      </div>
                      <span className="text-xs text-white/50">H</span>
                      {activeTool === 'pan' && <div className="w-1.5 h-1.5 bg-accent-primary rounded-full ml-auto" />}
                    </button>
                    <div className="h-px bg-white/10 mx-2 my-1" />
                    <button 
                      onClick={() => { setShowRulers(!showRulers); setIsCursorMenuOpen(false); }}
                      className="w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Ruler size={16} />
                        <span>Ruler</span>
                      </div>
                      <span className="text-xs text-white/50">Shift+R</span>
                      {showRulers && <div className="w-1.5 h-1.5 bg-accent-primary rounded-full ml-auto" />}
                    </button>
                 </div>
               )}
            </div>

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
          </div>
        </div>

        {/* Right Sidebar - Element Properties */}
        {selectedElement && (
            <div className="absolute top-0 right-0 bottom-0 w-64 bg-white border-l border-black/5 flex flex-col animate-in slide-in-from-right duration-200 z-30 shadow-xl">
              <div className="h-12 border-b border-black/5 flex items-center justify-between px-4">
                <span className="font-semibold text-sm">
                  {selectedElement.startsWith('text') && '文本属性'}
                  {(selectedElement.startsWith('shape') || selectedElement.startsWith('bocom') || selectedElement.startsWith('personal')) && '素材属性'}
                  {selectedElement.startsWith('image') && '图片属性'}
                  {selectedElement.startsWith('bg') && '背景属性'}
                  {selectedElement.startsWith('draw') && '路径属性'}
                  {selectedElement.startsWith('table') && '表格属性'}
                  {selectedElement.startsWith('ai') && 'AI 生成属性'}
                </span>
                <button onClick={() => setSelectedElement(null)} className="p-1 hover:bg-black/5 rounded">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-6">
                
                {/* Text Specific Properties */}
                {selectedElement.startsWith('text') && (
                  <div className="space-y-4">
                     <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">文本属性</div>
                     
                     {/* Content Input */}
                     <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">内容</label>
                        <textarea 
                          className="w-full bg-gray-50 border border-transparent hover:border-black/10 rounded-lg px-2 py-1.5 text-xs outline-none resize-none focus:bg-white focus:border-accent-primary transition-colors"
                          rows={2}
                          value={selectedContent}
                          onChange={(e) => setSelectedContent(e.target.value)}
                        />
                     </div>

                     {/* Font & Size */}
                     <div className="grid grid-cols-2 gap-2">
                        <select 
                          className="w-full bg-gray-50 border border-transparent hover:border-black/10 rounded-lg px-2 py-1.5 text-xs outline-none"
                          value={elementProps.fontFamily}
                          onChange={(e) => setElementProps(p => ({...p, fontFamily: e.target.value}))}
                        >
                          <option value="Inter">Inter</option>
                          <option value="Arial">Arial</option>
                          <option value="Serif">Serif</option>
                        </select>
                         <div className="flex items-center gap-1 bg-gray-50 border border-transparent hover:border-black/10 rounded-lg px-2 py-1.5">
                            <span className="text-[10px] text-gray-400">Size</span>
                            <input type="number" className="w-full bg-transparent outline-none text-xs text-right" value={elementProps.fontSize} onChange={(e) => setElementProps(p => ({...p, fontSize: Number(e.target.value)}))} />
                         </div>
                     </div>

                     {/* Style Toggles & Color */}
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-0.5 bg-gray-50 rounded-lg p-1">
                           <button onClick={() => setElementProps(p => ({...p, fontWeight: p.fontWeight === 'bold' ? 'normal' : 'bold'}))} className={clsx("p-1.5 rounded transition-colors", elementProps.fontWeight === 'bold' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black")}><Bold size={14} /></button>
                           <button onClick={() => setElementProps(p => ({...p, fontStyle: p.fontStyle === 'italic' ? 'normal' : 'italic'}))} className={clsx("p-1.5 rounded transition-colors", elementProps.fontStyle === 'italic' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black")}><Italic size={14} /></button>
                           <button onClick={() => setElementProps(p => ({...p, textDecoration: p.textDecoration === 'underline' ? 'none' : 'underline'}))} className={clsx("p-1.5 rounded transition-colors", elementProps.textDecoration === 'underline' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black")}><Underline size={14} /></button>
                           <button onClick={() => setElementProps(p => ({...p, textDecoration: p.textDecoration === 'line-through' ? 'none' : 'line-through'}))} className={clsx("p-1.5 rounded transition-colors", elementProps.textDecoration === 'line-through' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black")}><Strikethrough size={14} /></button>
                        </div>
                        <div className="flex items-center gap-2">
                           <input type="color" value={elementProps.fill} onChange={(e) => setElementProps(p => ({...p, fill: e.target.value}))} className="w-6 h-6 rounded overflow-hidden border-0 p-0 cursor-pointer" />
                           <input 
                              type="text" 
                              value={elementProps.fill} 
                              onChange={(e) => setElementProps(p => ({...p, fill: e.target.value}))}
                              className="w-16 text-xs border border-transparent hover:border-gray-200 focus:border-black/20 rounded px-1 py-0.5 uppercase text-gray-600 outline-none transition-colors"
                           />
                        </div>
                     </div>

                     {/* Alignment */}
                     <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
                        <button onClick={() => setElementProps(p => ({...p, textAlign: 'left'}))} className={clsx("flex-1 p-1.5 rounded transition-colors flex justify-center", elementProps.textAlign === 'left' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black")}><AlignLeft size={14} /></button>
                        <button onClick={() => setElementProps(p => ({...p, textAlign: 'center'}))} className={clsx("flex-1 p-1.5 rounded transition-colors flex justify-center", elementProps.textAlign === 'center' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black")}><AlignCenter size={14} /></button>
                        <button onClick={() => setElementProps(p => ({...p, textAlign: 'right'}))} className={clsx("flex-1 p-1.5 rounded transition-colors flex justify-center", elementProps.textAlign === 'right' ? "bg-white shadow-sm text-black" : "text-gray-500 hover:text-black")}><AlignRight size={14} /></button>
                     </div>

                     {/* Spacing & Line Height */}
                     <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                           <label className="text-[10px] text-gray-400">行高</label>
                           <input type="number" step="0.1" className="w-full bg-gray-50 border border-transparent hover:border-black/10 rounded-lg px-2 py-1 text-xs outline-none" value={elementProps.lineHeight} onChange={(e) => setElementProps(p => ({...p, lineHeight: Number(e.target.value)}))} />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] text-gray-400">字间距</label>
                           <input type="number" step="1" className="w-full bg-gray-50 border border-transparent hover:border-black/10 rounded-lg px-2 py-1 text-xs outline-none" value={elementProps.letterSpacing} onChange={(e) => setElementProps(p => ({...p, letterSpacing: Number(e.target.value)}))} />
                        </div>
                     </div>

                     {/* Vertical Text Toggle */}
                     <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-gray-600">竖排文字</span>
                        <button 
                           onClick={() => setElementProps(p => ({...p, writingMode: p.writingMode === 'vertical-rl' ? 'horizontal-tb' : 'vertical-rl'}))}
                           className={clsx("w-10 h-5 rounded-full relative transition-colors", elementProps.writingMode === 'vertical-rl' ? "bg-black" : "bg-gray-200")}
                        >
                           <div className={clsx("w-3 h-3 bg-white rounded-full absolute top-1 transition-all", elementProps.writingMode === 'vertical-rl' ? "left-6" : "left-1")} />
                        </button>
                     </div>
                  </div>
                )}

                {/* Image Specific Properties */}
                {selectedElement.startsWith('image') && (
                   <div className="space-y-3">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">图片样式</div>
                      <div className="space-y-2">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-400">圆角</span>
                            <span className="text-xs font-mono text-gray-400">{elementProps.radius}px</span>
                         </div>
                         <input type="range" min="0" max="100" className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" value={elementProps.radius} onChange={(e) => setElementProps(p => ({...p, radius: Number(e.target.value)}))} />
                      </div>
                      <div className="space-y-2 pt-2">
                         <div className="text-[10px] text-gray-400">滤镜 (模拟)</div>
                         <div className="grid grid-cols-3 gap-2">
                            {['原图', '黑白', '复古', '冷色', '暖色', '鲜艳'].map(filter => (
                               <button key={filter} className="py-1 px-2 bg-gray-50 hover:bg-gray-100 rounded text-[10px] text-gray-600 border border-transparent hover:border-black/5 transition-all">
                                  {filter}
                               </button>
                            ))}
                         </div>
                      </div>
                      <button className="w-full py-2 mt-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">
                         替换图片
                      </button>
                   </div>
                )}

                {/* Shape/Material Properties (Original) */}
                {(selectedElement.startsWith('shape') || selectedElement.startsWith('bocom') || selectedElement.startsWith('personal')) && (
                <div className="space-y-3">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">形状属性</div>
                  
                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">填充色</label>
                        <div className="flex items-center gap-2">
                           <input type="color" value={elementProps.fill} onChange={(e) => setElementProps(p => ({...p, fill: e.target.value}))} className="w-6 h-6 rounded overflow-hidden border-0 p-0" />
                           <input 
                              type="text" 
                              value={elementProps.fill} 
                              onChange={(e) => setElementProps(p => ({...p, fill: e.target.value}))}
                              className="w-16 text-xs border border-transparent hover:border-gray-200 focus:border-black/20 rounded px-1 py-0.5 uppercase text-gray-600 outline-none transition-colors"
                           />
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">描边色</label>
                        <div className="flex items-center gap-2">
                           <input type="color" value={elementProps.stroke} onChange={(e) => setElementProps(p => ({...p, stroke: e.target.value}))} className="w-6 h-6 rounded overflow-hidden border-0 p-0" />
                           <input 
                              type="text" 
                              value={elementProps.stroke} 
                              onChange={(e) => setElementProps(p => ({...p, stroke: e.target.value}))}
                              className="w-16 text-xs border border-transparent hover:border-gray-200 focus:border-black/20 rounded px-1 py-0.5 uppercase text-gray-600 outline-none transition-colors"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">描边宽度</span>
                      <span className="text-xs font-mono text-gray-400">{elementProps.strokeWidth}px</span>
                    </div>
                    <input type="range" min="0" max="20" className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" value={elementProps.strokeWidth} onChange={(e) => setElementProps(p => ({...p, strokeWidth: Number(e.target.value)}))} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">圆角</span>
                      <span className="text-xs font-mono text-gray-400">{elementProps.radius}px</span>
                    </div>
                    <input type="range" min="0" max="100" className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" value={elementProps.radius} onChange={(e) => setElementProps(p => ({...p, radius: Number(e.target.value)}))} />
                  </div>
                </div>
                )}

                {/* Draw Specific Properties */}
                {selectedElement.startsWith('draw') && (
                   <div className="space-y-3">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">笔触设置</div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400">颜色</label>
                        <div className="flex items-center gap-2">
                           <input type="color" value={elementProps.stroke} onChange={(e) => setElementProps(p => ({...p, stroke: e.target.value}))} className="w-6 h-6 rounded overflow-hidden border-0 p-0" />
                           <input 
                              type="text" 
                              value={elementProps.stroke} 
                              onChange={(e) => setElementProps(p => ({...p, stroke: e.target.value}))}
                              className="w-16 text-xs border border-transparent hover:border-gray-200 focus:border-black/20 rounded px-1 py-0.5 uppercase text-gray-600 outline-none transition-colors"
                           />
                        </div>
                     </div>
                     <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">粗细</span>
                          <span className="text-xs font-mono text-gray-400">{elementProps.strokeWidth}px</span>
                        </div>
                        <input type="range" min="1" max="50" className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" value={elementProps.strokeWidth} onChange={(e) => setElementProps(p => ({...p, strokeWidth: Number(e.target.value)}))} />
                      </div>
                   </div>
                )}

                {/* Table Specific Properties */}
                 {selectedElement.startsWith('table') && (
                    <div className="space-y-3">
                       <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">表格样式</div>
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                             <label className="text-[10px] text-gray-400">行数</label>
                             <input type="number" defaultValue={4} className="w-full bg-gray-50 border border-transparent hover:border-black/10 rounded-lg px-2 py-1 text-sm outline-none" />
                          </div>
                          <div className="space-y-1">
                             <label className="text-[10px] text-gray-400">列数</label>
                             <input type="number" defaultValue={5} className="w-full bg-gray-50 border border-transparent hover:border-black/10 rounded-lg px-2 py-1 text-sm outline-none" />
                          </div>
                       </div>
                       <div className="space-y-1 pt-1">
                          <label className="flex items-center gap-2 text-xs text-gray-700">
                             <input type="checkbox" defaultChecked className="rounded border-gray-300 text-black focus:ring-black" />
                             显示表头
                          </label>
                          <label className="flex items-center gap-2 text-xs text-gray-700">
                             <input type="checkbox" defaultChecked className="rounded border-gray-300 text-black focus:ring-black" />
                             斑马纹
                          </label>
                       </div>
                    </div>
                 )}

                 {/* AI Specific Properties */}
                 {selectedElement.startsWith('ai') && (
                    <div className="space-y-3">
                       <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">AI 生成选项</div>
                       <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 space-y-2">
                          <div className="text-[10px] text-purple-700 font-medium">Prompt</div>
                          <p className="text-[10px] text-purple-600 leading-relaxed line-clamp-3">
                             A futuristic city with flying cars, neon lights, cyberpunk style, high detail, 8k resolution...
                          </p>
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                          <button className="py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors">
                             重绘 (V1)
                          </button>
                          <button className="py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors">
                             重绘 (V2)
                          </button>
                       </div>
                       <div className="w-full h-px bg-black/5 my-2" />
                       {/* Reuse Image Properties for AI Image */}
                       <div className="space-y-2">
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] text-gray-400">圆角</span>
                             <span className="text-xs font-mono text-gray-400">{elementProps.radius}px</span>
                          </div>
                          <input type="range" min="0" max="100" className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" value={elementProps.radius} onChange={(e) => setElementProps(p => ({...p, radius: Number(e.target.value)}))} />
                       </div>
                    </div>
                 )}
 
                 <div className="w-full h-px bg-black/5" />

                {/* Common Properties: Position & Size */}
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
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400">旋转 (°)</label>
                      <input type="number" className="w-full bg-gray-50 border border-transparent hover:border-black/10 rounded-lg px-2 py-1 text-sm outline-none transition-colors" value={elementProps.rotation} onChange={(e) => setElementProps(p => ({...p, rotation: Number(e.target.value)}))} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400">不透明度 (%)</label>
                      <input type="number" min="0" max="100" className="w-full bg-gray-50 border border-transparent hover:border-black/10 rounded-lg px-2 py-1 text-sm outline-none transition-colors" value={elementProps.opacity} onChange={(e) => setElementProps(p => ({...p, opacity: Number(e.target.value)}))} />
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-black/5" />

                <button 
                  onClick={() => setShowEffectsModal(true)}
                  className="w-full py-2 bg-black text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  编辑特效
                </button>

                {/* Layer controls removed per request */}
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

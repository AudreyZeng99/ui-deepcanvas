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
  Table,
  Sparkles,
  Download,
  X,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Trash2,
  Copy,
  Package, // For Materials (Treasure Chest)
  Wallpaper, // For Background
  Shapes as ShapesIcon, // For Shapes
  Highlighter, // For Brush Styles
  Brush, // For Brush Styles
  Star,
  Heart,
  Hexagon,
  Octagon,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  Zap,
  Cloud,
  Check,
  Smile,
  Sun,
  Moon,
  Umbrella,
  Music,
  Headphones,
  Camera,
  Video,
  Mic,
  Bell,
  Calendar,
  Clock,
  MapPin,
  Tag,
  Flag,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  User,
  Users,
  Settings,
  Search,
  Home,
  Menu,
  Globe,
  Megaphone,
  RotateCw,
  Palette,
  ChevronLeft,
  Send,
  ImagePlus,
  Eraser,
  Crop,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Group,
  Ungroup,
} from 'lucide-react';
import clsx from 'clsx';
import CreateCanvasModal from '../components/CreateCanvasModal';
import MaterialsModal from '../components/MaterialsModal';
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
    visible?: boolean;
    locked?: boolean;
    groupId?: string;
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
  const [personalMaterials, setPersonalMaterials] = useState<string[]>([]);
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [showEffectsModal, setShowEffectsModal] = useState(false);
  const [isCursorMenuOpen, setIsCursorMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({}); // Default false = limited to 10
  const [effects, setEffects] = useState({
    stroke: false,
    shadow: false,
    glow: false,
    reflection: false,
    threeD: false,
    glass: false
  });
  
  // AI Assistant State
  const [aiMode, setAiMode] = useState<'blend' | 'edit' | 'erase'>('blend');
  const [aiChatHistory, setAiChatHistory] = useState<{id: string, role: 'user' | 'ai', type: 'text' | 'image', content: string}[]>([
    { id: 'welcome', role: 'ai', type: 'text', content: '你好！我是你的 AI 设计助手。\n\n1. AI修改只针对背景图。\n2. AI溶图：最多融合2张图片。\n3. AI改图：不框选是改整张图，框选则是修改选定区域。\n4. AI擦除：请注意框选颜色与背景色不要高度重合。使用框选后，提示词请说明框的颜色（如：请帮我擦除红色框中的内容）。\n\n提示：目前版本只支持单轮对话，多轮对话功能敬请期待。' }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiUploadedFiles, setAiUploadedFiles] = useState<File[]>([]);
  const [aiSelectionColor, setAiSelectionColor] = useState('#FF0000');
  const [aiSelectionBox, setAiSelectionBox] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [aiBoxStart, setAiBoxStart] = useState<{x: number, y: number} | null>(null);
  const aiFileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{x: number, y: number}[]>([]);
  const [brushType, setBrushType] = useState('solid');
  const [brushColor] = useState('#000000');
  const [brushWidth] = useState(5);

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
    
    saveProject({ elements });
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

  // Background Panel State
  const [customColor, setCustomColor] = useState('#ffffff');
  const [gradientStops, setGradientStops] = useState<{id: number, color: string, position: number}[]>([
    { id: 1, color: '#3b82f6', position: 0 },
    { id: 2, color: '#06b6d4', position: 100 }
  ]);
  const [gradientAngle, setGradientAngle] = useState(90);
  const [backgroundView, setBackgroundView] = useState<'main' | 'public' | 'traffic'>('main');

  const backgroundLibraryItems = [
    { id: 'public', icon: Globe, label: '公共背景库', bgClass: 'bg-blue-100', textClass: 'text-blue-600' },
    { id: 'traffic', icon: Megaphone, label: '流量投放素材', bgClass: 'bg-purple-100', textClass: 'text-purple-600' },
  ];

  // Mock Data for Background Libraries
  const publicBackgrounds = [
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80',
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80',
    'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80',
    'https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?w=400&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&q=80',
    'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=400&q=80',
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400&q=80',
  ];

  const trafficBackgrounds = [
    'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=400&q=80',
    'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&q=80',
    'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=400&q=80',
    'https://images.unsplash.com/photo-1557682260-96773eb01377?w=400&q=80',
    'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=400&q=80',
    'https://images.unsplash.com/photo-1614850523018-c4fd03882696?w=400&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
    'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&q=80',
  ];

  const applyGradient = () => {
    const stopsStr = gradientStops
      .sort((a, b) => a.position - b.position)
      .map(s => `${s.color} ${s.position}%`)
      .join(', ');
    setCanvasBackground(`linear-gradient(${gradientAngle}deg, ${stopsStr})`);
  };

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
      setSelectedElement(null); // Deselect when switching tools
    }

    const panelTools = ['text', 'shape', 'image', 'background', 'draw', 'table'];
    if (panelTools.includes(tool)) {
      setShowLeftPanel(true);
      setLeftPanelContent(tool);
      // Reset background view when opening panel
      if (tool === 'background') {
        setBackgroundView('main');
      }
    } else if (tool === 'ai') {
        setShowLeftPanel(false);
        setLeftPanelContent(null);
        setSelectedElement(null); // Deselect any element to show AI panel clearly
    } else {
      setShowLeftPanel(false);
      setLeftPanelContent(null);
    }
  };

  // Layer Management Functions
  const toggleLayerVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setElements(prev => prev.map(el => {
      if (el.id === id) {
        return { ...el, visible: el.visible === undefined ? false : !el.visible };
      }
      return el;
    }));
  };

  const toggleLayerLock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setElements(prev => prev.map(el => {
      if (el.id === id) {
        return { ...el, locked: !el.locked };
      }
      return el;
    }));
  };

  const deleteLayer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个图层吗？')) {
      setElements(prev => prev.filter(el => el.id !== id));
      if (selectedElement === id) setSelectedElement(null);
      setSelectedElementIds(prev => prev.filter(eid => eid !== id));
    }
  };

  const handleLayerClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Multi-select logic (CMD/CTRL or SHIFT)
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      const newSelectedIds = selectedElementIds.includes(id)
        ? selectedElementIds.filter(eid => eid !== id)
        : [...selectedElementIds, id];
      
      setSelectedElementIds(newSelectedIds);
      // Update primary selected element to the last one clicked if selected, or null if empty
      if (newSelectedIds.includes(id)) {
        setSelectedElement(id);
      } else {
        setSelectedElement(newSelectedIds.length > 0 ? newSelectedIds[newSelectedIds.length - 1] : null);
      }
    } else {
      // Single select
      setSelectedElementIds([id]);
      setSelectedElement(id);
    }
    
    // Sync props for the primary selection
    const el = elements.find(e => e.id === id);
    if (el) {
      setElementProps(el.props);
      setSelectedContent(el.content || '');
    }
  };

  const handleGroupLayers = () => {
    if (selectedElementIds.length < 2) return;
    const groupId = `group-${Date.now()}`;
    setElements(prev => prev.map(el => 
      selectedElementIds.includes(el.id) ? { ...el, groupId } : el
    ));
  };

  const handleUngroupLayers = () => {
    if (selectedElementIds.length === 0) return;
    setElements(prev => prev.map(el => 
      selectedElementIds.includes(el.id) ? { ...el, groupId: undefined } : el
    ));
  };

  // Drawing Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((activeTool as string) === 'ai-box-select') {
       const rect = e.currentTarget.getBoundingClientRect();
       const x = (e.clientX - rect.left) / (zoom / 100);
       const y = (e.clientY - rect.top) / (zoom / 100);
       setAiBoxStart({x, y});
       setAiSelectionBox({x, y, w: 0, h: 0});
       return;
    }

    if (activeTool !== 'draw') return;
    
    setIsDrawing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (zoom / 100);
    const y = (e.clientY - rect.top) / (zoom / 100);
    setCurrentPoints([{x, y}]);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if ((activeTool as string) === 'ai-box-select' && aiBoxStart) {
       const rect = e.currentTarget.getBoundingClientRect();
       const x = (e.clientX - rect.left) / (zoom / 100);
       const y = (e.clientY - rect.top) / (zoom / 100);
       
       const w = x - aiBoxStart.x;
       const h = y - aiBoxStart.y;
       
       setAiSelectionBox({
           x: w > 0 ? aiBoxStart.x : x,
           y: h > 0 ? aiBoxStart.y : y,
           w: Math.abs(w),
           h: Math.abs(h)
       });
       return;
    }

    if (!isDrawing || activeTool !== 'draw') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (zoom / 100);
    const y = (e.clientY - rect.top) / (zoom / 100);
    setCurrentPoints(prev => [...prev, {x, y}]);
  };

  const handleCanvasMouseUp = () => {
    if ((activeTool as string) === 'ai-box-select') {
        setAiBoxStart(null);
        setActiveTool('ai'); 
        return;
    }

    if (!isDrawing || activeTool !== 'draw') return;
    setIsDrawing(false);
    
    if (currentPoints.length < 2) return;

    // Create new element
    const minX = Math.min(...currentPoints.map(p => p.x));
    const minY = Math.min(...currentPoints.map(p => p.y));
    const maxX = Math.max(...currentPoints.map(p => p.x));
    const maxY = Math.max(...currentPoints.map(p => p.y));
    const w = maxX - minX;
    const h = maxY - minY;
    
    // Normalize points to 0-100 range (percentage) for scalable vector
    const safeW = Math.max(w, 1);
    const safeH = Math.max(h, 1);
    const points = currentPoints.map(p => ({
      x: (p.x - minX) / safeW * 100, 
      y: (p.y - minY) / safeH * 100
    }));
    
    const newId = `draw-${Date.now()}`;
    const newEl: CanvasElement = {
      id: newId,
      type: 'draw',
      props: {
        x: minX,
        y: minY,
        w: safeW,
        h: safeH,
        rotation: 0,
        opacity: 100,
        stroke: brushColor,
        strokeWidth: brushWidth,
        brushType: brushType,
        points: points,
        fill: 'transparent',
        flipX: false,
        flipY: false,
        radius: 0
      }
    };
    
    setElements(prev => [...prev, newEl]);
    setCurrentPoints([]);
    
    // Select the new element
    // setTimeout to avoid conflict with click event
    setTimeout(() => {
        setSelectedElement(newId);
        setElementProps(newEl.props);
        // Switch back to select tool after drawing? Or keep drawing?
        // Usually keep drawing. But user wants to see properties after selecting.
        // If I keep drawing tool active, user can draw another one.
        // To select, user needs to switch to 'select' tool.
        // But I can update properties panel context if I want.
        // Let's keep it simple.
    }, 50);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPersonalMaterials(prev => [...prev, url]);
      
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
    <div className="h-screen relative bg-white overflow-hidden flex flex-col">
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

          <Tooltip content={isDirty ? "保存 (Ctrl+S)" : "已保存"} position="bottom">
            <button 
              onClick={handleSaveWrapper}
              disabled={!isDirty}
              className={clsx(
                "py-1.5 px-3 text-sm flex items-center gap-2 rounded-lg transition-colors",
                isDirty 
                  ? "btn-primary" 
                  : "bg-gray-100 text-gray-400 cursor-default"
              )}
            >
              <Save size={16} />
              {isDirty ? 'Save' : 'Saved'}
            </button>
          </Tooltip>
          {/* Hidden button to trigger save from timeout */}
          <button id="hidden-save-trigger" className="hidden" onClick={() => saveProject({ elements })} />
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
             <Tooltip content="素材百宝箱" position="bottom">
               <button 
                 className={clsx("p-1.5 rounded-lg transition-colors", isMaterialsModalOpen ? "bg-black/5" : "hover:bg-black/5")}
                 onClick={() => setIsMaterialsModalOpen(true)}
               >
                 <Package size={18} />
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
        
        {/* Layer Panel */}
        {showLayers && (
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-white border-r border-black/5 flex flex-col animate-in slide-in-from-left duration-200 z-30 shadow-xl">
            <div className="h-12 border-b border-black/5 flex items-center justify-between px-4 bg-gray-50/50">
              <span className="font-semibold text-sm">图层管理</span>
              <div className="flex gap-1">
                 {selectedElementIds.length > 1 && (
                   <Tooltip content="成组" position="bottom">
                     <button onClick={handleGroupLayers} className="p-1 hover:bg-black/5 rounded text-gray-600">
                       <Group size={16} />
                     </button>
                   </Tooltip>
                 )}
                 {selectedElementIds.length > 0 && elements.some(el => selectedElementIds.includes(el.id) && el.groupId) && (
                   <Tooltip content="解组" position="bottom">
                     <button onClick={handleUngroupLayers} className="p-1 hover:bg-black/5 rounded text-gray-600">
                       <Ungroup size={16} />
                     </button>
                   </Tooltip>
                 )}
                 <button onClick={() => setShowLayers(false)} className="p-1 hover:bg-black/5 rounded text-gray-400 hover:text-gray-600">
                   <X size={16} />
                 </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {elements.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-2">
                  <Layers size={24} className="opacity-20" />
                  <span>暂无图层</span>
                </div>
              ) : (
                [...elements].reverse().map((el) => (
                  <div 
                    key={el.id}
                    className={clsx(
                      "group flex items-center gap-2 p-2 rounded-lg text-sm transition-colors cursor-pointer border border-transparent",
                      selectedElementIds.includes(el.id) ? "bg-blue-50 border-blue-100 text-blue-700" : "hover:bg-gray-50 text-gray-600"
                    )}
                    onClick={(e) => handleLayerClick(el.id, e)}
                  >
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => toggleLayerVisibility(el.id, e)}
                        className={clsx("p-1 rounded hover:bg-black/5", el.visible === false && "text-gray-400")}
                      >
                        {el.visible === false ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button 
                        onClick={(e) => toggleLayerLock(el.id, e)}
                        className={clsx("p-1 rounded hover:bg-black/5", el.locked && "text-amber-500")}
                      >
                        {el.locked ? <Lock size={12} /> : <Unlock size={12} />}
                      </button>
                    </div>
                    
                    <div className="flex-1 truncate select-none flex items-center gap-2">
                       {/* Type Icon */}
                       {el.type === 'text' && <Type size={12} className="opacity-50" />}
                       {el.type === 'image' && <ImageIcon size={12} className="opacity-50" />}
                       {el.type === 'shape' && <Square size={12} className="opacity-50" />}
                       
                       <span className="truncate">
                         {el.content || (
                           el.type === 'text' ? '文本' :
                           el.type === 'image' ? '图片' :
                           el.type === 'shape' ? (el.subType || '形状') :
                           '图层'
                         )}
                       </span>
                    </div>

                    <button 
                      onClick={(e) => deleteLayer(el.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 hover:text-red-500 rounded transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Left Sidebar - Tool Details */}
        {showLeftPanel && (
          <div className="absolute top-0 left-0 bottom-0 w-64 bg-white border-r border-black/5 flex flex-col animate-in slide-in-from-left duration-200 z-30 shadow-xl">
            <div className="h-12 border-b border-black/5 flex items-center justify-between px-4">
              <span className="font-semibold text-sm">
                {leftPanelContent === 'text' && '文本工具'}
                {leftPanelContent === 'shape' && '基础形状'}
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
                <div className="space-y-6">
                   <div className="space-y-2">
                     <div className="text-xs font-medium text-gray-500">文字标题</div>
                     <button 
                       onClick={() => handleAddElement('text', undefined, { fontSize: 48, fontWeight: 'bold' }, '主标题')}
                       className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left text-2xl font-bold border border-transparent hover:border-black/5 transition-all"
                     >
                       主标题
                     </button>
                     <button 
                       onClick={() => handleAddElement('text', undefined, { fontSize: 32, fontWeight: 'semibold' }, '副标题')}
                       className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left text-lg font-semibold border border-transparent hover:border-black/5 transition-all"
                     >
                       副标题
                     </button>
                     <button 
                       onClick={() => handleAddElement('text', undefined, { fontSize: 16, fontWeight: 'normal' }, '正文内容')}
                       className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left text-sm text-gray-600 border border-transparent hover:border-black/5 transition-all"
                     >
                       正文内容
                     </button>
                   </div>

                   <div className="space-y-2">
                     <div 
                       className={clsx(
                         "flex items-center justify-between group cursor-pointer"
                       )}
                       onClick={() => setExpandedCategories(prev => ({
                         ...prev,
                         'artistic-text': !prev['artistic-text']
                       }))}
                     >
                       <div className="text-xs font-medium text-gray-500">艺术字体</div>
                       <div className={clsx(
                         "text-gray-400 transition-transform duration-200",
                         expandedCategories['artistic-text'] ? "rotate-90" : ""
                       )}>
                         <ChevronRight size={14} />
                       </div>
                     </div>
                     
                     <div className="transition-all duration-300">
                       <div className="grid grid-cols-1 gap-2">
                         {(expandedCategories['artistic-text'] ? [
                           { label: '霓虹光效', style: { color: '#00ff00', textShadow: '0 0 10px #00ff00', fontWeight: 'bold', fontSize: 32 } },
                           { label: '金属质感', style: { background: 'linear-gradient(to bottom, #eee, #999)', backgroundClip: 'text', color: 'transparent', fontWeight: 'bold', fontSize: 32 } },
                           { label: '复古风格', style: { fontFamily: 'serif', color: '#8B4513', letterSpacing: '2px', fontSize: 32 } },
                           { label: '故障艺术', style: { textShadow: '2px 0 red, -2px 0 blue', fontWeight: 'bold', fontSize: 32 } },
                           { label: '火焰特效', style: { color: '#ff4500', textShadow: '0 -2px 4px #ffd700', fontWeight: 'bold', fontSize: 32 } },
                           { label: '冰霜冻结', style: { color: '#e0ffff', textShadow: '0 0 5px #00bfff', fontWeight: 'bold', fontSize: 32 } },
                         ] : [
                           { label: '霓虹光效', style: { color: '#00ff00', textShadow: '0 0 10px #00ff00', fontWeight: 'bold', fontSize: 32 } },
                           { label: '金属质感', style: { background: 'linear-gradient(to bottom, #eee, #999)', backgroundClip: 'text', color: 'transparent', fontWeight: 'bold', fontSize: 32 } },
                           { label: '复古风格', style: { fontFamily: 'serif', color: '#8B4513', letterSpacing: '2px', fontSize: 32 } },
                         ]).map((item, i) => (
                           <button 
                             key={i} 
                             onClick={() => handleAddElement('text', undefined, { ...item.style }, item.label)}
                             className="w-full p-4 bg-gray-900 rounded-xl border border-transparent hover:border-gray-700 transition-all overflow-hidden"
                           >
                             <span style={item.style as any}>{item.label}</span>
                           </button>
                         ))}
                       </div>
                     </div>
                   </div>
                </div>
              )}

              {leftPanelContent === 'shape' && (
                <div className="space-y-4 h-full flex flex-col">
                  {[
                    {
                      id: 'basic',
                      title: '基础形状',
                      items: [
                        { icon: Square, label: '正方形', type: 'square' },
                        { icon: RectangleHorizontal, label: '矩形', type: 'rect' },
                        { icon: Circle, label: '圆形', type: 'circle' },
                        { icon: Circle, label: '椭圆形', type: 'ellipse' },
                        { icon: Triangle, label: '三角形', type: 'triangle' },
                        { icon: Star, label: '星形', type: 'star' },
                        { icon: Heart, label: '心形', type: 'heart' },
                        { icon: Hexagon, label: '六边形', type: 'hexagon' },
                        { icon: Octagon, label: '八边形', type: 'octagon' },
                      ]
                    },
                    {
                      id: 'arrows',
                      title: '线段与箭头',
                      items: [
                        { icon: Minus, label: '直线段', type: 'line' },
                        { icon: MoveRight, label: '箭头线段', type: 'arrow' },
                        { icon: ArrowUp, label: '上箭头', type: 'arrow-up' },
                        { icon: ArrowDown, label: '下箭头', type: 'arrow-down' },
                        { icon: ArrowLeft, label: '左箭头', type: 'arrow-left' },
                        { icon: ArrowRight, label: '右箭头', type: 'arrow-right' },
                      ]
                    },
                    {
                      id: 'symbols',
                      title: '符号与图标',
                      items: [
                        { icon: Smile, label: '笑脸', type: 'smile' },
                        { icon: MessageCircle, label: '气泡', type: 'bubble' },
                        { icon: Zap, label: '闪电', type: 'zap' },
                        { icon: Cloud, label: '云朵', type: 'cloud' },
                        { icon: Check, label: '对勾', type: 'check' },
                        { icon: X, label: '关闭', type: 'x' },
                        { icon: Sun, label: '太阳', type: 'sun' },
                        { icon: Moon, label: '月亮', type: 'moon' },
                        { icon: Umbrella, label: '雨伞', type: 'umbrella' },
                        { icon: Music, label: '音乐', type: 'music' },
                        { icon: Headphones, label: '耳机', type: 'headphones' },
                        { icon: Camera, label: '相机', type: 'camera' },
                        { icon: Video, label: '视频', type: 'video' },
                        { icon: Mic, label: '麦克风', type: 'mic' },
                        { icon: Bell, label: '铃声', type: 'bell' },
                        { icon: Calendar, label: '日历', type: 'calendar' },
                        { icon: Clock, label: '时钟', type: 'clock' },
                        { icon: MapPin, label: '定位', type: 'map-pin' },
                        { icon: Tag, label: '标签', type: 'tag' },
                        { icon: Flag, label: '旗帜', type: 'flag' },
                        { icon: Bookmark, label: '书签', type: 'bookmark' },
                        { icon: ThumbsUp, label: '点赞', type: 'thumbs-up' },
                        { icon: ThumbsDown, label: '踩', type: 'thumbs-down' },
                        { icon: User, label: '用户', type: 'user' },
                        { icon: Users, label: '用户组', type: 'users' },
                        { icon: Settings, label: '设置', type: 'settings' },
                        { icon: Search, label: '搜索', type: 'search' },
                        { icon: Home, label: '主页', type: 'home' },
                        { icon: Menu, label: '菜单', type: 'menu' },
                      ]
                    }
                  ].map((category) => (
                    <div key={category.id} className="space-y-2">
                      <div 
                        className={clsx(
                          "flex items-center justify-between group",
                          category.items.length > 10 ? "cursor-pointer" : "cursor-default"
                        )}
                        onClick={() => {
                          if (category.items.length > 10) {
                            setExpandedCategories(prev => ({
                              ...prev,
                              [category.id]: !prev[category.id]
                            }));
                          }
                        }}
                      >
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{category.title}</h3>
                        {category.items.length > 10 && (
                          <div className={clsx(
                            "text-gray-400 transition-transform duration-200",
                            expandedCategories[category.id] ? "rotate-90" : ""
                          )}>
                            <ChevronRight size={14} />
                          </div>
                        )}
                      </div>
                      
                      <div className="transition-all duration-300">
                        <div className="flex flex-wrap gap-2 pb-2">
                          {(expandedCategories[category.id] ? category.items : category.items.slice(0, 10)).map((item, i) => (
                            <button 
                              key={i} 
                              onClick={() => {
                                let w = 100;
                                let h = 100;
                                let radius = 0;
                                
                                // Set dimensions based on type
                                if (item.type === 'line' || item.type === 'arrow') {
                                  w = 200;
                                  h = 2;
                                } else if (item.type === 'rect' || item.type === 'ellipse') {
                                  w = 160;
                                  h = 100;
                                } else if (item.type === 'circle') {
                                  radius = 50;
                                }

                                handleAddElement('shape', item.type, {
                                  w,
                                  h,
                                  radius
                                });
                              }}
                              className="w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg border border-transparent hover:border-black/5 transition-all group/btn relative"
                              title={item.label}
                            >
                              <item.icon size={16} className="text-gray-600" />
                              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                {item.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Material Panel moved to Modal */}

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
                <div className="h-full flex flex-col">
                  {backgroundView === 'main' ? (
                    <div className="space-y-6">
                       {/* Background Library */}
                       <div className="space-y-2">
                         <div className="flex items-center justify-between group cursor-pointer">
                           <div className="text-xs font-medium text-gray-500">背景库</div>
                         </div>
                         
                         <div className="space-y-2">
                           {backgroundLibraryItems.map(item => (
                             <button 
                               key={item.id} 
                               onClick={() => setBackgroundView(item.id as 'public' | 'traffic')}
                               className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left border border-transparent hover:border-black/5 transition-all group"
                             >
                               <div className="flex items-center gap-2">
                                 <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center", item.bgClass, item.textClass)}>
                                   <item.icon size={16} />
                                 </div>
                                 <span className="text-sm font-medium text-gray-700">{item.label}</span>
                               </div>
                               <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600" />
                             </button>
                           ))}
                         </div>
                       </div>
    
                       <div className="space-y-2">
                          <div className="text-xs font-medium text-gray-500">纯色背景</div>
                          <div className="grid grid-cols-5 gap-2">
                            {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#000000', '#ffffff', '#808080', '#c0c0c0'].map(c => (
                              <button key={c} onClick={() => setCanvasBackground(c)} className="w-8 h-8 rounded-full border border-black/5 hover:scale-110 transition-transform" style={{backgroundColor: c}} />
                            ))}
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <div className="relative w-8 h-8 rounded-full border border-black/10 overflow-hidden shrink-0 group">
                                <div className="absolute inset-0 bg-white flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                                    <Palette size={14} className="text-gray-500" />
                                </div>
                                <input 
                                    type="color" 
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                    value={customColor}
                                    onChange={(e) => {
                                        setCustomColor(e.target.value);
                                        setCanvasBackground(e.target.value);
                                    }}
                                />
                            </div>
                            <input 
                                type="text" 
                                value={customColor}
                                placeholder="#000000"
                                className="flex-1 min-w-0 h-8 px-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-black/20 transition-colors font-mono uppercase"
                                onChange={(e) => {
                                    setCustomColor(e.target.value);
                                    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                                        setCanvasBackground(e.target.value);
                                    }
                                }}
                            />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <div className="text-xs font-medium text-gray-500">渐变背景</div>
                          <div className="grid grid-cols-5 gap-2">
                             {[
                               'linear-gradient(to right, #3b82f6, #06b6d4)',
                               'linear-gradient(to right, #a855f7, #ec4899)',
                               'linear-gradient(to right, #f59e0b, #f97316)',
                               'linear-gradient(to right, #10b981, #14b8a6)',
                               'linear-gradient(to right, #ef4444, #f43f5e)',
                               'linear-gradient(to right, #8b5cf6, #d946ef)',
                               'linear-gradient(to right, #0ea5e9, #6366f1)',
                               'linear-gradient(to right, #f43f5e, #fb7185)',
                             ].map((gradient, i) => (
                               <div 
                                 key={i}
                                 onClick={() => setCanvasBackground(gradient)} 
                                 className="w-8 h-8 rounded-full border border-black/5 hover:scale-110 transition-transform cursor-pointer"
                                 style={{ background: gradient }}
                               />
                             ))}
                          </div>
                          
                          <div className="pt-2 space-y-3 border-t border-gray-100 mt-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500">自定渐变</span>
                                <button 
                                    onClick={applyGradient}
                                    className="text-[10px] bg-black text-white px-2 py-1 rounded hover:opacity-90 transition-opacity"
                                >
                                    应用
                                </button>
                            </div>
                            
                            {/* Gradient Preview */}
                            <div 
                              className="w-full h-12 rounded-lg border border-black/5"
                              style={{ 
                                background: `linear-gradient(${gradientAngle}deg, ${gradientStops.sort((a, b) => a.position - b.position).map(s => `${s.color} ${s.position}%`).join(', ')})` 
                              }}
                            />
    
                            <div className="flex items-center gap-2">
                                <RotateCw size={12} className="text-gray-400" />
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="360" 
                                    value={gradientAngle} 
                                    onChange={(e) => setGradientAngle(Number(e.target.value))}
                                    className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-[10px] w-6 text-right font-mono text-gray-500">{gradientAngle}°</span>
                            </div>
    
                            <div className="space-y-2">
                                {gradientStops.map((stop, index) => (
                                    <div key={stop.id} className="flex items-center gap-2">
                                        <div className="relative w-6 h-6 rounded-full border border-black/10 overflow-hidden shrink-0">
                                            <input 
                                                type="color" 
                                                value={stop.color}
                                                onChange={(e) => {
                                                    const newStops = [...gradientStops];
                                                    newStops[index].color = e.target.value;
                                                    setGradientStops(newStops);
                                                }}
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                            />
                                            <div className="w-full h-full" style={{backgroundColor: stop.color}} />
                                        </div>
                                        <input 
                                            type="text"
                                            value={stop.color}
                                            onChange={(e) => {
                                                const newStops = [...gradientStops];
                                                newStops[index].color = e.target.value;
                                                setGradientStops(newStops);
                                            }}
                                            className="w-16 h-6 text-[10px] border border-gray-200 rounded px-1 font-mono uppercase outline-none focus:border-black/20"
                                        />
                                        <input 
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={stop.position}
                                            onChange={(e) => {
                                                const newStops = [...gradientStops];
                                                newStops[index].position = Number(e.target.value);
                                                setGradientStops(newStops);
                                            }}
                                            className="w-10 h-6 text-[10px] border border-gray-200 rounded px-1 font-mono outline-none focus:border-black/20 text-center"
                                        />
                                        <span className="text-[10px] text-gray-400">%</span>
                                        {gradientStops.length > 2 && (
                                            <button 
                                                onClick={() => setGradientStops(gradientStops.filter(s => s.id !== stop.id))}
                                                className="text-gray-400 hover:text-red-500 transition-colors ml-auto"
                                            >
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            <button 
                                onClick={() => setGradientStops([...gradientStops, { id: Date.now(), color: '#ffffff', position: 100 }])}
                                className="w-full py-1.5 flex items-center justify-center gap-1 text-[10px] font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                            >
                                <Plus size={12} />
                                添加颜色节点
                            </button>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col h-full -mx-4 px-4">
                      {/* Sub-view Header */}
                      <div className="flex items-center gap-2 pb-4 mb-4 border-b border-gray-100">
                        <button 
                          onClick={() => setBackgroundView('main')}
                          className="p-1.5 -ml-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-medium text-gray-800">
                          {backgroundView === 'public' ? '公共背景库' : '流量投放素材'}
                        </span>
                      </div>
                      
                      {/* Grid Content with Scroll */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                        <div className="grid grid-cols-2 gap-3 pb-4">
                          {(backgroundView === 'public' ? publicBackgrounds : trafficBackgrounds).map((url, i) => (
                            <div 
                              key={i}
                              className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-black/5 cursor-pointer hover:shadow-md transition-all"
                              onClick={() => setCanvasBackground(`url(${url}) center/cover no-repeat`)}
                            >
                              <img src={url} alt="background" className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {leftPanelContent === 'draw' && (
                <div className="space-y-4">
                   <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-500">笔刷类型</div>
                      <div className="grid grid-cols-2 gap-2">
                         {[
                           { id: 'solid', name: '实线', icon: PenTool },
                           { id: 'dashed', name: '虚线', icon: Minus },
                           { id: 'dotted', name: '点状线', icon: Circle },
                           { id: 'marker', name: '马克笔', icon: Highlighter },
                           { id: 'watercolor', name: '水彩笔', icon: Brush },
                           { id: 'highlighter', name: '荧光笔', icon: Highlighter },
                         ].map(brush => (
                           <button 
                             key={brush.id} 
                             onClick={() => setBrushType(brush.id)}
                             className={clsx(
                               "flex flex-col items-center justify-center gap-2 p-3 rounded-lg border transition-all",
                               brushType === brush.id 
                                 ? "bg-black text-white border-black shadow-md" 
                                 : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-transparent hover:border-black/5"
                             )}
                           >
                             <brush.icon size={20} />
                             <span className="text-xs">{brush.name}</span>
                           </button>
                         ))}
                      </div>
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
                  borderRadius: `${borderRadius}px`,
                  cursor: activeTool === 'draw' ? 'crosshair' : 'default'
                }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              >
                 {/* Drawing Overlay */}
                 {isDrawing && currentPoints.length > 0 && (
                   <svg className="absolute inset-0 w-full h-full pointer-events-none z-50" style={{overflow: 'visible'}}>
                     <path
                       d={`M ${currentPoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
                       stroke={brushColor}
                       strokeWidth={brushWidth}
                       fill="none"
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       style={{
                         strokeDasharray: brushType === 'dashed' ? '10,10' : brushType === 'dotted' ? '2,2' : 'none'
                       }}
                     />
                   </svg>
                 )}

                 {/* AI Selection Box Overlay */}
                 {aiSelectionBox && (
                    <div 
                      className="absolute z-50 pointer-events-none border-2 border-dashed bg-black/5"
                      style={{
                        left: aiSelectionBox.x,
                        top: aiSelectionBox.y,
                        width: aiSelectionBox.w,
                        height: aiSelectionBox.h,
                        borderColor: aiSelectionColor
                      }}
                    >
                      <div className="absolute -top-6 left-0 bg-black text-white text-[10px] px-2 py-0.5 rounded shadow-sm whitespace-nowrap">
                        AI 修改区域
                      </div>
                    </div>
                 )}

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
                        backgroundColor: (currentShapeType === 'line' || currentShapeType === 'arrow' || el.type === 'text' || el.type === 'draw') ? 'transparent' : props.fill,
                        borderColor: props.stroke,
                        borderWidth: (currentShapeType === 'line' || currentShapeType === 'arrow' || el.type === 'draw') ? 0 : `${props.strokeWidth}px`,
                        borderRadius: currentShapeType === 'circle' ? '50%' : `${props.radius}px`,
                        boxShadow: isSelected ? [
                           effects.shadow ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '',
                           effects.glow ? `0 0 20px ${props.fill}` : ''
                        ].filter(Boolean).join(', ') || 'none' : 'none',
                        WebkitBoxReflect: isSelected && effects.reflection ? 'below 0px linear-gradient(to bottom, rgba(0,0,0,0.0), rgba(0,0,0,0.4))' : undefined,
                        pointerEvents: activeTool === 'draw' ? 'none' : 'auto'
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

                      {el.type === 'draw' && (
                         <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{overflow: 'visible'}}>
                           <path
                             d={`M ${props.points?.map((p: any) => `${p.x},${p.y}`).join(' L ')}`}
                             stroke={props.stroke}
                             strokeWidth={props.strokeWidth} // This might need scaling if container is small?
                             fill="none"
                             strokeLinecap="round"
                             strokeLinejoin="round"
                             vectorEffect="non-scaling-stroke" // Keep stroke width constant even if SVG is scaled!
                             style={{
                               strokeDasharray: props.brushType === 'dashed' ? '10,10' : props.brushType === 'dotted' ? '2,2' : 'none'
                             }}
                           />
                         </svg>
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
              icon={ShapesIcon} 
              label="形状" 
              isActive={activeTool === 'shape'} 
              onClick={() => handleToolClick('shape')} 
            />
            <ToolButton 
              icon={Type} 
              label="文本 (T)" 
              isActive={activeTool === 'text'} 
              onClick={() => handleToolClick('text')} 
            />
            <ToolButton 
              icon={Wallpaper} 
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
          </div>
        </div>

        {/* Right Sidebar - Element Properties or AI Assistant */}
        {(selectedElement || activeTool === 'ai') && (
            <div className={clsx(
                "absolute top-0 right-0 bottom-0 bg-white border-l border-black/5 flex flex-col animate-in slide-in-from-right duration-200 z-30 shadow-xl",
                activeTool === 'ai' ? "w-80" : "w-64"
            )}>
              <div className="h-12 border-b border-black/5 flex items-center justify-between px-4 bg-gray-50/50">
                <span className="font-semibold text-sm flex items-center gap-2">
                  {activeTool === 'ai' && <Sparkles size={16} className="text-purple-600" />}
                  {activeTool === 'ai' ? 'AI 设计助手' : (
                    <>
                      {selectedElement?.startsWith('text') && '文本属性'}
                      {(selectedElement?.startsWith('shape') || selectedElement?.startsWith('bocom') || selectedElement?.startsWith('personal')) && '素材属性'}
                      {selectedElement?.startsWith('image') && '图片属性'}
                      {selectedElement?.startsWith('bg') && '背景属性'}
                      {selectedElement?.startsWith('draw') && '路径属性'}
                      {selectedElement?.startsWith('table') && '表格属性'}
                      {selectedElement?.startsWith('ai') && 'AI 生成属性'}
                    </>
                  )}
                </span>
                <button onClick={() => { setSelectedElement(null); if (activeTool === 'ai') handleToolClick('select'); }} className="p-1 hover:bg-black/5 rounded text-gray-500">
                  <X size={16} />
                </button>
              </div>
              
              {activeTool === 'ai' ? (
                 <div className="flex-1 flex flex-col h-full overflow-hidden">
                    {/* AI Mode Selector */}
                    <div className="p-3 border-b border-gray-100 flex gap-2">
                       <button 
                         onClick={() => setAiMode('blend')}
                         className={clsx(
                           "flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                           aiMode === 'blend' ? "bg-purple-100 text-purple-700 shadow-sm ring-1 ring-purple-200" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                         )}
                       >
                         <ImagePlus size={14} />
                         AI 溶图
                       </button>
                       <button 
                         onClick={() => setAiMode('edit')}
                         className={clsx(
                           "flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                           aiMode === 'edit' ? "bg-blue-100 text-blue-700 shadow-sm ring-1 ring-blue-200" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                         )}
                       >
                         <Crop size={14} />
                         AI 改图
                       </button>
                       <button 
                         onClick={() => setAiMode('erase')}
                         className={clsx(
                           "flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                           aiMode === 'erase' ? "bg-red-100 text-red-700 shadow-sm ring-1 ring-red-200" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                         )}
                       >
                         <Eraser size={14} />
                         AI 擦除
                       </button>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                       {aiChatHistory.map((msg, idx) => (
                          <div key={idx} className={clsx("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "")}>
                             <div className={clsx(
                               "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border",
                               msg.role === 'ai' ? "bg-white border-purple-100 text-purple-600" : "bg-black text-white border-black"
                             )}>
                               {msg.role === 'ai' ? <Sparkles size={16} /> : <div className="text-xs font-bold">U</div>}
                             </div>
                             <div className={clsx(
                               "max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed shadow-sm",
                               msg.role === 'ai' ? "bg-white border border-gray-100 text-gray-700 rounded-tl-none" : "bg-black text-white rounded-tr-none"
                             )}>
                                {msg.type === 'text' ? (
                                  <p className="whitespace-pre-wrap">{msg.content}</p>
                                ) : (
                                  <div className="space-y-2">
                                     <div 
                                       className="relative group cursor-zoom-in rounded-lg overflow-hidden border border-black/5 bg-gray-100 z-10"
                                       onClick={() => setPreviewImage(msg.content)}
                                     >
                                       <img src={msg.content} alt="AI Result" className="w-full h-auto relative z-0" />
                                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-20 pointer-events-none" />
                                     </div>
                                     <div className="flex gap-2 relative z-30">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if(confirm('确定要应用到画布吗？这将覆盖当前背景且无法撤销。')) {
                                                    setCanvasBackground(`url(${msg.content}) center/cover no-repeat`);
                                                }
                                            }}
                                            className="flex-1 bg-black text-white py-1.5 rounded-lg text-[10px] font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                                        >
                                          <CheckCircle2 size={12} />
                                          应用到画布
                                        </button>
                                     </div>
                                  </div>
                                )}
                             </div>
                          </div>
                       ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-gray-100 bg-white">
                       {/* Contextual Tools */}
                       <div className="flex gap-2 mb-2">
                          {aiMode === 'blend' && (
                             <>
                               <input 
                                 type="file" 
                                 ref={aiFileInputRef}
                                 className="hidden" 
                                 accept="image/*"
                                 multiple
                                 onChange={(e) => {
                                   if (e.target.files) {
                                     const newFiles = Array.from(e.target.files).slice(0, 2 - aiUploadedFiles.length);
                                     setAiUploadedFiles(prev => [...prev, ...newFiles]);
                                   }
                                 }}
                               />
                               <button 
                                 onClick={() => aiFileInputRef.current?.click()}
                                 disabled={aiUploadedFiles.length >= 2}
                                 className="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                               >
                                 <ImagePlus size={14} />
                                 上传图片 ({aiUploadedFiles.length}/2)
                               </button>
                               {aiUploadedFiles.map((file, i) => (
                                 <div key={i} className="relative group w-8 h-8 rounded-lg overflow-hidden border border-gray-200">
                                   <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                   <button 
                                     onClick={() => setAiUploadedFiles(files => files.filter((_, idx) => idx !== i))}
                                     className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white"
                                   >
                                     <XCircle size={14} />
                                   </button>
                                 </div>
                               ))}
                             </>
                          )}

                          {aiMode === 'edit' && (
                             <>
                               <button 
                                 onClick={() => {
                                    setActiveTool('ai-box-select');
                                    setAiBoxStart(null);
                                    setAiSelectionBox(null);
                                 }}
                                 className={clsx(
                                   "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] transition-colors",
                                   (activeTool as string) === 'ai-box-select' ? "bg-blue-600 text-white shadow-sm" : "bg-gray-50 hover:bg-gray-100 text-gray-600"
                                 )}
                               >
                                 <Crop size={14} />
                                 {(activeTool as string) === 'ai-box-select' ? '正在框选...' : (aiSelectionBox ? '重新框选' : '开始框选')}
                               </button>
                               
                               <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 rounded-lg">
                                  <div className="w-3 h-3 rounded-full border border-black/10" style={{backgroundColor: aiSelectionColor}} />
                                  <input 
                                    type="color" 
                                    value={aiSelectionColor}
                                    onChange={(e) => setAiSelectionColor(e.target.value)}
                                    className="w-4 h-4 opacity-0 absolute cursor-pointer"
                                  />
                               </div>
                             </>
                          )}

                          {aiMode === 'erase' && (
                             <>
                               <button 
                                 onClick={() => {
                                    setActiveTool('ai-box-select');
                                    setAiBoxStart(null);
                                    setAiSelectionBox(null);
                                 }}
                                 className={clsx(
                                   "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] transition-colors",
                                   (activeTool as string) === 'ai-box-select' ? "bg-red-600 text-white shadow-sm" : "bg-gray-50 hover:bg-gray-100 text-gray-600"
                                 )}
                               >
                                 <Eraser size={14} />
                                 {(activeTool as string) === 'ai-box-select' ? '正在框选...' : (aiSelectionBox ? '重新框选' : '开始擦除')}
                               </button>
                               
                               <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 rounded-lg">
                                  <div className="w-3 h-3 rounded-full border border-black/10" style={{backgroundColor: aiSelectionColor}} />
                                  <input 
                                    type="color" 
                                    value={aiSelectionColor}
                                    onChange={(e) => setAiSelectionColor(e.target.value)}
                                    className="w-4 h-4 opacity-0 absolute cursor-pointer"
                                  />
                               </div>
                             </>
                          )}
                       </div>

                       <div className="relative">
                          <textarea 
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            placeholder={aiMode === 'blend' ? "描述你想如何融合这些图片..." : aiMode === 'edit' ? (aiSelectionBox ? "描述你想如何修改框选区域..." : "描述你想如何修改画面（可框选局部）...") : "描述你想擦除的内容..."}
                            className="w-full bg-gray-50 border border-transparent hover:border-black/10 focus:border-purple-500 rounded-xl px-3 py-2.5 text-xs outline-none resize-none pr-10 min-h-[80px] transition-all"
                          />
                          <button 
                              className="absolute bottom-2 right-2 p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                              disabled={!aiInput.trim() || (aiMode === 'blend' && aiUploadedFiles.length === 0) || (aiMode === 'erase' && !aiSelectionBox)}
                              onClick={() => {
                               // Handle Send
                               const newMsg = { id: Date.now().toString(), role: 'user' as const, type: 'text' as const, content: aiInput };
                               setAiChatHistory(prev => [...prev, newMsg]);
                               setAiInput('');
                               
                               // Simulate AI Response
                               setTimeout(() => {
                                  const responseMsg = { 
                                      id: (Date.now() + 1).toString(), 
                                      role: 'ai' as const, 
                                      type: 'image' as const, 
                                      content: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXJ0fGVufDB8fDB8fHww' // Placeholder
                                  };
                                  setAiChatHistory(prev => [...prev, responseMsg]);
                               }, 1500);
                            }}
                          >
                            <Send size={16} />
                          </button>
                       </div>
                    </div>
                 </div>
              ) : (
              <div className="flex-1 p-4 overflow-y-auto space-y-6">
                
                {/* Text Specific Properties */}
                {selectedElement?.startsWith('text') && (
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
                {selectedElement?.startsWith('image') && (
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
                {(selectedElement?.startsWith('shape') || selectedElement?.startsWith('bocom') || selectedElement?.startsWith('personal')) && (
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
                {selectedElement?.startsWith('draw') && (
                   <div className="space-y-4">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">笔触设置</div>
                      
                      {/* Color */}
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

                     {/* Width */}
                     <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-gray-400">粗细</span>
                          <span className="text-xs font-mono text-gray-400">{elementProps.strokeWidth}px</span>
                        </div>
                        <input type="range" min="1" max="50" className="w-full accent-black h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" value={elementProps.strokeWidth} onChange={(e) => setElementProps(p => ({...p, strokeWidth: Number(e.target.value)}))} />
                      </div>
                     {/* Properties handled by common section below */}
                   </div>
                )}

                {/* Table Specific Properties */}
                 {selectedElement?.startsWith('table') && (
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
                 {selectedElement?.startsWith('ai') && (
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
              )}
            </div>
        )}

        {/* Image Preview Overlay */}
        {previewImage && (
           <div 
             className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center animate-in fade-in duration-200"
             onClick={() => setPreviewImage(null)}
           >
             {/* Toolbar */}
             <div 
                className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent"
                onClick={(e) => e.stopPropagation()}
             >
                <div className="text-white/80 text-sm font-medium px-4">
                  预览模式
                </div>
                <div className="flex items-center gap-3">
                   <button 
                     onClick={() => {
                       const link = document.createElement('a');
                       link.href = previewImage;
                       link.download = `ai-generated-${Date.now()}.jpg`;
                       document.body.appendChild(link);
                       link.click();
                       document.body.removeChild(link);
                     }}
                     className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2 px-4"
                   >
                     <Download size={18} />
                     <span className="text-sm">导出</span>
                   </button>
                   <button 
                     onClick={() => setPreviewImage(null)}
                     className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                   >
                     <X size={24} />
                   </button>
                </div>
             </div>

             <img 
               src={previewImage} 
               alt="Preview" 
               className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl" 
               onClick={(e) => e.stopPropagation()}
             />
           </div>
        )}
        
        {/* Materials Modal */}
        <MaterialsModal
          isOpen={isMaterialsModalOpen}
          onClose={() => setIsMaterialsModalOpen(false)}
          onAddElement={handleAddElement}
          onUpload={handleFileUpload}
          personalMaterials={personalMaterials}
        />

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

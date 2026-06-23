import { useMemo, useRef, useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowUp, 
  Home,
  Layers, 
  MousePointer2, 
  Type, 
  Image as ImageIcon, 
  Square, 
  MapPin, 
  ChevronRight, 
  X,
  Bot,
  SplitSquareVertical,
  ImagePlus,
  Crop,
  Eraser,
  Wand2
} from 'lucide-react';
import clsx from 'clsx';
import { useToast } from '../components/ToastProvider';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  type: 'text' | 'image';
  content: string;
  timestamp: number;
}

type AiMode = 'generate' | 'edit' | 'blend' | 'erase';

type AiImageAttachment = {
  id: string;
  name: string;
  src: string;
  source: 'upload' | 'canvas';
};

type CanvasElementType = 'image' | 'text';

type CanvasElementBase = {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
};

type CanvasImageElement = CanvasElementBase & {
  type: 'image';
  src: string;
};

type CanvasTextElement = CanvasElementBase & {
  type: 'text';
  text: string;
  originImageId?: string;
  kind?: 'title' | 'subtitle' | 'cta';
};

type CanvasElement = CanvasImageElement | CanvasTextElement;

const isImageElement = (el: CanvasElement): el is CanvasImageElement => el.type === 'image';
const isTextElement = (el: CanvasElement): el is CanvasTextElement => el.type === 'text';

const makeId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`);
const DEFAULT_AI_WELCOME =
  '你好！我是你的 AI 设计助手。\n\n1. AI修改只针对背景图。\n2. AI溶图：最多融合2张图片。\n3. AI改图：不框选是改整张图，框选则是修改选定区域。\n4. AI擦除：请注意框选颜色与背景色不要高度重合。使用框选后，提示词请说明框的颜色（如：请帮我擦除红色框中的内容）。\n\n提示：目前版本只支持单轮对话，多轮对话功能敬请期待。';

const DEFAULT_PREVIEW_BOUNDS = { width: 520, height: 390 };

function resolveInitialImageSize(width: number, height: number) {
  const safeWidth = width > 0 ? width : 1080;
  const safeHeight = height > 0 ? height : 1920;
  const ratio = Math.min(DEFAULT_PREVIEW_BOUNDS.width / safeWidth, DEFAULT_PREVIEW_BOUNDS.height / safeHeight);
  return {
    width: Math.max(160, Math.round(safeWidth * ratio)),
    height: Math.max(160, Math.round(safeHeight * ratio)),
  };
}

const mockTextImageLayering = (
  material: { id: string; name: string; src: string },
  imageRect: { x: number; y: number; width: number; height: number },
  originImageId: string
) => {
  const title = material.name || '主标题';
  const subtitle = material.id || '副标题';
  const cta = '立即领取';

  const baseX = imageRect.x + 28;
  const baseY = imageRect.y + 28;

  const titleNode: CanvasTextElement = {
    id: makeId(),
    type: 'text',
    x: baseX,
    y: baseY,
    width: Math.min(520, imageRect.width - 56),
    height: 44,
    text: title,
    originImageId,
    kind: 'title',
  };

  const subtitleNode: CanvasTextElement = {
    id: makeId(),
    type: 'text',
    x: baseX,
    y: baseY + 52,
    width: Math.min(420, imageRect.width - 56),
    height: 26,
    text: subtitle,
    originImageId,
    kind: 'subtitle',
  };

  const ctaNode: CanvasTextElement = {
    id: makeId(),
    type: 'text',
    x: imageRect.x + Math.max(28, imageRect.width - 180),
    y: imageRect.y + Math.max(28, imageRect.height - 64),
    width: 152,
    height: 40,
    text: cta,
    originImageId,
    kind: 'cta',
  };

  return [titleNode, subtitleNode, ctaNode];
};

export default function PublicCanvas() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const initialQuery = searchParams.get('q') || '';
  const materialSrc = searchParams.get('src') || '';
  const materialName = searchParams.get('name') || '';
  const materialId = searchParams.get('id') || '';
  const materialWidth = Number(searchParams.get('width') || '1080');
  const materialHeight = Number(searchParams.get('height') || '1920');
  const initialImageSize = useMemo(
    () => resolveInitialImageSize(materialWidth, materialHeight),
    [materialHeight, materialWidth]
  );

  const [isAppMenuOpen, setIsAppMenuOpen] = useState(false);
  const appMenuRef = useRef<HTMLDivElement | null>(null);
  const openInNewTab = (path: string) => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const url = `${window.location.origin}${import.meta.env.BASE_URL}#${normalized}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    if (!isAppMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (appMenuRef.current && appMenuRef.current.contains(target)) return;
      setIsAppMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAppMenuOpen]);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: makeId(), role: 'ai', type: 'text', content: DEFAULT_AI_WELCOME, timestamp: Date.now() },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [aiMode, setAiMode] = useState<AiMode>('generate');
  const [uploadedAttachments, setUploadedAttachments] = useState<AiImageAttachment[]>([]);
  const [isAgentPanelOpen, setIsAgentPanelOpen] = useState(true);
  const [isLayersDrawerOpen, setIsLayersDrawerOpen] = useState(false);

  // Active tool state for bottom toolbar
  const [activeTool, setActiveTool] = useState<'select' | 'frame' | 'figure' | 'text' | 'mark'>('select');
  const [elements, setElements] = useState<CanvasElement[]>(() => {
    const initialImage: CanvasImageElement = {
      id: 'material-image',
      type: 'image',
      x: 24,
      y: 24,
      width: initialImageSize.width,
      height: initialImageSize.height,
      src: materialSrc || 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=900&auto=format&fit=crop',
    };
    return [initialImage];
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [layeredImageIds, setLayeredImageIds] = useState<Set<string>>(() => new Set());
  const [pan, setPan] = useState(() => ({ x: 0, y: 0 }));
  const [isPanning, setIsPanning] = useState(false);
  const [layerActionAnchor, setLayerActionAnchor] = useState<{ left: number; top: number } | null>(null);
  const panStateRef = useRef<{ isDragging: boolean; startX: number; startY: number; originX: number; originY: number }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  useEffect(() => {
    if (initialQuery && messages.length === 1) {
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: 'user', type: 'text', content: initialQuery, timestamp: Date.now() },
        { id: makeId(), role: 'ai', type: 'text', content: '收到！我正在为您准备相关的设计资产和建议，请稍候...', timestamp: Date.now() + 1 },
      ]);
    }
  }, [initialQuery, messages.length]);

  useEffect(() => {
    setElements(() => {
      const initialImage: CanvasImageElement = {
        id: 'material-image',
        type: 'image',
        x: 24,
        y: 24,
        width: initialImageSize.width,
        height: initialImageSize.height,
        src: materialSrc || 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=900&auto=format&fit=crop',
      };
      return [initialImage];
    });
    setSelectedId(null);
    setLayeredImageIds(new Set());
    setPan({ x: 0, y: 0 });
  }, [initialImageSize.height, initialImageSize.width, materialSrc]);

  const selectedElement = useMemo(() => elements.find((el) => el.id === selectedId) || null, [elements, selectedId]);
  const selectedCanvasAttachment = useMemo<AiImageAttachment | null>(() => {
    if (!selectedElement || selectedElement.type !== 'image') return null;
    if (aiMode !== 'edit' && aiMode !== 'blend') return null;
    return {
      id: selectedElement.id,
      name: materialName || '当前画布图片',
      src: selectedElement.src,
      source: 'canvas',
    };
  }, [aiMode, materialName, selectedElement]);
  const selectedImageLayeredTexts = useMemo(() => {
    if (!selectedElement || selectedElement.type !== 'image') return [];
    return elements.filter(isTextElement).filter((el) => el.originImageId === selectedElement.id);
  }, [elements, selectedElement]);
  const maxUploadCount = useMemo(() => {
    if (aiMode === 'edit') return 1;
    if (aiMode === 'blend') return selectedCanvasAttachment ? 1 : 2;
    return 0;
  }, [aiMode, selectedCanvasAttachment]);
  const activeAttachments = useMemo(() => {
    const list = [...uploadedAttachments];
    if (selectedCanvasAttachment) list.unshift(selectedCanvasAttachment);
    return list;
  }, [selectedCanvasAttachment, uploadedAttachments]);

  useEffect(() => {
    if (maxUploadCount === 0 && uploadedAttachments.length > 0) {
      setUploadedAttachments([]);
      return;
    }
    if (uploadedAttachments.length > maxUploadCount) {
      setUploadedAttachments((prev) => prev.slice(0, maxUploadCount));
    }
  }, [maxUploadCount, uploadedAttachments.length]);

  const handleUploadImages = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || maxUploadCount === 0) {
      event.target.value = '';
      return;
    }
    const restCount = Math.max(0, maxUploadCount - uploadedAttachments.length);
    const filesToUse = files.slice(0, restCount);
    const nextItems = await Promise.all(
      filesToUse.map(
        (file) =>
          new Promise<AiImageAttachment>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                id: makeId(),
                name: file.name || '上传图片',
                src: String(reader.result || ''),
                source: 'upload',
              });
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          })
      )
    ).catch(() => {
      toast.show('图片读取失败');
      return [] as AiImageAttachment[];
    });
    if (nextItems.length > 0) {
      setUploadedAttachments((prev) => [...prev, ...nextItems].slice(0, maxUploadCount));
    }
    event.target.value = '';
  };

  const handleSendMessage = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (aiMode === 'blend' && activeAttachments.length < 2) return;
    if (aiMode === 'edit' && activeAttachments.length < 1) return;

    const newUserMsg: ChatMessage = {
      id: makeId(),
      role: 'user',
      type: 'text',
      content: trimmed,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');

    setTimeout(() => {
      const replyByMode: Record<AiMode, string> = {
        generate: '收到，我会按你的提示生成新的视觉方案。',
        edit: '收到，我会基于当前选中的图片或上传图片执行改图。',
        blend: '收到，我会按你的描述融合当前图片素材。',
        erase: '收到，我会根据你的描述执行擦除处理。',
      };
      const newAgentMsg: ChatMessage = {
        id: makeId(),
        role: 'ai',
        type: 'text',
        content: replyByMode[aiMode],
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, newAgentMsg]);
    }, 700);
  };

  const runLayeringForSelectedImage = () => {
    if (!selectedElement || selectedElement.type !== 'image') return;
    if (layeredImageIds.has(selectedElement.id)) return;

    const textNodes = mockTextImageLayering(
      { id: materialId, name: materialName, src: selectedElement.src },
      { x: selectedElement.x, y: selectedElement.y, width: selectedElement.width, height: selectedElement.height },
      selectedElement.id
    );

    setElements((prev) => [...prev, ...textNodes]);
    setLayeredImageIds((prev) => {
      const next = new Set(prev);
      next.add(selectedElement.id);
      return next;
    });
    setMessages((prev) => [
      ...prev,
      { id: makeId(), role: 'ai', type: 'text', content: '已完成图文分层（模拟）：新增 3 个文字图层。', timestamp: Date.now() },
    ]);
  };

  useEffect(() => {
    const compute = () => {
      if (!selectedElement || selectedElement.type !== 'image') {
        setLayerActionAnchor(null);
        return;
      }
      const viewport = viewportRef.current;
      if (!viewport) {
        setLayerActionAnchor(null);
        return;
      }
      const rect = viewport.getBoundingClientRect();
      const left = rect.left + pan.x + selectedElement.x + selectedElement.width / 2;
      const top = rect.top + pan.y + selectedElement.y - 12;
      setLayerActionAnchor({ left, top });
    };

    const raf = window.requestAnimationFrame(compute);
    window.addEventListener('resize', compute);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', compute);
    };
  }, [isAgentPanelOpen, isLayersDrawerOpen, pan.x, pan.y, selectedElement]);

  return (
    <div className="w-full h-screen bg-[#F8F9FA] overflow-hidden flex flex-col relative">
      <div ref={appMenuRef} className="fixed top-4 left-4 z-30">
        <button
          type="button"
          onClick={() => setIsAppMenuOpen((v) => !v)}
          className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center"
          aria-label="Deepcanvas 菜单"
        >
          <Home size={20} />
        </button>
        {isAppMenuOpen && (
          <div className="mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setIsAppMenuOpen(false);
                navigate('/');
              }}
              className="w-full px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors text-left"
            >
              返回首页
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAppMenuOpen(false);
                openInNewTab('/editor');
              }}
              className="w-full px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors text-left"
            >
              新建画布
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAppMenuOpen(false);
                const query = searchParams.toString();
                openInNewTab(`/public-canvas${query ? `?${query}` : ''}`);
              }}
              className="w-full px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors text-left"
            >
              新建副本
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAppMenuOpen(false);
                toast.show('无限画布暂不支持保存');
              }}
              className="w-full px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors text-left"
            >
              保存
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAppMenuOpen(false);
                toast.show('无限画布暂不支持另存为');
              }}
              className="w-full px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors text-left"
            >
              另存为
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAppMenuOpen(false);
                navigate('/projects');
              }}
              className="w-full px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors text-left"
            >
              前往个人设计
            </button>
          </div>
        )}
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 w-full h-full relative flex pt-16">
        
        <div
          ref={viewportRef}
          className={clsx(
            "flex-1 h-full relative overflow-hidden bg-[#E5E7EB] cursor-grab",
            isPanning ? "cursor-grabbing" : "cursor-grab"
          )}
          onMouseDown={(e) => {
            if (e.button !== 0) return;
            panStateRef.current.isDragging = true;
            setIsPanning(true);
            panStateRef.current.startX = e.clientX;
            panStateRef.current.startY = e.clientY;
            panStateRef.current.originX = pan.x;
            panStateRef.current.originY = pan.y;
          }}
          onMouseMove={(e) => {
            if (!panStateRef.current.isDragging) return;
            const dx = e.clientX - panStateRef.current.startX;
            const dy = e.clientY - panStateRef.current.startY;
            setPan({ x: panStateRef.current.originX + dx, y: panStateRef.current.originY + dy });
          }}
          onMouseUp={() => {
            panStateRef.current.isDragging = false;
            setIsPanning(false);
          }}
          onMouseLeave={() => {
            panStateRef.current.isDragging = false;
            setIsPanning(false);
          }}
          onClick={() => setSelectedId(null)}
        >
          <div
            className="absolute left-0 top-0"
            style={{
              width: 4200,
              height: 2600,
              transform: `translate(${pan.x}px, ${pan.y}px)`,
            }}
          >
            {elements.filter(isImageElement).map((el) => {
              const isSelected = selectedId === el.id;
              return (
                <div
                  key={el.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(el.id);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(el.id);
                    }
                  }}
                  className={clsx(
                    "absolute rounded-2xl bg-white border border-black/10 shadow-[0_12px_32px_rgba(0,0,0,0.16)]",
                    isSelected ? "ring-2 ring-primary/30" : "hover:ring-2 hover:ring-black/10"
                  )}
                  style={{ left: el.x, top: el.y, width: el.width, height: el.height }}
                >
                  <div className="w-full h-full rounded-2xl overflow-hidden">
                    <img src={el.src} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              );
            })}

            {selectedElement && selectedElement.type === 'image' && layeredImageIds.has(selectedElement.id) && (
              <div
                className="absolute"
                style={{
                  left: selectedElement.x + selectedElement.width + 16,
                  top: selectedElement.y,
                  width: 320,
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="rounded-2xl bg-white/90 backdrop-blur border border-black/10 shadow-[0_16px_40px_rgba(0,0,0,0.12)] overflow-hidden">
                  <div className="px-4 py-3 border-b border-black/5">
                    <div className="text-xs font-bold text-gray-900">图文分层结果（Mock）</div>
                    <div className="text-[11px] text-gray-500 mt-1 truncate">{materialName || selectedElement.id}</div>
                  </div>
                  <div className="p-3 space-y-2">
                    {selectedImageLayeredTexts.length === 0 ? (
                      <div className="text-xs text-gray-500">暂无识别结果</div>
                    ) : (
                      selectedImageLayeredTexts.map((item) => {
                        const kindLabel = item.kind === 'title' ? '标题' : item.kind === 'subtitle' ? '副标题' : item.kind === 'cta' ? 'CTA' : '文字';
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setSelectedId(item.id)}
                            className={clsx(
                              "w-full text-left rounded-xl border px-3 py-2 transition-colors",
                              selectedId === item.id ? "bg-primary/10 border-primary/20" : "bg-white border-black/10 hover:bg-gray-50"
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-gray-900 truncate">{item.text}</span>
                              <span className="shrink-0 px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">
                                {kindLabel}
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {elements.filter(isTextElement).map((el) => {
              const isSelected = selectedId === el.id;
              return (
                <div
                  key={el.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(el.id);
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedId(el.id);
                    }
                  }}
                  className={clsx(
                    "absolute text-left rounded-xl px-3 py-2 bg-white/90 backdrop-blur border border-black/10 shadow-sm",
                    isSelected ? "ring-2 ring-primary/30" : "hover:ring-2 hover:ring-black/10"
                  )}
                  style={{ left: el.x, top: el.y, width: el.width, height: el.height }}
                >
                  <div className={clsx("text-gray-900 font-semibold", el.text.length > 12 ? "text-sm" : "text-base")}>
                    {el.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Left Layers Drawer */}
        <div 
          className={clsx(
            "absolute left-0 top-14 bottom-0 bg-white border-r border-black/5 shadow-2xl transition-all duration-300 z-30 flex flex-col",
            isLayersDrawerOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full"
          )}
        >
          <div className="p-4 border-b border-black/5 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">图层</h3>
            <button onClick={() => setIsLayersDrawerOpen(false)} className="p-1 hover:bg-black/5 rounded-lg text-gray-500">
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {elements.map((el, idx) => {
              const isSelected = selectedId === el.id;
              const label =
                el.type === 'image'
                  ? `图片${idx === 0 && (materialName || materialId) ? `：${materialName || materialId}` : ''}`
                  : el.text.length > 18
                    ? `${el.text.slice(0, 18)}…`
                    : el.text;
              const Icon = el.type === 'image' ? ImageIcon : Type;
              return (
                <button
                  key={el.id}
                  type="button"
                  onClick={() => setSelectedId(el.id)}
                  className={clsx(
                    "w-full flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                    isSelected ? "bg-primary/10 text-primary" : "hover:bg-black/5 text-gray-700"
                  )}
                >
                  <Icon size={16} className={clsx(el.type === 'image' ? "text-blue-500" : "text-purple-500")} />
                  <span className={clsx("text-sm truncate", isSelected ? "font-semibold" : "")}>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Agent Chat Panel */}
        <div 
          className={clsx(
            "h-full bg-white border-l border-black/5 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 flex flex-col z-20 relative",
            isAgentPanelOpen ? "w-80 translate-x-0" : "w-0 translate-x-full"
          )}
        >
          {/* Toggle Button for Agent Panel */}
          <button 
            onClick={() => setIsAgentPanelOpen(!isAgentPanelOpen)}
            className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-16 bg-white border border-r-0 border-black/5 rounded-l-xl flex items-center justify-center shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)] hover:bg-gray-50 transition-colors z-30"
          >
            {isAgentPanelOpen ? <ChevronRight size={20} className="text-gray-500" /> : <Bot size={20} className="text-primary" />}
          </button>

          {isAgentPanelOpen && (
            <>
              <div className="p-4 border-b border-black/5 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <h3 className="font-bold text-gray-800">AI 创作</h3>
              </div>

              <div className="p-3 border-b border-gray-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAiMode('generate')}
                  className={clsx(
                    "flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                    aiMode === 'generate' ? "bg-violet-100 text-violet-700 shadow-sm ring-1 ring-violet-200" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Wand2 size={14} />
                  AI 生图
                </button>
                <button
                  type="button"
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
                  type="button"
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
                  type="button"
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
              
              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                {messages.map(msg => (
                  <div key={msg.id} className={clsx("flex flex-col max-w-[85%]", msg.role === 'user' ? "ml-auto items-end" : "items-start")}>
                    <div 
                      className={clsx(
                        "p-3 rounded-2xl text-sm",
                        msg.role === 'user' 
                          ? "bg-primary text-white rounded-tr-sm" 
                          : "bg-gray-100 text-gray-800 rounded-tl-sm"
                      )}
                    >
                      {msg.type === 'image' ? (
                        <img src={msg.content} alt="AI 结果" className="w-full h-auto rounded-xl" />
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-black/5 bg-white">
                {(aiMode === 'edit' || aiMode === 'blend') && (
                  <div className="mb-3 space-y-2">
                    <input
                      ref={uploadInputRef}
                      type="file"
                      accept="image/*"
                      multiple={aiMode === 'blend'}
                      className="hidden"
                      onChange={handleUploadImages}
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => uploadInputRef.current?.click()}
                        disabled={maxUploadCount === 0 || uploadedAttachments.length >= maxUploadCount}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-[11px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ImagePlus size={14} />
                        {aiMode === 'blend' ? `上传图片 (${uploadedAttachments.length}/${maxUploadCount})` : '上传图片'}
                      </button>
                      <div className="text-[11px] text-gray-500">
                        也可直接选中画布中的图片作为输入
                      </div>
                    </div>

                    {activeAttachments.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {activeAttachments.map((item) => (
                          <div key={item.id} className="relative w-14 h-14 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                            <img src={item.src} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 px-1 py-0.5 bg-black/55 text-white text-[9px] truncate">
                              {item.source === 'canvas' ? '画布' : '上传'}
                            </div>
                            {item.source === 'upload' && (
                              <button
                                type="button"
                                onClick={() => setUploadedAttachments((prev) => prev.filter((x) => x.id !== item.id))}
                                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center"
                                aria-label="移除图片"
                              >
                                <X size={10} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="relative">
                  <textarea
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={
                      aiMode === 'generate'
                        ? '描述你想生成的画面...'
                        : aiMode === 'edit'
                          ? '描述你想如何修改当前图片...'
                          : aiMode === 'blend'
                            ? '描述你想如何融合这些图片...'
                            : '描述你想擦除的内容...'
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 min-h-[92px] resize-none"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={
                      !inputValue.trim() ||
                      (aiMode === 'blend' && activeAttachments.length < 2) ||
                      (aiMode === 'edit' && activeAttachments.length < 1)
                    }
                    className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:bg-gray-300 transition-colors"
                  >
                    <ArrowUp size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      {layerActionAnchor && selectedElement && selectedElement.type === 'image' && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: layerActionAnchor.left,
            top: layerActionAnchor.top,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <button
            type="button"
            disabled={layeredImageIds.has(selectedElement.id)}
            onClick={runLayeringForSelectedImage}
            className={clsx(
              "pointer-events-auto h-9 px-3 rounded-2xl shadow-lg border flex items-center gap-2 text-xs font-semibold transition-colors",
              layeredImageIds.has(selectedElement.id)
                ? "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-900 border-black/10 hover:bg-gray-50"
            )}
          >
            <SplitSquareVertical size={16} />
            图文分层
          </button>
        </div>
      )}

      {/* Bottom Floating Elements */}
      <div className="absolute bottom-6 left-0 w-full flex justify-center pointer-events-none z-20">
        
        {/* Left-bottom Layers Toggle Button */}
        <div className="absolute left-6 bottom-0 pointer-events-auto">
          <button 
            onClick={() => setIsLayersDrawerOpen(!isLayersDrawerOpen)}
            className={clsx(
              "w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center transition-all hover:-translate-y-1 border border-black/5",
              isLayersDrawerOpen ? "bg-primary text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            )}
          >
            <Layers size={24} />
          </button>
        </div>

        {/* Bottom Toolbar */}
        <div className="bg-white px-2 py-2 rounded-2xl shadow-xl border border-black/5 flex items-center gap-1 pointer-events-auto">
          <ToolbarButton 
            icon={MousePointer2} 
            label="选择" 
            isActive={activeTool === 'select'} 
            onClick={() => setActiveTool('select')} 
          />
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <ToolbarButton 
            icon={Square} 
            label="画板 (Frame)" 
            isActive={activeTool === 'frame'} 
            onClick={() => setActiveTool('frame')} 
          />
          <ToolbarButton 
            icon={ImageIcon} 
            label="图形 (Figure)" 
            isActive={activeTool === 'figure'} 
            onClick={() => setActiveTool('figure')} 
          />
          <ToolbarButton 
            icon={Type} 
            label="文本 (Text)" 
            isActive={activeTool === 'text'} 
            onClick={() => setActiveTool('text')} 
          />
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <ToolbarButton 
            icon={MapPin} 
            label="标记位置" 
            isActive={activeTool === 'mark'} 
            onClick={() => setActiveTool('mark')} 
          />
        </div>
      </div>

    </div>
  );
}

function ToolbarButton({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: React.ElementType, 
  label: string, 
  isActive: boolean, 
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "p-2.5 rounded-xl transition-all relative group",
        isActive ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-100"
      )}
      title={label}
    >
      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
      {/* Tooltip */}
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

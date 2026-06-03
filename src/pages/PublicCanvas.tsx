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
  SplitSquareVertical
} from 'lucide-react';
import clsx from 'clsx';
import { useToast } from '../components/ToastProvider';

interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: number;
}

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
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
      width: 520,
      height: 390,
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
    if (initialQuery && messages.length === 0) {
      setMessages([
        { id: Date.now().toString(), role: 'user', content: initialQuery, timestamp: Date.now() },
        { id: (Date.now() + 1).toString(), role: 'agent', content: '收到！我正在为您准备相关的设计资产和建议，请稍候...', timestamp: Date.now() + 1 }
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
        width: 520,
        height: 390,
        src: materialSrc || 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=900&auto=format&fit=crop',
      };
      return [initialImage];
    });
    setSelectedId(null);
    setLayeredImageIds(new Set());
    setPan({ x: 0, y: 0 });
  }, [materialSrc]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue('');

    // Simulate agent response
    setTimeout(() => {
      const newAgentMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'agent',
        content: '我已收到您的反馈，正在调整画布内容。',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, newAgentMsg]);
    }, 1000);
  };

  const selectedElement = useMemo(() => elements.find((el) => el.id === selectedId) || null, [elements, selectedId]);
  const selectedImageLayeredTexts = useMemo(() => {
    if (!selectedElement || selectedElement.type !== 'image') return [];
    return elements.filter(isTextElement).filter((el) => el.originImageId === selectedElement.id);
  }, [elements, selectedElement]);

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
      { id: makeId(), role: 'agent', content: '已完成图文分层（模拟）：新增 3 个文字图层。', timestamp: Date.now() },
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
                <h3 className="font-bold text-gray-800">AI 设计助手</h3>
              </div>
              
              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-black/5 bg-white">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="输入指令调整设计..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-4 pr-12 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="absolute right-1.5 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:bg-gray-300 transition-colors"
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

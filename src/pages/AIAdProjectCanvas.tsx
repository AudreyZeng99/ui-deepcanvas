import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  Image as ImageIcon,
  Layers,
  Move,
  Palette,
  Sparkles,
  SplitSquareVertical,
  Type,
} from 'lucide-react';
import clsx from 'clsx';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

type AssistantProject = {
  internalId: string;
  projectId: string;
  name: string;
  campaign: string;
  thumbnailUrl: string;
  createdAt: number;
};

type CanvasNodeType = 'image' | 'text' | 'frame';

type CanvasNodeBase = {
  id: string;
  type: CanvasNodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

type ImageNode = CanvasNodeBase & {
  type: 'image';
  src: string;
};

type TextNode = CanvasNodeBase & {
  type: 'text';
  text: string;
};

type FrameNode = CanvasNodeBase & {
  type: 'frame';
  title?: string;
};

type CanvasNode = ImageNode | TextNode | FrameNode;

const ASSISTANT_PROJECTS_STORAGE_KEY = 'trae_deepcanvas_ai_ad_assistant_projects_v1';

const isFrameNode = (node: CanvasNode): node is FrameNode => node.type === 'frame';
const isImageNode = (node: CanvasNode): node is ImageNode => node.type === 'image';
const isTextNode = (node: CanvasNode): node is TextNode => node.type === 'text';

const loadAssistantProjects = (): AssistantProject[] => {
  const raw = localStorage.getItem(ASSISTANT_PROJECTS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item: any) => {
        if (!item || typeof item !== 'object') return null;
        if (typeof item.internalId !== 'string') return null;
        if (typeof item.projectId !== 'string') return null;
        if (typeof item.name !== 'string') return null;
        if (typeof item.campaign !== 'string') return null;
        if (typeof item.thumbnailUrl !== 'string') return null;
        if (typeof item.createdAt !== 'number') return null;
        return item as AssistantProject;
      })
      .filter(Boolean) as AssistantProject[];
  } catch {
    return [];
  }
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function AIAdProjectCanvas() {
  const navigate = useNavigate();
  const toast = useToast();
  const { projectInternalId } = useParams<{ projectInternalId: string }>();

  const project = useMemo(() => {
    if (!projectInternalId) return null;
    return loadAssistantProjects().find((p) => p.internalId === projectInternalId) || null;
  }, [projectInternalId]);

  const [zoom, setZoom] = useState(0.25);
  const [pan, setPan] = useState(() => ({ x: 0, y: 0 }));
  const [activeTool, setActiveTool] = useState<'select' | 'hand' | 'image' | 'text'>('select');
  const [selected, setSelected] = useState<{ kind: 'canvas' } | { kind: CanvasNodeType; id: string }>({ kind: 'canvas' });
  const [imageActionAnchor, setImageActionAnchor] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [selectionOverlayRect, setSelectionOverlayRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const [pinnedOverlayRect, setPinnedOverlayRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const [pinnedActionAnchor, setPinnedActionAnchor] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [viewportTick, setViewportTick] = useState(0);

  const [nodes] = useState<CanvasNode[]>(() => {
    const baseX = -220;
    const baseY = -260;
    const imageFrame: FrameNode = { id: 'frame-image', type: 'frame', x: baseX, y: baseY, width: 896, height: 1200, title: project?.name || 'Untitled' };
    const blankFrame: FrameNode = { id: 'frame-blank', type: 'frame', x: baseX + 930, y: baseY, width: 896, height: 1200, title: '' };
    const image: ImageNode = {
      id: 'node-image-0',
      type: 'image',
      x: baseX,
      y: baseY,
      width: 896,
      height: 1200,
      src: project?.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=900&auto=format&fit=crop',
    };
    const pinnedDemoImage: ImageNode = {
      id: 'node-image-1',
      type: 'image',
      x: baseX + 930,
      y: baseY,
      width: 896,
      height: 1200,
      src: 'https://images.unsplash.com/photo-1557682260-96773eb01377?q=80&w=900&auto=format&fit=crop',
    };
    const miniImage: ImageNode = {
      id: 'node-image-2',
      type: 'image',
      x: baseX + 280,
      y: baseY + 980,
      width: 360,
      height: 240,
      src: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=900&auto=format&fit=crop',
    };
    const text: TextNode = {
      id: 'node-text-1',
      type: 'text',
      x: baseX + 24,
      y: baseY + 24,
      width: 320,
      height: 48,
      text: project?.name || 'Untitled',
    };
    return [imageFrame, blankFrame, image, pinnedDemoImage, miniImage, text];
  });

  useEffect(() => {
    if (!projectInternalId) return;
    document.title = project ? project.name : 'Project';
  }, [project, projectInternalId]);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const panStateRef = useRef<{
    dragging: boolean;
    startClientX: number;
    startClientY: number;
    startPanX: number;
    startPanY: number;
  }>({
    dragging: false,
    startClientX: 0,
    startClientY: 0,
    startPanX: 0,
    startPanY: 0,
  });

  const onWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const delta = -e.deltaY;
    const next = clamp(zoom + delta * 0.0008, 0.1, 2);
    setZoom(next);
  };

  const startPanDrag = (clientX: number, clientY: number) => {
    panStateRef.current.dragging = true;
    panStateRef.current.startClientX = clientX;
    panStateRef.current.startClientY = clientY;
    panStateRef.current.startPanX = pan.x;
    panStateRef.current.startPanY = pan.y;
  };

  const onPointerDownViewport = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const isHand = activeTool === 'hand';
    const shouldPan = isHand || selected.kind === 'canvas';
    if (!shouldPan) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    startPanDrag(e.clientX, e.clientY);
  };

  const onPointerMoveViewport = (e: React.PointerEvent) => {
    if (!panStateRef.current.dragging) return;
    const dx = e.clientX - panStateRef.current.startClientX;
    const dy = e.clientY - panStateRef.current.startClientY;
    setPan({
      x: panStateRef.current.startPanX + dx,
      y: panStateRef.current.startPanY + dy,
    });
  };

  const onPointerUpViewport = (e: React.PointerEvent) => {
    if (!panStateRef.current.dragging) return;
    panStateRef.current.dragging = false;
    const el = e.currentTarget as HTMLDivElement;
    if (el.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
  };

  const selectedNode = useMemo(() => {
    if (selected.kind === 'canvas') return null;
    return nodes.find((n) => n.id === selected.id) || null;
  }, [nodes, selected]);

  const pinnedDemoNode = useMemo(() => {
    return nodes.find((n) => n.type === 'image' && n.id === 'node-image-1') || null;
  }, [nodes]);

  useEffect(() => {
    const onResize = () => setViewportTick((prev) => prev + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!viewportRef.current || !pinnedDemoNode || pinnedDemoNode.type !== 'image') {
      setPinnedOverlayRect(null);
      setPinnedActionAnchor(null);
      return;
    }
    const rect = viewportRef.current.getBoundingClientRect();
    const nodeLeft = rect.width / 2 + pan.x + pinnedDemoNode.x * zoom;
    const nodeTop = rect.height / 2 + pan.y + pinnedDemoNode.y * zoom;
    const nodeWidth = pinnedDemoNode.width * zoom;
    const nodeHeight = pinnedDemoNode.height * zoom;
    setPinnedOverlayRect({ left: nodeLeft, top: nodeTop, width: nodeWidth, height: nodeHeight });
    const centerX = nodeLeft + nodeWidth / 2;
    const top = nodeTop - (44 + 8 + 24 + 10);
    setPinnedActionAnchor({ left: centerX, top });
  }, [pan.x, pan.y, pinnedDemoNode, viewportTick, zoom]);

  useEffect(() => {
    if (!viewportRef.current) {
      setImageActionAnchor(null);
      setSelectionOverlayRect(null);
      return;
    }
    if (!selectedNode || selectedNode.type !== 'image') {
      setImageActionAnchor(null);
    }
    if (!selectedNode || selectedNode.type === 'frame') {
      if (!selectedNode) {
        setSelectionOverlayRect(null);
        return;
      }
    }
    const rect = viewportRef.current.getBoundingClientRect();
    if (selectedNode) {
      const nodeLeft = rect.width / 2 + pan.x + selectedNode.x * zoom;
      const nodeTop = rect.height / 2 + pan.y + selectedNode.y * zoom;
      const nodeWidth = selectedNode.width * zoom;
      const nodeHeight = selectedNode.height * zoom;
      setSelectionOverlayRect({ left: nodeLeft, top: nodeTop, width: nodeWidth, height: nodeHeight });

      if (selectedNode.type === 'image') {
        const centerX = nodeLeft + nodeWidth / 2;
        const top = nodeTop - (44 + 8 + 24 + 10);
        setImageActionAnchor({ left: centerX, top });
      } else {
        setImageActionAnchor(null);
      }
    } else {
      setSelectionOverlayRect(null);
    }
  }, [pan.x, pan.y, selectedNode, viewportTick, zoom]);

  if (!project) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-[1200px] mx-auto">
          <button
            type="button"
            onClick={() => navigate('/ai-ad-design-assistant')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/10 hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-800 shadow-sm"
          >
            <ArrowLeft size={16} />
            返回 AI广告设计助手
          </button>
          <div className="mt-6 bg-white rounded-3xl border border-black/5 shadow-sm p-8">
            <div className="text-lg font-bold text-gray-900">项目不存在</div>
            <div className="text-sm text-gray-500 mt-2">可能是项目被删除或 localStorage 被清理。</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-gray-900">
      <div className="h-screen flex flex-col">
        <header className="h-14 flex items-center justify-between px-4 bg-white border-b border-black/5">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate('/ai-ad-design-assistant')}
              className="w-10 h-10 rounded-full border border-black/10 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center text-gray-700"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-sm font-bold truncate">
                  项目：{project.name}(ID: {project.projectId}) <span className="mx-2 text-gray-300">|</span> 关联活动：{project.campaign}
                </div>
                <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
              </div>
              <div className="text-[11px] text-gray-500 truncate">点击画布空白处可选中画布，点击元素可选中图片/文字</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toast.show('保存项目功能开发中')}
              className="h-10 px-4 rounded-full bg-white border border-black/10 hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              保存项目
            </button>
            <button
              type="button"
              onClick={() => toast.show('另存项目功能开发中')}
              className="h-10 px-4 rounded-full bg-white border border-black/10 hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700"
            >
              另存项目
            </button>
            <button
              type="button"
              onClick={() => navigate('/ai-ad-design-assistant')}
              className="h-10 px-4 rounded-full bg-gray-900 hover:bg-black transition-colors text-sm font-semibold text-white"
            >
              退出画布
            </button>
          </div>
        </header>

        <div className="flex-1 min-h-0 flex">
          <div className="flex-1 min-w-0 relative">
            <div
              ref={viewportRef}
              className="absolute inset-0 overflow-hidden"
              onWheel={onWheel}
              onPointerDown={onPointerDownViewport}
              onPointerMove={onPointerMoveViewport}
              onPointerUp={onPointerUpViewport}
              onPointerCancel={onPointerUpViewport}
            >
              <button
                type="button"
                className="absolute inset-0 cursor-default"
                onClick={() => setSelected({ kind: 'canvas' })}
                aria-label="Canvas"
              />

              {pinnedOverlayRect && (
                <div
                  className="absolute z-20 pointer-events-none rounded-[6px] border-[3px] border-[#2E5BFF] shadow-[0_0_0_4px_rgba(46,91,255,0.22)]"
                  style={{
                    left: pinnedOverlayRect.left,
                    top: pinnedOverlayRect.top,
                    width: pinnedOverlayRect.width,
                    height: pinnedOverlayRect.height,
                  }}
                />
              )}

              {pinnedActionAnchor && pinnedDemoNode?.type === 'image' && (
                <div
                  className="absolute z-20 pointer-events-none"
                  style={{
                    left: pinnedActionAnchor.left,
                    top: pinnedActionAnchor.top,
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="pointer-events-auto image-action-bar inline-flex h-[44px] items-center gap-1 px-1.5 rounded-[14px] bg-white/95 backdrop-blur border border-solid border-black/10 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
                      <ActionBarButton label="AI改色调" icon={Palette} onClick={() => toast.show('AI改色调功能开发中')} />
                      <ActionBarButton label="多图生成" icon={Sparkles} onClick={() => toast.show('多图生成功能开发中')} />
                      <ActionBarButton label="AI改图" icon={ImageIcon} onClick={() => toast.show('AI改图功能开发中')} />
                      <ActionBarButton label="图文分层" icon={SplitSquareVertical} onClick={() => toast.show('图文分层功能开发中')} />
                    </div>
                    <div className="pointer-events-none px-3 py-1 rounded-full bg-white/95 backdrop-blur border border-black/10 shadow-sm text-[11px] font-semibold text-gray-700">
                      {pinnedDemoNode.id} · {pinnedDemoNode.width}×{pinnedDemoNode.height}
                    </div>
                  </div>
                </div>
              )}

              {selectionOverlayRect && (
                <div
                  className="absolute z-20 pointer-events-none rounded-[6px] border-2 border-[#2E5BFF] shadow-[0_0_0_3px_rgba(46,91,255,0.22)]"
                  style={{
                    left: selectionOverlayRect.left,
                    top: selectionOverlayRect.top,
                    width: selectionOverlayRect.width,
                    height: selectionOverlayRect.height,
                  }}
                />
              )}

              {imageActionAnchor && selectedNode?.type === 'image' && (
                <div
                  className="absolute z-20 pointer-events-none"
                  style={{
                    left: imageActionAnchor.left,
                    top: imageActionAnchor.top,
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="pointer-events-auto image-action-bar inline-flex h-[44px] items-center gap-1 px-1.5 rounded-[14px] bg-white/95 backdrop-blur border border-solid border-black/10 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
                      <ActionBarButton label="AI改色调" icon={Palette} onClick={() => toast.show('AI改色调功能开发中')} />
                      <ActionBarButton label="多图生成" icon={Sparkles} onClick={() => toast.show('多图生成功能开发中')} />
                      <ActionBarButton label="AI改图" icon={ImageIcon} onClick={() => toast.show('AI改图功能开发中')} />
                      <ActionBarButton label="图文分层" icon={SplitSquareVertical} onClick={() => toast.show('图文分层功能开发中')} />
                    </div>
                    <div className="pointer-events-none px-3 py-1 rounded-full bg-white/95 backdrop-blur border border-black/10 shadow-sm text-[11px] font-semibold text-gray-700">
                      {selectedNode.id} · {selectedNode.width}×{selectedNode.height}
                    </div>
                  </div>
                </div>
              )}

              <div
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: 'center',
                }}
              >
                <div className="relative" style={{ width: 2400, height: 1600 }}>
                  {nodes
                    .filter(isFrameNode)
                    .map((node) => {
                      const isSelected = selected.kind !== 'canvas' && selected.id === node.id;
                      return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected({ kind: 'frame', id: node.id });
                        }}
                        className={clsx(
                          "absolute bg-white border border-black/5 shadow-[0_1px_0_rgba(0,0,0,0.03)]",
                          isSelected ? "ring-2 ring-[#2E5BFF]/40" : ""
                        )}
                        style={{
                          left: node.x,
                          top: node.y,
                          width: node.width,
                          height: node.height,
                        }}
                      />
                    )})}

                  {nodes
                    .filter(isImageNode)
                    .map((node) => {
                      const isSelected = selected.kind !== 'canvas' && selected.id === node.id;
                      return (
                        <button
                          key={node.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected({ kind: 'image', id: node.id });
                          }}
                          className={clsx(
                            'absolute overflow-hidden border border-black/5 transition-shadow',
                            isSelected
                              ? 'shadow-[0_12px_28px_rgba(46,91,255,0.20)]'
                              : 'hover:ring-2 hover:ring-black/10 hover:shadow-lg'
                          )}
                          style={{
                            left: node.x,
                            top: node.y,
                            width: node.width,
                            height: node.height,
                          }}
                        >
                          <img src={node.src} alt="" className="w-full h-full object-cover" />
                        </button>
                      );
                    })}

                  {nodes
                    .filter(isTextNode)
                    .map((node) => {
                      const isSelected = selected.kind !== 'canvas' && selected.id === node.id;
                      return (
                        <button
                          key={node.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected({ kind: 'text', id: node.id });
                          }}
                          className={clsx(
                            'absolute text-left',
                            isSelected ? 'rounded-lg' : 'hover:ring-2 hover:ring-black/10 hover:rounded-lg'
                          )}
                          style={{
                            left: node.x,
                            top: node.y,
                            width: node.width,
                            height: node.height,
                            padding: 8,
                          }}
                        >
                          <div className="text-lg font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
                            {node.text}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              <div className="absolute left-4 bottom-4 z-10">
                <div className="px-3 py-1.5 rounded-full bg-white border border-black/10 shadow-sm text-xs font-semibold text-gray-700">
                  {Math.round(zoom * 100)}%
                </div>
              </div>

              <div className="absolute left-1/2 bottom-4 -translate-x-1/2 z-10">
                <div className="bg-white border border-black/10 shadow-sm rounded-2xl px-2 py-2 flex items-center gap-1">
                  <BottomToolButton
                    active={activeTool === 'select'}
                    icon={Move}
                    label="选择"
                    onClick={() => setActiveTool('select')}
                  />
                  <BottomToolButton
                    active={activeTool === 'hand'}
                    icon={Layers}
                    label="拖拽"
                    onClick={() => setActiveTool('hand')}
                  />
                  <BottomToolButton
                    active={activeTool === 'image'}
                    icon={ImageIcon}
                    label="图片"
                    onClick={() => {
                      setActiveTool('image');
                      toast.show('图片插入功能开发中');
                    }}
                  />
                  <BottomToolButton
                    active={activeTool === 'text'}
                    icon={Type}
                    label="文字"
                    onClick={() => {
                      setActiveTool('text');
                      toast.show('文字插入功能开发中');
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <aside className="w-[380px] border-l border-black/5 bg-white flex flex-col">
            <div className="p-4 border-b border-black/5">
              <div className="text-sm font-bold text-gray-900">Agent 对话</div>
              <div className="text-xs text-gray-500 mt-1">针对当前画布与选中元素给出建议与操作</div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto p-4" />

            <div className="p-4 border-t border-black/5">
              <div className="bg-gray-50/70 border border-black/5 rounded-2xl px-3 py-2.5 space-y-2">
                <div className="text-[11px] text-gray-500 truncate">
                  当前选择：
                  {selected.kind === 'canvas'
                    ? '画布'
                    : selectedNode
                      ? `${selectedNode.type} · ${selectedNode.id} · ${selectedNode.width}×${selectedNode.height}`
                      : '元素'}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    placeholder="输入需求，例如：把主色调改成蓝紫渐变…"
                    className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => toast.show('发送功能开发中')}
                    className="h-9 px-3 rounded-xl bg-gray-900 hover:bg-black transition-colors text-xs font-semibold text-white"
                  >
                    发送
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ActionBarButton({ label, icon: Icon, onClick }: { label: string; icon: React.ElementType; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-9 px-3 rounded-[12px] hover:bg-black/5 transition-colors text-sm font-semibold text-gray-700 flex items-center gap-2"
    >
      <Icon size={16} className="text-gray-600" />
      <span>{label}</span>
    </button>
  );
}

function BottomToolButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'w-11 h-11 rounded-2xl border flex items-center justify-center transition-all',
        active ? 'bg-gray-900 border-gray-900 text-white shadow-sm' : 'bg-white border-black/10 text-gray-700 hover:bg-gray-50'
      )}
      aria-label={label}
      title={label}
    >
      <Icon size={18} />
    </button>
  );
}

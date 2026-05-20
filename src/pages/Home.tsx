import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUp,
  Briefcase,
  Building2,
  Folder,
  Image as ImageIcon,
  Plus,
  Sparkles,
  Users,
  Wand2,
  Eraser,
  Scissors,
  Layers,
  FileText,
  Presentation,
  ScanFace,
  History,
  MoreHorizontal,
} from 'lucide-react';
import clsx from 'clsx';
import CreateCanvasModal from '../components/CreateCanvasModal';

import { useTheme } from '../theme/ThemeContext';
import { Tooltip } from '../components/Tooltip';
import { useToast } from '../components/ToastProvider';

export default function Home() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const toast = useToast();
  const [isCanvasModalOpen, setIsCanvasModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);

  const handleChatSubmit = () => {
    const q = chatInput.trim();
    if (!q) return;
    navigate(`/public-canvas?q=${encodeURIComponent(q)}`);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) setIsCreateMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const isGlass = theme.id.includes('glass');
  const isOutlined = theme.id.includes('outlined');

  const glassCardClasses = isGlass ? "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] ring-1 ring-white/20 !bg-opacity-60 backdrop-blur-xl" : "";
  
  const getToolIconClasses = () => {
    if (isOutlined) return "bg-black/5 border-black/10 hover:bg-black/10 text-black";
    if (isGlass) return "bg-white/20 border-white/30 hover:bg-white/30 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]";
    return "bg-white/10 border-white/10 hover:bg-white/20 text-white"; // Default (Lovart/Nunito Original)
  };
  
  const toolIconClass = getToolIconClasses();

  const aiTools = useMemo(
    () => [
      { icon: Wand2, label: 'AI 改图', path: '/tools/ai-edit' },
      { icon: Eraser, label: 'AI 擦除', path: '/tools/ai-erase' },
      { icon: Scissors, label: 'AI 抠图', path: '/tools/ai-matting' },
      { icon: Layers, label: 'AI 溶图', path: '/tools/ai-blend' },
      { icon: FileText, label: 'md2Card', path: '/tools/md2card' },
      { icon: Presentation, label: 'PPT 生成', path: '/tools/ppt-gen' },
      { icon: ScanFace, label: '证件照生成', path: '/tools/id-photo' },
      { icon: History, label: '老照片修复', path: '/tools/old-photo' },
      { icon: MoreHorizontal, label: '结构化海报', path: '' },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <CreateCanvasModal 
        isOpen={isCanvasModalOpen} 
        onClose={() => setIsCanvasModalOpen(false)} 
      />

      <aside className="fixed left-0 top-0 h-screen w-20 bg-white border-r border-gray-100 z-50 flex flex-col items-center py-6 gap-3">
        <Link to="/" className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-black/20">
          D
        </Link>

        <div className="mt-4 flex flex-col items-center gap-2 w-full px-2">
          <QuickActionLink icon={Briefcase} label="工作间" to="/workroom" />
          <QuickActionLink icon={Folder} label="个人空间" to="/projects" />

          <div className="relative w-full flex items-center justify-center" ref={createMenuRef}>
            <Tooltip content="新建画布" position="right">
              <button
                type="button"
                onClick={() => setIsCreateMenuOpen((v) => !v)}
                className={clsx(
                  'p-3 rounded-xl transition-all duration-200 flex items-center justify-center w-full',
                  isCreateMenuOpen ? 'bg-black text-white shadow-lg shadow-black/20' : 'text-gray-400 hover:bg-gray-100 hover:text-black'
                )}
                aria-label="新建画布"
              >
                <Plus size={22} />
              </button>
            </Tooltip>
            {isCreateMenuOpen && (
              <div className="absolute left-[76px] top-1/2 -translate-y-1/2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateMenuOpen(false);
                    setIsCanvasModalOpen(true);
                  }}
                  className="w-full px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  新建创建设计画布
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateMenuOpen(false);
                    navigate('/public-canvas');
                  }}
                  className="w-full px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-left"
                >
                  新建无限画布
                </button>
              </div>
            )}
          </div>

          <div className="w-8 h-px bg-gray-100 my-1" />
          <QuickActionLink icon={Sparkles} label="提示词灵感" to="/inspiration" />
          <QuickActionLink icon={ImageIcon} label="文生图" to="/text-to-image" />
          <QuickActionLink icon={Users} label="社区" to="/templates?scope=public" />
          <QuickActionLink icon={Building2} label="团队" to="/templates?scope=team" />
        </div>
      </aside>

      <main className="ml-20 min-h-screen flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-[980px] space-y-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="text-2xl font-black text-gray-900">Deepcanvas</div>
              <div className="text-sm text-gray-500">输入需求，直接开始创作。按 ⌘/Ctrl + Enter 发送。</div>
            </div>
            <Link to="/workroom" className="h-10 px-4 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Briefcase size={16} />
              进入工作间
            </Link>
          </div>

          <div className="w-full relative">
            <div
              className={clsx(
                'absolute top-3 left-4 z-10 px-2 py-0.5 rounded-md border text-[11px] font-semibold tracking-wide pointer-events-none select-none',
                isGlass ? 'bg-white/70 backdrop-blur-xl border-white/20 text-gray-700' : 'bg-white border-gray-200 text-gray-600'
              )}
            >
              Agent会话（内测）
            </div>
            <textarea
              placeholder="告诉我你想设计什么，例如：帮我生成一张母亲节营销海报...\n也可以补充：目标人群/渠道/版式/风格/品牌色/CTA"
              className={clsx(
                'w-full min-h-[150px] pt-10 pb-14 px-4 rounded-3xl border shadow-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-base transition-all resize-none',
                isGlass ? 'bg-white/60 backdrop-blur-xl border-white/20 text-black placeholder:text-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'
              )}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleChatSubmit();
                }
              }}
            />
            <button
              onClick={handleChatSubmit}
              className="absolute right-4 bottom-4 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!chatInput.trim()}
              aria-label="发送"
            >
              <ArrowUp size={18} className="translate-x-[-1px] translate-y-[1px]" />
            </button>
          </div>

          <div className={clsx('rounded-3xl p-6 border', isGlass ? glassCardClasses : 'bg-white border-gray-200')}>
            <div className="flex items-end justify-between gap-3 flex-wrap">
              <div>
                <div className="text-sm font-semibold text-gray-900">玩转AI</div>
                <div className="text-xs text-gray-500 mt-1">对话框下方直达所有工具</div>
              </div>
              <button
                type="button"
                onClick={() => toast.show('更多工具规划中')}
                className="h-9 px-4 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-semibold text-gray-800"
              >
                工具规划
              </button>
            </div>

            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3 mt-4">
              {aiTools.map((t) => (
                <ToolIcon
                  key={t.label}
                  icon={t.icon}
                  label={t.label}
                  className={toolIconClass}
                  onClick={() => {
                    if (!t.path) {
                      toast.show('结构化海报功能开发中');
                      return;
                    }
                    navigate(t.path);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function QuickActionLink({ icon: Icon, label, to }: { icon: React.ElementType; label: string; to: string }) {
  return (
    <Tooltip content={label} position="right">
      <Link
        to={to}
        className="p-3 rounded-xl transition-all duration-200 group relative flex items-center justify-center w-full text-gray-400 hover:bg-gray-100 hover:text-black"
        aria-label={label}
      >
        <Icon size={22} strokeWidth={2} className="shrink-0" />
      </Link>
    </Tooltip>
  );
}

function ToolIcon({ icon: Icon, label, className, onClick }: { icon: React.ElementType; label: string; className?: string; onClick?: () => void }) {
  return (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={clsx("flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl backdrop-blur-sm border hover:scale-105 transition-all duration-300 cursor-pointer group/icon", className)}
    >
      <Icon size={20} className="group-hover/icon:scale-110 transition-transform duration-300" />
      <span className="text-[11px] font-medium opacity-90 whitespace-nowrap">{label}</span>
    </div>
  );
}

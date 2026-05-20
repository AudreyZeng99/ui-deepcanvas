import { useMemo, useState } from 'react';
import type { ElementType } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUp,
  Briefcase,
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

import { useTheme } from '../theme/ThemeContext';
import { useToast } from '../components/ToastProvider';

export default function Home() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const toast = useToast();
  const [chatInput, setChatInput] = useState('');

  const handleChatSubmit = () => {
    const q = chatInput.trim();
    if (!q) return;
    navigate(`/public-canvas?q=${encodeURIComponent(q)}`);
  };
  
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
    <div className="min-h-screen flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-[980px] space-y-6 relative">
          <div className="pointer-events-none select-none absolute -right-10 -top-10 w-44 opacity-90">
            <img src={`${import.meta.env.BASE_URL}figure/cloud-white.png`} alt="" className="w-full h-full object-contain drop-shadow-2xl" />
          </div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-black relative inline-block leading-tight">
                  <span className="relative z-10 text-gray-900">Deepcanvas, 让设计更简单</span>
                  <svg className="absolute -bottom-1 right-0 w-32 h-3 z-0 text-accent-secondary" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" className="opacity-50" />
                  </svg>
                  <span className="absolute -top-5 -right-8 text-3xl animate-bounce">✨</span>
                </h1>
                <div className="text-sm text-gray-500">输入需求，直接开始创作。按 ⌘/Ctrl + Enter 发送。</div>
              </div>
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
    </div>
  );
}

function ToolIcon({ icon: Icon, label, className, onClick }: { icon: ElementType; label: string; className?: string; onClick?: () => void }) {
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

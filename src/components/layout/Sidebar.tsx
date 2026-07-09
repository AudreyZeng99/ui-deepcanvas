import { useEffect, useRef, useState } from 'react';
import type { ElementType } from 'react';
import {
  Building2,
  Package,
  Eraser,
  FileText,
  FlaskConical,
  History,
  Home,
  Image as ImageIcon,
  Layers,
  MoreHorizontal,
  PencilLine,
  Plus,
  Scissors,
  Sparkles,
  User,
  Users,
  Wand2,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import clsx from 'clsx';

import { Tooltip } from '../Tooltip';
import CreateCanvasModal from '../CreateCanvasModal';
import { useToast } from '../ToastProvider';

const TOOL_CARDS = [
  {
    id: 'ai-edit',
    icon: Wand2,
    label: 'AI 改图',
    desc: '风格/尺寸一键调整',
    path: '/tools/ai-edit',
    openInNewTab: false,
  },
  {
    id: 'ai-erase',
    icon: Eraser,
    label: 'AI 擦除',
    desc: '去路人 / 去水印',
    path: '/tools/ai-erase',
    openInNewTab: false,
  },
  {
    id: 'ai-matting',
    icon: Scissors,
    label: 'AI 抠图',
    desc: '一键去背景，保主体',
    path: '/tools/ai-matting',
    openInNewTab: false,
  },
  {
    id: 'ai-blend',
    icon: Layers,
    label: 'AI 溶图',
    desc: '两图自然融合更好看',
    path: '/tools/ai-blend',
    openInNewTab: false,
  },
  {
    id: 'md2card',
    icon: FileText,
    label: 'md2Card',
    desc: '把文章变成海报卡片',
    path: '/tools/md2card',
    openInNewTab: false,
  },
  {
    id: 'ai-copy',
    icon: PencilLine,
    label: 'AI 文案',
    desc: '标题卖点一键润色改写',
    path: '/tools/ai-copy',
    openInNewTab: true,
  },
  {
    id: 'id-photo',
    icon: ImageIcon,
    label: '证件照生成',
    desc: '换底色 / 裁切 / 规格',
    path: '/tools/id-photo',
    openInNewTab: false,
  },
  {
    id: 'old-photo',
    icon: History,
    label: '老照片修复',
    desc: '变清晰 / 去噪 / 上色',
    path: '/tools/old-photo',
    openInNewTab: false,
  },
  {
    id: 'material-batch-generator',
    icon: Package,
    label: '素材批量生成',
    desc: '元素、状态、色系一键组合',
    path: '/tools/material-batch-generator',
    openInNewTab: false,
  },
  {
    id: 'good-news',
    icon: MoreHorizontal,
    label: '喜报生成',
    desc: '输入要点，一键生成喜报',
    path: '',
    openInNewTab: false,
  },
] as const;

export default function Sidebar() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isCanvasModalOpen, setIsCanvasModalOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const openInNewTab = (path: string) => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const url = `${window.location.origin}${import.meta.env.BASE_URL}#${normalized}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) setIsCreateMenuOpen(false);
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) setIsToolsMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 bg-white border-r border-gray-100 z-50 flex flex-col items-center py-6 gap-3">
      <CreateCanvasModal isOpen={isCanvasModalOpen} onClose={() => setIsCanvasModalOpen(false)} />

      <div className="w-full px-2">
        <NavLink
          to="/"
          className="w-full p-3 rounded-xl bg-black text-white flex items-center justify-center"
          aria-label="返回首页"
        >
          <img
            src={`${import.meta.env.BASE_URL}figure/cloud-white.png`}
            alt=""
            className="w-8 h-8 object-contain"
          />
        </NavLink>
      </div>

      <nav className="mt-4 flex flex-col items-center gap-2 w-full px-2">
        <IconNavLink icon={Home} label="首页" to="/" />
        <IconNavLink icon={User} label="个人空间" to="/projects" />
        <IconNavLink icon={Layers} label="图层库" to="/layer-library" />

        <div className="relative w-full flex items-center justify-center" ref={createMenuRef}>
          <Tooltip content="新建画布" position="right">
            <button
              type="button"
              onClick={() => setIsCreateMenuOpen((v) => !v)}
              className={clsx(
                'p-3 rounded-xl transition-colors duration-200 flex items-center justify-center w-full',
                isCreateMenuOpen ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-black'
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
                  openInNewTab('/public-canvas');
                }}
                className="w-full px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-left"
              >
                新建无限画布
              </button>
            </div>
          )}
        </div>

        <div className="w-8 h-px bg-gray-100 my-1" />

        <div className="relative w-full flex items-center justify-center" ref={toolsMenuRef}>
          <Tooltip content="多样化物料制作工具体验" position="right">
            <button
              type="button"
              onClick={() => {
                setIsCreateMenuOpen(false);
                setIsToolsMenuOpen((v) => !v);
              }}
              className={clsx(
                'p-3 rounded-xl transition-colors duration-200 flex items-center justify-center w-full',
                isToolsMenuOpen ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-black'
              )}
              aria-label="多样化物料制作工具体验"
            >
              <FlaskConical size={22} />
            </button>
          </Tooltip>
          {isToolsMenuOpen && (
            <div
              className="absolute left-[76px] top-1/2 -translate-y-1/2 w-[420px] bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden"
              style={{
                ['--tools-card-hover' as any]: 'rgba(143, 122, 251, 0.06)',
                ['--tools-bg' as any]: 'rgba(143, 122, 251, 0.12)',
                ['--tools-bg-hover' as any]: 'rgba(143, 122, 251, 0.18)',
                ['--tools-border' as any]: 'rgba(143, 122, 251, 0.25)',
                ['--tools-border-hover' as any]: 'rgba(143, 122, 251, 0.38)',
                ['--tools-fg' as any]: '#6F58F3',
              }}
            >
              <div className="px-3 pt-3 pb-2 border-b border-gray-100">
                <div className="text-sm font-semibold text-gray-900">多样化物料制作工具体验</div>
                <div className="text-xs text-gray-500 mt-1">选择一个工具进入具体页面</div>
              </div>
              <div className="p-3">
                <div className="grid grid-cols-3 gap-2">
                  {TOOL_CARDS.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => {
                          if (!tool.path) {
                            toast.show('喜报生成功能开发中');
                            return;
                          }
                          setIsToolsMenuOpen(false);
                          if (tool.openInNewTab) {
                            openInNewTab(tool.path);
                            return;
                          }
                          navigate(tool.path);
                        }}
                        className={clsx(
                          'group flex flex-col items-start gap-2 p-3 rounded-2xl border bg-white transition-all duration-200 text-left',
                          tool.path
                            ? 'border-black/5 hover:border-black/10 hover:bg-[var(--tools-card-hover)] hover:-translate-y-0.5 hover:shadow-sm'
                            : 'border-black/5 opacity-70 cursor-not-allowed'
                        )}
                        aria-disabled={!tool.path}
                      >
                        <div className="w-10 h-10 rounded-2xl border flex items-center justify-center transition-colors bg-[var(--tools-bg)] border-[var(--tools-border)] text-[var(--tools-fg)] group-hover:bg-[var(--tools-bg-hover)] group-hover:border-[var(--tools-border-hover)]">
                          <Icon size={22} strokeWidth={2.2} />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-gray-900 leading-none">{tool.label}</div>
                          <div className="text-[11px] text-gray-500 leading-snug line-clamp-2">{tool.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <IconNavLink icon={Sparkles} label="提示词灵感" to="/inspiration" />
        <IconNavLink icon={ImageIcon} label="文生图" to="/text-to-image" />

        <IconNavLink
          icon={Users}
          label="社区"
          to="/templates"
        />
        <IconNavLink
          icon={Building2}
          label="团队"
          to="/team-templates"
        />
      </nav>
    </aside>
  );
}

function IconNavLink({
  icon: Icon,
  label,
  to,
  forceActive,
}: {
  icon: ElementType;
  label: string;
  to: string;
  forceActive?: boolean;
}) {
  return (
    <Tooltip content={label} position="right">
      <NavLink
        to={to}
        className={({ isActive }) =>
          clsx(
            'p-3 rounded-xl transition-colors duration-200 group relative flex items-center justify-center w-full',
            forceActive ?? isActive ? 'bg-black text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-black'
          )
        }
        aria-label={label}
      >
        {({ isActive }) => <Icon size={22} strokeWidth={(forceActive ?? isActive) ? 2.5 : 2} className="shrink-0" />}
      </NavLink>
    </Tooltip>
  );
}

import { useEffect, useRef, useState } from 'react';
import type { ElementType } from 'react';
import { Building2, Folder, Home, Image as ImageIcon, Layers, Plus, Sparkles, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import { Tooltip } from '../Tooltip';
import CreateCanvasModal from '../CreateCanvasModal';

export default function Sidebar() {
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [isCanvasModalOpen, setIsCanvasModalOpen] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const openInNewTab = (path: string) => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const url = `${window.location.origin}${import.meta.env.BASE_URL}#${normalized}`;
    window.open(url, '_blank', 'noopener,noreferrer');
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
        <IconNavLink icon={Folder} label="个人空间" to="/projects" />
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

import { 
  Sparkles, 
  Image as ImageIcon, 
  PenTool, 
  LayoutTemplate, 
  LayoutGrid,
  Settings,
  FolderOpen,
  MessageSquare
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

import { Tooltip } from '../Tooltip';

const menuGroups = [
  {
    title: '开始设计',
    items: [
      { icon: Sparkles, label: '灵感', path: '/inspiration' },
      { icon: ImageIcon, label: '文生图', path: '/text-to-image' },
      { icon: PenTool, label: '创建设计', path: '/editor' },
      { icon: LayoutTemplate, label: '模版', path: '/templates' },
    ]
  },
  {
    title: '我的',
    items: [
      { icon: FolderOpen, label: '我的项目', path: '/projects' },
      { icon: LayoutGrid, label: '资产管理', path: '/gallery' },
    ]
  }
];

export default function Sidebar() {
  return (
    <aside 
      className="fixed left-0 top-0 h-screen flex flex-col py-6 bg-white border-r border-gray-100 z-50 w-20 items-center transition-all duration-300 ease-in-out"
    >
      {/* Header / Logo */}
      <div className="mb-8 flex items-center justify-center">
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl transition-transform group-hover:scale-105 shrink-0 shadow-lg shadow-black/20">
            D
          </div>
        </NavLink>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-8 overflow-y-auto w-full no-scrollbar px-2">
        {menuGroups.map((group, index) => (
          <div key={group.title} className="flex flex-col gap-3 items-center w-full">
            {group.items.map((item) => (
              <Tooltip key={item.path} content={item.label} position="right">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      "p-3 rounded-xl transition-all duration-200 group relative flex items-center justify-center",
                      isActive 
                        ? "bg-black text-white shadow-lg shadow-black/20"
                        : "text-gray-400 hover:bg-gray-100 hover:text-black"
                    )
                  }
                >
                  {({ isActive }) => (
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                  )}
                </NavLink>
              </Tooltip>
            ))}
            {/* Separator between groups */}
            {index < menuGroups.length - 1 && (
              <div className="w-8 h-px bg-gray-100 mt-2" />
            )}
          </div>
        ))}
      </nav>

      {/* Footer / Settings / Feedback */}
      <div className="mt-auto w-full flex flex-col gap-4 items-center px-2 pb-6">
        <Tooltip content="设置" position="right">
          <NavLink 
            to="/settings"
            className={({ isActive }) =>
              clsx(
                "p-3 rounded-xl transition-all duration-200 group relative flex items-center justify-center",
                isActive 
                  ? "bg-black text-white shadow-lg shadow-black/20"
                  : "text-gray-400 hover:bg-gray-100 hover:text-black"
              )
            }
          >
            {({ isActive }) => (
              <Settings size={22} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
            )}
          </NavLink>
        </Tooltip>
        
        <Tooltip content="用户意见收集" position="right">
          <NavLink 
            to="/feedback"
            className={({ isActive }) =>
              clsx(
                "p-3 rounded-xl transition-all duration-200 group relative flex items-center justify-center",
                isActive 
                  ? "bg-black text-white shadow-lg shadow-black/20"
                  : "text-gray-400 hover:bg-gray-100 hover:text-black"
              )
            }
          >
            {({ isActive }) => (
              <MessageSquare size={22} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
            )}
          </NavLink>
        </Tooltip>
      </div>
    </aside>
  );
}

import { 
  Sparkles, 
  Image as ImageIcon, 
  PenTool, 
  LayoutTemplate, 
  LayoutGrid, 
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  FolderOpen
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

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

export default function Sidebar({ isCollapsed, toggleCollapse }: SidebarProps) {
  return (
    <aside 
      className={clsx(
        "fixed left-0 top-0 h-screen flex flex-col py-6 bg-white border-r border-gray-100 z-50 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20 items-center" : "w-64 px-4"
      )}
    >
      {/* Header / Logo */}
      <div className={clsx("mb-6 flex items-center", isCollapsed ? "justify-center" : "px-6")}>
        <NavLink to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl transition-transform group-hover:scale-105 shrink-0">
            D
          </div>
          {!isCollapsed && (
            <span className="font-bold text-xl tracking-tight text-gray-900 whitespace-nowrap overflow-hidden">
              DeepCanvas
            </span>
          )}
        </NavLink>
      </div>
      
      {/* Navigation */}
      <nav className={clsx("flex-1 flex flex-col gap-6 overflow-y-auto w-full no-scrollbar", isCollapsed && "px-3")}>
        {menuGroups.map((group, index) => (
          <div key={group.title} className="flex flex-col gap-2">
            {!isCollapsed && (
              <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                {group.title}
              </h3>
            )}
            {group.items.map((item) => (
              <Tooltip key={item.path} content={isCollapsed ? item.label : ''} position="right">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      "p-3 rounded-xl transition-all duration-200 group relative flex items-center",
                      isCollapsed ? "justify-center w-full" : "gap-3 px-4 mx-2",
                      isActive 
                        ? (isCollapsed ? "bg-black text-white shadow-lg" : "bg-gray-100 text-black font-medium")
                        : "text-gray-500 hover:bg-gray-50 hover:text-black"
                    )
                  }
                >
                  <item.icon size={20} strokeWidth={2} className="shrink-0" />
                  {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
                </NavLink>
              </Tooltip>
            ))}
            {/* Add separator between groups if not the last one */}
            {index < menuGroups.length - 1 && isCollapsed && (
              <div className="mx-2 h-px bg-gray-100 my-2" />
            )}
          </div>
        ))}
      </nav>

      {/* Footer / Settings / Collapse Toggle */}
      <div className={clsx("mt-auto w-full flex flex-col gap-2", isCollapsed ? "px-3 pb-6" : "px-2 pb-6")}>
        <Tooltip content="设置" position="right" disabled={!isCollapsed}>
          <NavLink 
            to="/settings"
            className={({ isActive }) =>
              clsx(
                "p-3 rounded-xl transition-all duration-200 group relative flex items-center",
                isCollapsed ? "justify-center w-full" : "gap-3 px-4 mx-2",
                isActive 
                  ? (isCollapsed ? "bg-black text-white shadow-lg" : "bg-gray-100 text-black font-medium")
                  : "text-gray-400 hover:bg-gray-50 hover:text-black"
              )
            }
          >
            <Settings size={20} className="shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">设置</span>}
          </NavLink>
        </Tooltip>
        
        {/* Unified Toggle Button */}
        <Tooltip content={isCollapsed ? "展开侧边栏" : "收起侧边栏"} position="right" disabled={!isCollapsed}>
          <button 
            onClick={toggleCollapse}
            className={clsx(
              "p-3 rounded-xl transition-all duration-200 group relative flex items-center text-gray-400 hover:bg-gray-50 hover:text-black",
              isCollapsed ? "justify-center w-full" : "gap-3 px-4 mx-2"
            )}
          >
            {isCollapsed ? <PanelLeftOpen size={20} className="shrink-0" /> : <PanelLeftClose size={20} className="shrink-0" />}
            {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">收起导航</span>}
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}

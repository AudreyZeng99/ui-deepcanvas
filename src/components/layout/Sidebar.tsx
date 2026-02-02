import { 
  Home, 
  Sparkles, 
  Image as ImageIcon, 
  PenTool, 
  LayoutTemplate, 
  CreditCard, 
  Gamepad2, 
  LayoutGrid, 
  Palette, 
  Settings 
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Sparkles, label: 'Inspiration', path: '/inspiration' },
  { icon: ImageIcon, label: 'Text to Image', path: '/text-to-image' },
  { icon: PenTool, label: 'Canvas', path: '/editor' },
  { icon: LayoutTemplate, label: 'Templates', path: '/templates' },
  { icon: CreditCard, label: 'Banking', path: '/banking' },
  { icon: Gamepad2, label: 'Playground', path: '/playground' },
  { icon: LayoutGrid, label: 'Gallery', path: '/gallery' },
  { icon: Palette, label: 'Design System', path: '/design-system' },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-20 flex flex-col items-center py-6 bg-white/80 backdrop-blur-xl border-r border-black/5 z-50">
      <div className="mb-8">
        <NavLink to="/" className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xl hover:scale-105 transition-transform">
          D
        </NavLink>
      </div>
      
      <nav className="flex-1 flex flex-col gap-3 overflow-y-auto w-full px-3 no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "p-3 rounded-xl transition-all duration-200 group relative flex justify-center",
                isActive 
                  ? "bg-black text-white shadow-lg" 
                  : "text-gray-500 hover:bg-gray-100 hover:text-black"
              )
            }
          >
            <item.icon size={20} strokeWidth={2} />
            <span className="absolute left-14 bg-black text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-3 w-full">
        <NavLink 
          to="/settings"
          className={({ isActive }) =>
            clsx(
              "p-3 rounded-xl transition-all duration-200 group relative flex justify-center w-full",
              isActive 
                ? "bg-black text-white shadow-lg" 
                : "text-gray-400 hover:bg-gray-100 hover:text-black"
            )
          }
        >
          <Settings size={20} />
          <span className="absolute left-14 bg-black text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            Settings
          </span>
        </NavLink>
      </div>
    </aside>
  );
}

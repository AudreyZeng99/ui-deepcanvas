import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Image as ImageIcon, 
  PenTool, 
  LayoutTemplate, 
  Smartphone, 
  FlaskConical, 
  ArrowUpRight,
  LayoutGrid,
  Palette,
  Settings,
  Bell,
  UserCircle,
  Wand2,
  Eraser,
  Scissors,
  Layers,
  FileText,
  Presentation,
  MoreHorizontal
} from 'lucide-react';
import clsx from 'clsx';
import CreateCanvasModal from '../components/CreateCanvasModal';

import { useTheme } from '../theme/ThemeContext';
import { Tooltip } from '../components/Tooltip';

export default function Home() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [isCanvasModalOpen, setIsCanvasModalOpen] = useState(false);
  
  const isGlass = theme.id.includes('glass');
  const isOutlined = theme.id.includes('outlined');

  // Apple-style glass effect classes
  const glassCardClasses = isGlass ? "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] ring-1 ring-white/20 !bg-opacity-60 backdrop-blur-xl" : "";
  
  // Tool Icon styles based on theme
  const getToolIconClasses = () => {
    if (isOutlined) return "bg-black/5 border-black/10 hover:bg-black/10 text-black";
    if (isGlass) return "bg-white/20 border-white/30 hover:bg-white/30 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]";
    return "bg-white/10 border-white/10 hover:bg-white/20 text-white"; // Default (Lovart/Nunito Original)
  };
  
  const toolIconClass = getToolIconClasses();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <CreateCanvasModal 
        isOpen={isCanvasModalOpen} 
        onClose={() => setIsCanvasModalOpen(false)} 
      />

      <div className="w-full max-w-[1150px] h-[750px] flex flex-col gap-6">
        <header className="flex justify-between items-end flex-shrink-0">
          <div>
            <h1 className="text-5xl font-black relative inline-block mb-2">
              <span className="relative z-10">Deepcanvas, 让设计更简单</span>
              <svg className="absolute -bottom-2 right-0 w-32 h-4 z-0 text-accent-secondary" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" className="opacity-50" />
              </svg>
              <span className="absolute -top-4 -right-8 text-4xl animate-bounce">✨</span>
            </h1>
            <p className="text-gray-500">What will you create today?</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/gallery" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-theme-border hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 shadow-sm">
              <LayoutGrid size={16} />
              资产
            </Link>
            <Link to="/design-system" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-theme-border hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 shadow-sm">
              <Palette size={16} />
              Design System
            </Link>
            <Tooltip content="设置" position="bottom">
              <Link to="/settings" className="p-2 rounded-full bg-white border border-theme-border hover:bg-gray-50 transition-colors text-gray-700 shadow-sm" aria-label="Settings">
                <Settings size={20} />
              </Link>
            </Tooltip>
            <div className="h-6 w-px bg-gray-200 mx-1" />
            <Tooltip content="通知" position="bottom">
              <button className="p-2 rounded-full bg-white border border-theme-border hover:bg-gray-50 transition-colors text-gray-700 shadow-sm relative group" aria-label="Notifications">
                 <Bell size={20} />
                 <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white border-2 border-white">3</span>
              </button>
            </Tooltip>
            <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white border border-theme-border hover:bg-gray-50 transition-colors text-gray-700 shadow-sm group">
               <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center text-black">
                 <UserCircle size={18} />
               </div>
               <span className="text-sm font-medium">管理员</span>
            </button>
          </div>
        </header>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-[1000px] mx-auto w-full max-h-[600px] self-center">
          {/* Inspiration - Large Card (Normal Level) */}
          <BentoCard 
            className={clsx("col-span-1 md:col-span-2 lg:col-span-2 bg-white border border-theme-border group cursor-pointer text-black", glassCardClasses)}
            title="提示词灵感"
            description="从海量创意中获取灵感火花，试试从这里快速开始体验！"
            icon={Sparkles}
            accentColor="text-black"
            onClick={() => navigate('/inspiration')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <ArrowUpRight className="text-black" />
            </div>
          </BentoCard>

          {/* Text to Image (Normal Level) */}
          <BentoCard 
            className={clsx("col-span-1 md:col-span-1 bg-white border border-theme-border group hover:border-black/10 cursor-pointer overflow-hidden relative text-black", glassCardClasses)}
            title="文生图"
            description="智能文本转换图像生成核心——在这里，生成属于你的图片。"
            icon={ImageIcon}
            accentColor="text-black"
            onClick={() => navigate('/text-to-image')}
          >
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-black/5 rounded-full blur-3xl group-hover:bg-black/10 transition-all duration-500" />
 
             <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
               <ArrowUpRight className="text-black opacity-50" />
             </div>
          </BentoCard>

          {/* Canvas (Important Level = Primary) */}
          <BentoCard 
            className={clsx("col-span-1 md:col-span-1 bg-primary border border-primary-border text-primary-foreground group cursor-pointer !overflow-visible relative z-20", glassCardClasses)}
            title="创建设计"
            description="帮助你实现完整的营销海报设计"
            icon={PenTool}
            onClick={() => setIsCanvasModalOpen(true)}
          >
            {/* Floating Decoration - Unclipped */}
            <div className="absolute right-[-30px] top-[-30px] w-40 h-40 z-50 pointer-events-none group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
              <img src={`${import.meta.env.BASE_URL}figure/cloud-white.png`} alt="Decoration" className="w-full h-full object-contain drop-shadow-2xl opacity-90" />
            </div>

            {/* Clipped Background Effects */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute right-4 bottom-4 bg-white/20 p-2 rounded-full backdrop-blur-sm">
                 <ArrowUpRight size={16} />
              </div>
            </div>
          </BentoCard>

          {/* Templates (Important Level = Primary) */}
          <BentoCard 
            className={clsx("col-span-1 md:col-span-1 bg-primary border border-primary-border text-primary-foreground group cursor-pointer !overflow-visible relative z-10", glassCardClasses)}
            title="模版"
            description="快速应用专业设计模版"
            icon={LayoutTemplate}
            onClick={() => navigate('/templates')}
          >
             {/* Floating Decoration - Unclipped - Vertically Centered */}
             <div className="absolute right-[-30px] top-1/2 -translate-y-1/2 w-40 h-40 z-50 pointer-events-none">
                <div className="w-full h-full group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500">
                   <img src={`${import.meta.env.BASE_URL}figure/blue-cloud-v2.png`} alt="Decoration" className="w-full h-full object-contain drop-shadow-2xl opacity-90" />
                </div>
             </div>

             {/* Clipped Background Effects */}
             <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />
                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <ArrowUpRight className="text-current opacity-50" />
                </div>
             </div>
          </BentoCard>

          {/* Banking (Minor Level) */}
          <BentoCard 
            className="col-span-1 md:col-span-1 bg-minor border border-minor-border text-minor-foreground group"
            title="流量投放素材设计"
            description="金融业务场景专属模版库"
            icon={Smartphone}
          >
            <div className="mt-4">
               <div className="text-3xl font-bold">4</div>
               <div className="text-xs opacity-70 mt-1">目前支持规范模版数量</div>
            </div>
          </BentoCard>

          {/* Playground (Promotion Level) */}
          <BentoCard 
            className={clsx("col-span-1 md:col-span-2 bg-promotion border border-promotion-border text-promotion-foreground group cursor-pointer", glassCardClasses)}
            title="玩转AI"
            description="前沿AI模型与实验工具集"
            icon={FlaskConical}
            accentColor="text-current"
            onClick={() => navigate('/playground')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <ArrowUpRight className="text-current" />
            </div>
            
            {/* Tool Grid */}
            <div className="grid grid-cols-4 gap-3 mt-4 relative z-10">
              <ToolIcon icon={Wand2} label="AI 改图" className={toolIconClass} />
              <ToolIcon icon={Eraser} label="AI 擦除" className={toolIconClass} />
              <ToolIcon icon={Scissors} label="AI 抠图" className={toolIconClass} />
              <ToolIcon icon={Layers} label="AI 溶图" className={toolIconClass} />
              <ToolIcon icon={FileText} label="md2Card" className={toolIconClass} />
              <ToolIcon icon={Presentation} label="PPT 生成" className={toolIconClass} />
              <div className={clsx("flex flex-col items-center justify-center gap-2 p-3 rounded-2xl backdrop-blur-sm border transition-all duration-300", toolIconClass)}>
                 <MoreHorizontal size={24} />
                 <span className="text-xs font-medium opacity-90">更多</span>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}

function ToolIcon({ icon: Icon, label, className }: { icon: React.ElementType, label: string, className?: string }) {
  return (
    <div className={clsx("flex flex-col items-center justify-center gap-2 p-3 rounded-2xl backdrop-blur-sm border hover:scale-105 transition-all duration-300 cursor-pointer group/icon", className)}>
      <Icon size={24} className="group-hover/icon:scale-110 transition-transform duration-300" />
      <span className="text-xs font-medium opacity-90 whitespace-nowrap">{label}</span>
    </div>
  );
}

interface BentoCardProps {
  className?: string;
  title: string;
  description: string;
  icon: React.ElementType;
  children?: React.ReactNode;
  accentColor?: string;
  onClick?: () => void;
}

function BentoCard({ className, title, description, icon: Icon, children, accentColor, onClick }: BentoCardProps) {
  return (
    <div 
      onClick={onClick}
      className={clsx("relative rounded-3xl p-6 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 backdrop-blur-xl", className)}
    >
      <div className="relative z-10 flex justify-between items-start">
        <div className={clsx("p-3 rounded-2xl bg-white/10 backdrop-blur-md w-fit", accentColor)}>
          <Icon size={24} />
        </div>
      </div>
      
      {children}

      <div className="relative z-10 mt-auto pt-8">
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        <p className="text-sm opacity-70 font-medium">{description}</p>
      </div>
    </div>
  );
}

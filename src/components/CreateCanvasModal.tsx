import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Layout, Smartphone, Monitor, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface CreateCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'selection' | 'warning';
type Tab = 'common' | 'ads' | 'events';

const PRESETS = {
  common: [
    { label: 'Desktop', width: 1920, height: 1080, icon: Monitor },
    { label: 'Mobile', width: 1080, height: 1920, icon: Smartphone },
    { label: 'Square', width: 1080, height: 1080, icon: Layout },
  ],
  ads: [
    { label: 'Feed Image', width: 1200, height: 628, icon: Layout },
    { label: 'Carousel', width: 600, height: 600, icon: Layout },
    { label: 'Story Ad', width: 1080, height: 1920, icon: Smartphone },
  ],
  events: [
    { label: 'Poster', width: 1200, height: 1600, icon: Layout },
    { label: 'Web Banner', width: 2000, height: 600, icon: Monitor },
    { label: 'Event Card', width: 800, height: 600, icon: Layout },
  ],
};

export default function CreateCanvasModal({ isOpen, onClose }: CreateCanvasModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('selection');
  const [activeTab, setActiveTab] = useState<Tab>('common');
  const [selectedSize, setSelectedSize] = useState<{ width: number; height: number } | null>(null);
  const [customSize, setCustomSize] = useState({ width: '', height: '' });

  if (!isOpen) return null;

  const handleSelectionCreate = () => {
    setStep('warning');
  };

  const handleWarningConfirm = () => {
    // In a real app, you might pass these dimensions to a global state or context
    // For now, we just navigate to the editor
    
    // Reset state for next time
    setTimeout(() => {
      setStep('selection');
      setSelectedSize(null);
      setCustomSize({ width: '', height: '' });
    }, 500);
    
    onClose();
    navigate('/editor');
  };

  const handleClose = () => {
    // Reset state when closing
    setTimeout(() => {
      setStep('selection');
      setSelectedSize(null);
      setCustomSize({ width: '', height: '' });
    }, 500);
    onClose();
  };

  const handleCustomSizeChange = (e: React.ChangeEvent<HTMLInputElement>, dimension: 'width' | 'height') => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setCustomSize(prev => ({ ...prev, [dimension]: value }));
      setSelectedSize(null); // Deselect preset if typing custom
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={handleClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        {step === 'warning' ? (
          <div className="p-12 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500 mb-2">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold">Create New Canvas?</h2>
            <p className="text-gray-500 max-w-sm">
              新建画布将清空当前画布内容，此操作无法撤销。是否确认继续？
            </p>
            <div className="flex gap-4 mt-4">
              <button 
                onClick={handleClose}
                className="btn-secondary min-w-[120px]"
              >
                取消
              </button>
              <button 
                onClick={handleWarningConfirm}
                className="btn-primary min-w-[120px]"
              >
                确认
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-[600px]">
            <div className="p-8 border-b border-black/5">
              <h2 className="text-2xl font-bold mb-6">新建画布</h2>
              
              {/* Tabs */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
                {(['common', 'ads', 'events'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={clsx(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      activeTab === tab 
                        ? "bg-white text-black shadow-sm" 
                        : "text-gray-500 hover:text-black"
                    )}
                  >
                    {tab === 'common' && '常用尺寸'}
                    {tab === 'ads' && '流量投放尺寸'}
                    {tab === 'events' && '中心活动宣传尺寸'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {/* Preset Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {PRESETS[activeTab].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedSize({ width: preset.width, height: preset.height });
                      setCustomSize({ width: '', height: '' });
                    }}
                    className={clsx(
                      "flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3 hover:bg-gray-50",
                      selectedSize?.width === preset.width && selectedSize?.height === preset.height
                        ? "border-accent-blue bg-blue-50/50" 
                        : "border-gray-100"
                    )}
                  >
                    <preset.icon className={clsx(
                      selectedSize?.width === preset.width && selectedSize?.height === preset.height
                        ? "text-accent-blue" 
                        : "text-gray-400"
                    )} size={24} />
                    <div className="text-center">
                      <div className="font-medium text-sm">{preset.label}</div>
                      <div className="text-xs text-gray-400 mt-1">{preset.width} x {preset.height}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Size */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-4">自定义尺寸</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="宽度"
                      value={customSize.width}
                      onChange={(e) => handleCustomSizeChange(e, 'width')}
                      className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">px</span>
                  </div>
                  <span className="text-gray-300">×</span>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="高度"
                      value={customSize.height}
                      onChange={(e) => handleCustomSizeChange(e, 'height')}
                      className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">px</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-black/5 flex justify-end gap-4 bg-white">
              <button onClick={handleClose} className="btn-secondary">
                取消
              </button>
              <button 
                onClick={handleSelectionCreate}
                disabled={!selectedSize && (!customSize.width || !customSize.height)}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

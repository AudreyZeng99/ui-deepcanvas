import { useState } from 'react';
import { X, Download, Pipette, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewImage: string; // URL of the image to export
  onExport: (settings: ExportSettings) => void;
}

export interface ExportSettings {
  watermarkText: string;
  watermarkColor: string;
  watermarkOpacity: number;
  position: 'tl' | 'tr' | 'bl' | 'br' | 'custom';
  customX: number;
  customY: number;
  format: 'jpg' | 'png' | 'gif';
  quality: number;
}

export default function ExportModal({ isOpen, onClose, previewImage, onExport }: ExportModalProps) {
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkColor, setWatermarkColor] = useState('#ffffff');
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const [position, setPosition] = useState<'tl' | 'tr' | 'bl' | 'br' | 'custom'>('br');
  const [customX, setCustomX] = useState(20);
  const [customY, setCustomY] = useState(20);
  const [format, setFormat] = useState<'jpg' | 'png' | 'gif'>('jpg');
  const [quality, setQuality] = useState(100);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onExport({
      watermarkText,
      watermarkColor,
      watermarkOpacity,
      position,
      customX,
      customY,
      format,
      quality
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Download className="text-accent-primary" size={20} />
            导出设置
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left: Preview */}
          <div className="flex-1 bg-[#F5F5F7] p-8 flex items-center justify-center relative overflow-hidden">
            <div className="relative shadow-lg max-w-full max-h-full w-fit mx-auto">
              <img 
                src={previewImage} 
                alt="Export Preview" 
                className="max-w-full max-h-[60vh] object-contain rounded-lg block"
              />
              
              {/* Watermark Overlay */}
              {watermarkText && (
                <div 
                  className="absolute pointer-events-none whitespace-nowrap font-medium"
                  style={{
                    color: watermarkColor,
                    opacity: watermarkOpacity / 100,
                    top: position === 'tl' ? '20px' : position === 'tr' ? '20px' : position === 'custom' ? `${customY}px` : 'auto',
                    bottom: position === 'bl' ? '20px' : position === 'br' ? '20px' : 'auto',
                    left: position === 'tl' ? '20px' : position === 'bl' ? '20px' : position === 'custom' ? `${customX}px` : 'auto',
                    right: position === 'tr' ? '20px' : position === 'br' ? '20px' : 'auto',
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    fontSize: '24px' // Simplified scaling for now
                  }}
                >
                  {watermarkText}
                </div>
              )}
            </div>
          </div>

          {/* Right: Controls */}
          <div className="w-full md:w-[360px] bg-white border-l border-gray-100 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Watermark Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">水印设置</h3>
                
                {/* Content */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">水印内容</label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="输入水印文字..."
                    className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:bg-white focus:border-accent-primary focus:outline-none text-sm transition-all"
                  />
                </div>

                {/* Color & Opacity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500">文字颜色</label>
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-full rounded-lg bg-gray-50 border border-gray-200 flex items-center px-2 gap-2">
                        <input
                          type="color"
                          value={watermarkColor}
                          onChange={(e) => setWatermarkColor(e.target.value)}
                          className="w-6 h-6 rounded cursor-pointer border-none bg-transparent p-0"
                        />
                        <span className="text-xs text-gray-500 font-mono uppercase flex-1">{watermarkColor}</span>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="吸取颜色">
                        <Pipette size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500">透明度 {watermarkOpacity}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={watermarkOpacity}
                      onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-primary"
                    />
                  </div>
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">位置</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 rounded-lg border border-gray-200">
                      {['tl', 'tr', 'bl', 'br'].map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setPosition(pos as any)}
                          className={clsx(
                            "h-8 rounded-md transition-all flex items-center justify-center",
                            position === pos 
                              ? "bg-accent-primary text-white shadow-sm" 
                              : "hover:bg-gray-200 text-gray-400"
                          )}
                        >
                          <div className={clsx(
                            "w-2 h-2 rounded-full",
                            position === pos ? "bg-white" : "bg-current"
                          )} />
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setPosition('custom')}
                      className={clsx(
                        "px-3 py-2 rounded-lg text-xs font-medium transition-all border",
                        position === 'custom'
                          ? "bg-accent-primary text-white border-accent-primary"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      自定义位置
                    </button>
                  </div>
                </div>

                {/* Custom Position Inputs */}
                {position === 'custom' && (
                  <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400">X 坐标 (0-1000)</label>
                      <input
                        type="number"
                        value={customX}
                        onChange={(e) => setCustomX(Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-accent-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400">Y 坐标 (0-1000)</label>
                      <input
                        type="number"
                        value={customY}
                        onChange={(e) => setCustomY(Number(e.target.value))}
                        className="w-full px-2 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-accent-primary"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="h-px bg-gray-100" />

              {/* Export Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">导出选项</h3>
                
                {/* Format */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">导出格式</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['jpg', 'png', 'gif'].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setFormat(fmt as any)}
                        className={clsx(
                          "py-2 rounded-lg text-sm font-medium transition-all uppercase border",
                          format === fmt
                            ? "bg-accent-primary text-white border-accent-primary"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        )}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className={clsx("text-xs font-medium", format === 'png' ? "text-gray-300" : "text-gray-500")}>
                      导出质量
                    </label>
                    <span className={clsx("text-xs font-mono", format === 'png' ? "text-gray-300" : "text-gray-500")}>
                      {quality}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    disabled={format === 'png'}
                    className={clsx(
                      "w-full h-1.5 rounded-lg appearance-none",
                      format === 'png' 
                        ? "bg-gray-100 cursor-not-allowed [&::-webkit-slider-thumb]:hidden" 
                        : "bg-gray-200 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-primary"
                    )}
                  />
                  {format === 'png' && (
                    <div className="flex items-start gap-1.5 text-xs text-amber-500 bg-amber-50 p-2 rounded-lg">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      PNG格式为无损格式，导出质量设置对PNG无效
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-xl bg-accent-primary text-white font-medium hover:bg-accent-primary/90 transition-colors shadow-lg shadow-accent-primary/25"
              >
                确认导出
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

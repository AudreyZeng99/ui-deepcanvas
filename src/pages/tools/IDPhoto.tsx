import React, { useState } from 'react';
import ToolLayout from './ToolLayout';
import { Upload, Download, RefreshCw, Wand2, Image as ImageIcon, ScanFace, Check, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import ExportModal, { ExportSettings } from '../../components/ExportModal';

export default function IDPhoto() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [bgColor, setBgColor] = useState<string>('#438edb'); // Default blue
  const [size, setSize] = useState<string>('1inch');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setGeneratedImage(null); // Reset generated image when new file is uploaded
    }
  };

  const handleGenerate = () => {
    if (!previewUrl) return;
    
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setGeneratedImage(previewUrl); // In reality, this would be the result from API
      setIsProcessing(false);
    }, 2000);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setGeneratedImage(null);
  };

  const handleExport = (settings: ExportSettings) => {
    console.log('Exporting with settings:', settings);
    setIsExportModalOpen(false);
    alert('导出成功！');
  };

  return (
    <ToolLayout title="证件照生成">
      <ExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        previewImage={generatedImage || ''}
        onExport={handleExport}
      />

      <div className="space-y-8">
        {/* Feature Illustration */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">智能证件照生成</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              上传一张照片，AI自动识别并抠图，一键生成标准证件照。支持自定义背景颜色、尺寸裁剪，满足各类证件照需求。
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur px-3 py-1.5 rounded-lg text-sm text-gray-600">
                <Check size={16} className="text-green-500" />
                <span>智能抠图</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur px-3 py-1.5 rounded-lg text-sm text-gray-600">
                <Check size={16} className="text-green-500" />
                <span>一键换底</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur px-3 py-1.5 rounded-lg text-sm text-gray-600">
                <Check size={16} className="text-green-500" />
                <span>高清导出</span>
              </div>
            </div>
          </div>
          
          {/* Decorative Visual */}
          <div className="hidden md:flex items-center gap-4 relative z-10 opacity-90">
            <div className="w-32 h-40 bg-white rounded-lg shadow-lg rotate-[-6deg] overflow-hidden border-4 border-white">
               <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                 <ImageIcon className="text-gray-300" size={48} />
               </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center text-blue-500 z-20">
              <Wand2 size={24} />
            </div>
            <div className="w-32 h-40 bg-blue-500 rounded-lg shadow-lg rotate-[6deg] overflow-hidden border-4 border-white">
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white/20 rounded-full mb-2" />
                <div className="w-20 h-8 bg-white/20 rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        </div>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Upload / Preview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 min-h-[500px] flex flex-col">
              {!previewUrl ? (
                // Upload State
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors relative cursor-pointer group">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Upload size={32} className="text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">点击或拖拽上传图片</h3>
                  <p className="text-gray-500 text-sm max-w-xs text-center">
                    支持 JPG, PNG 格式，建议上传正面、光线均匀的照片
                  </p>
                </div>
              ) : (
                // Preview State
                <div className="flex-1 flex gap-4 h-full">
                  {/* Original */}
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="text-sm font-medium text-gray-500 text-center">原图</div>
                    <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden relative flex items-center justify-center">
                      <img src={previewUrl} alt="Original" className="max-w-full max-h-full object-contain" />
                    </div>
                  </div>
                  
                  {/* Generated Result */}
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="text-sm font-medium text-gray-500 text-center">生成结果</div>
                    <div className="flex-1 bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden relative flex items-center justify-center">
                      {isProcessing ? (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-gray-500 font-medium">正在生成中...</span>
                        </div>
                      ) : generatedImage ? (
                        <div className="relative w-full h-full flex items-center justify-center" style={{ backgroundColor: bgColor }}>
                          {/* In a real app, the background removal would happen and we'd overlay the person on this color */}
                          <img src={generatedImage} alt="Generated" className="max-w-full max-h-full object-contain relative z-10 mix-blend-multiply" /> 
                          {/* Note: mix-blend-multiply is just a hack for this demo to show bg color behind white bg image */}
                        </div>
                      ) : (
                        <div className="text-gray-400 text-sm flex flex-col items-center gap-2">
                          <ScanFace size={32} className="opacity-50" />
                          等待生成...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Controls */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-6">
              <h3 className="text-lg font-bold mb-6">设置</h3>
              
              <div className="space-y-6">
                {/* Size Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">尺寸规格</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['1inch', '2inch', 'small2', 'us_visa'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={clsx(
                          "px-3 py-2.5 rounded-xl text-sm font-medium border transition-all text-left",
                          size === s
                            ? "bg-blue-50 border-blue-200 text-blue-700"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        {s === '1inch' && '一寸 (25x35mm)'}
                        {s === '2inch' && '二寸 (35x49mm)'}
                        {s === 'small2' && '小二寸 (35x45mm)'}
                        {s === 'us_visa' && '美国签证 (51x51mm)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Color */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">背景颜色</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { c: '#438edb', n: '蓝底' },
                      { c: '#ffffff', n: '白底' },
                      { c: '#d9001b', n: '红底' },
                      { c: '#cccccc', n: '灰底' }
                    ].map((bg) => (
                      <button
                        key={bg.c}
                        onClick={() => setBgColor(bg.c)}
                        className={clsx(
                          "w-10 h-10 rounded-full border-2 transition-all relative group",
                          bgColor === bg.c ? "border-black scale-110" : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: bg.c }}
                        title={bg.n}
                      >
                        {bgColor === bg.c && (
                          <Check size={16} className={clsx("absolute inset-0 m-auto", bg.c === '#ffffff' ? 'text-black' : 'text-white')} />
                        )}
                      </button>
                    ))}
                    
                    <button className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
                      <span className="text-xs">+</span>
                    </button>
                  </div>
                </div>

                <div className="h-px bg-gray-100 my-4" />

                {/* Actions */}
                <div className="space-y-3">
                  {!generatedImage ? (
                    <button
                      onClick={handleGenerate}
                      disabled={!previewUrl || isProcessing}
                      className="w-full py-3.5 rounded-xl bg-black text-white font-bold text-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-black/20"
                    >
                      {isProcessing ? (
                        <>正在处理...</>
                      ) : (
                        <>
                          <Wand2 size={20} />
                          开始生成
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setIsExportModalOpen(true)}
                        className="col-span-2 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                      >
                        <Download size={20} />
                        导出结果
                      </button>
                      
                      <button
                        onClick={handleGenerate} // Re-generate (simulate retry)
                        className="py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={18} />
                        重新生成
                      </button>
                      
                      <button
                        onClick={handleReset}
                        className="py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={18} />
                        重置/上传
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

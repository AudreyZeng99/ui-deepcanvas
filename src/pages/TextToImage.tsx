import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Image as ImageIcon, 
  Download, 
  Scissors, 
  Edit3, 
  RefreshCw,
  Sparkles,
  Lightbulb,
  Zap,
  Maximize2,
  CheckCircle2,
  Scaling,
  Palette,
  Sliders,
  X
} from 'lucide-react';
import clsx from 'clsx';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../components/ToastProvider';

const STYLES = [
  { id: 'none', label: '无风格' },
  { id: 'cinematic', label: '电影质感' },
  { id: 'photorealistic', label: '真实摄影' },
  { id: 'anime', label: '动漫风格' },
  { id: 'digital-art', label: '数字艺术' },
  { id: 'oil-painting', label: '油画' },
  { id: 'cyberpunk', label: '赛博朋克' },
  { id: 'studio-photo', label: '影棚摄影' },
];

import { Tooltip } from '../components/Tooltip';
import ExportModal from '../components/ExportModal';

export default function TextToImage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { createProject, currentProject, projects, isDirty, saveCurrentProjectAsNew } = useProject();
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [usePromptOptimizer, setUsePromptOptimizer] = useState(true);
  const [lastOptimizedOriginalPrompt, setLastOptimizedOriginalPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isStartEditModalOpen, setIsStartEditModalOpen] = useState(false);
  const [pendingStartEdit, setPendingStartEdit] = useState<null | { width: number; height: number; prompt: string; imageUrl: string }>(null);
  
  // Settings
  const [activeSetting, setActiveSetting] = useState<'dimensions' | 'style' | 'advanced' | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1024, height: 1024 });
  const [selectedStyle, setSelectedStyle] = useState('none');
  const [modelParams, setModelParams] = useState({
    steps: 30,
    cfgScale: 7.0,
    seed: -1
  });

  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.state?.prompt) {
      setOriginalPrompt(location.state.prompt);
      setOptimizedPrompt('');
      setLastOptimizedOriginalPrompt('');
    }
  }, [location.state]);

  // Close popovers when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setActiveSetting(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const optimizePrompt = (prompt: string) => {
    const enhancements = "，细节丰富，8k分辨率，电影级光效，真实感，艺术站热门，杰作，清晰聚焦";
    return (prompt || "绝美场景") + enhancements;
  };

  const originalPromptNormalized = originalPrompt.trim();
  const isOptimizedValid = Boolean(optimizedPrompt.trim()) && originalPromptNormalized === lastOptimizedOriginalPrompt;
  const promptDisplaySource = usePromptOptimizer ? (isOptimizedValid ? 'optimized' : 'original') : 'original';
  const promptDisplayValue = promptDisplaySource === 'optimized' ? optimizedPrompt : originalPrompt;

  return (
    <div className="h-screen p-6 flex gap-6 overflow-hidden bg-background">
      {/* Left Column: Image Preview + Settings Toolbar */}
      <div className="flex-1 bg-white/50 backdrop-blur-xl border border-black/5 rounded-3xl p-6 flex flex-col relative group transition-all duration-300">
        
        {/* Top Toolbar with Settings */}
        <div className="flex items-center justify-between mb-6 z-20 relative" ref={settingsRef}>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold flex items-center gap-2 mr-4">
              <ImageIcon className="text-accent-primary" />
              生成预览
            </h2>
            
            {/* Dimensions Button */}
            <div className="relative">
              <Tooltip content="调整尺寸" position="bottom">
                <button 
                  onClick={() => setActiveSetting(activeSetting === 'dimensions' ? null : 'dimensions')}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border",
                    activeSetting === 'dimensions' 
                      ? "bg-accent-primary text-white border-accent-primary shadow-lg" 
                      : "bg-white text-gray-700 border-black/5 hover:bg-gray-50 hover:border-black/10"
                  )}
                >
                  <Scaling size={16} />
                  {dimensions.width} x {dimensions.height}
                </button>
              </Tooltip>
              
              {activeSetting === 'dimensions' && (
                <div className="absolute top-full left-0 mt-2 w-[480px] bg-white rounded-2xl shadow-xl border border-black/5 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-left z-50">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">常用尺寸</label>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <button onClick={() => setDimensions({ width: 1920, height: 1080 })} className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg border border-transparent hover:border-accent-primary transition-all text-center">
                      <div className="font-medium mb-1">桌面端</div>
                      <div className="text-[10px] text-gray-400">1920x1080</div>
                    </button>
                    <button onClick={() => setDimensions({ width: 1080, height: 1920 })} className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg border border-transparent hover:border-accent-primary transition-all text-center">
                      <div className="font-medium mb-1">移动端</div>
                      <div className="text-[10px] text-gray-400">1080x1920</div>
                    </button>
                    <button onClick={() => setDimensions({ width: 1080, height: 1080 })} className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg border border-transparent hover:border-accent-primary transition-all text-center">
                      <div className="font-medium mb-1">方形</div>
                      <div className="text-[10px] text-gray-400">1080x1080</div>
                    </button>
                  </div>

                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">流量投放尺寸</label>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <button onClick={() => setDimensions({ width: 1200, height: 628 })} className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg border border-transparent hover:border-accent-primary transition-all text-center">
                      <div className="font-medium mb-1">信息流图</div>
                      <div className="text-[10px] text-gray-400">1200x628</div>
                    </button>
                    <button onClick={() => setDimensions({ width: 600, height: 600 })} className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg border border-transparent hover:border-accent-primary transition-all text-center">
                      <div className="font-medium mb-1">轮播图</div>
                      <div className="text-[10px] text-gray-400">600x600</div>
                    </button>
                    <button onClick={() => setDimensions({ width: 1080, height: 1920 })} className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg border border-transparent hover:border-accent-primary transition-all text-center">
                      <div className="font-medium mb-1">全屏广告</div>
                      <div className="text-[10px] text-gray-400">1080x1920</div>
                    </button>
                  </div>

                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">中心活动宣传尺寸</label>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <button onClick={() => setDimensions({ width: 1200, height: 1600 })} className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg border border-transparent hover:border-accent-primary transition-all text-center">
                      <div className="font-medium mb-1">海报</div>
                      <div className="text-[10px] text-gray-400">1200x1600</div>
                    </button>
                    <button onClick={() => setDimensions({ width: 2000, height: 600 })} className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg border border-transparent hover:border-accent-primary transition-all text-center">
                      <div className="font-medium mb-1">网页横幅</div>
                      <div className="text-[10px] text-gray-400">2000x600</div>
                    </button>
                    <button onClick={() => setDimensions({ width: 800, height: 600 })} className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg border border-transparent hover:border-accent-primary transition-all text-center">
                      <div className="font-medium mb-1">活动卡片</div>
                      <div className="text-[10px] text-gray-400">800x600</div>
                    </button>
                  </div>

                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">自定义尺寸 (px)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={dimensions.width}
                      onChange={(e) => setDimensions(prev => ({ ...prev, width: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-transparent focus:bg-white focus:border-accent-primary focus:outline-none text-sm"
                      placeholder="宽"
                    />
                    <span className="text-gray-400">×</span>
                    <input
                      type="number"
                      value={dimensions.height}
                      onChange={(e) => setDimensions(prev => ({ ...prev, height: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-transparent focus:bg-white focus:border-accent-primary focus:outline-none text-sm"
                      placeholder="高"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Style Button */}
            <div className="relative">
              <Tooltip content="风格选择" position="bottom">
                <button 
                  onClick={() => setActiveSetting(activeSetting === 'style' ? null : 'style')}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border",
                    activeSetting === 'style' 
                      ? "bg-accent-primary text-white border-accent-primary shadow-lg" 
                      : "bg-white text-gray-700 border-black/5 hover:bg-gray-50 hover:border-black/10"
                  )}
                >
                  <Palette size={16} />
                  {STYLES.find(s => s.id === selectedStyle)?.label || '风格'}
                </button>
              </Tooltip>

              {activeSetting === 'style' && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-black/5 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-left max-h-[300px] overflow-y-auto custom-scrollbar z-50">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">选择风格</label>
                  <div className="grid grid-cols-2 gap-2">
                    {STYLES.map(style => (
                      <button
                        key={style.id}
                        onClick={() => {
                          setSelectedStyle(style.id);
                          setActiveSetting(null);
                        }}
                        className={clsx(
                          "px-3 py-2 rounded-lg text-sm font-medium text-left transition-all",
                          selectedStyle === style.id 
                            ? "bg-accent-primary text-white" 
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        )}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Button */}
            <div className="relative">
              <button 
                onClick={() => setActiveSetting(activeSetting === 'advanced' ? null : 'advanced')}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border",
                  activeSetting === 'advanced' 
                    ? "bg-accent-primary text-white border-accent-primary shadow-lg" 
                    : "bg-white text-gray-700 border-black/5 hover:bg-gray-50 hover:border-black/10"
                )}
              >
                <Sliders size={16} />
                高级设置
              </button>

              {activeSetting === 'advanced' && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-black/5 p-5 animate-in fade-in zoom-in-95 duration-200 origin-top-left z-50">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">生成步数 (Steps)</label>
                        <span className="text-xs font-mono">{modelParams.steps}</span>
                      </div>
                      <input 
                        type="range" min="10" max="150" value={modelParams.steps}
                        onChange={(e) => setModelParams(prev => ({ ...prev, steps: Number(e.target.value) }))}
                        className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-primary"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">引导系数 (CFG)</label>
                        <span className="text-xs font-mono">{modelParams.cfgScale}</span>
                      </div>
                      <input 
                        type="range" min="1" max="20" step="0.5" value={modelParams.cfgScale}
                        onChange={(e) => setModelParams(prev => ({ ...prev, cfgScale: Number(e.target.value) }))}
                        className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-primary"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">随机种子 (Seed)</label>
                      <div className="flex gap-2">
                        <input 
                          type="number"
                          value={modelParams.seed}
                          onChange={(e) => setModelParams(prev => ({ ...prev, seed: Number(e.target.value) }))}
                          className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-transparent focus:bg-white focus:border-accent-primary focus:outline-none text-xs font-mono"
                          placeholder="-1 为随机"
                        />
                        <button 
                          onClick={() => setModelParams(prev => ({ ...prev, seed: -1 }))}
                          className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-600"
                          title="随机"
                        >
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center bg-[#F5F5F7] rounded-2xl border border-black/5 relative overflow-hidden p-4">
          {/* Placeholder or Generated Image */}
          {generatedImages.length > 0 ? (
            <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full h-full">
              {generatedImages.map((img, index) => (
                <div 
                  key={index} 
                  className={clsx(
                    "relative rounded-xl overflow-hidden cursor-pointer transition-all border-2",
                    selectedImageIndex === index ? "border-accent-primary shadow-lg scale-[1.02]" : "border-transparent hover:border-black/10"
                  )}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img src={img} alt={`Generated ${index + 1}`} className="w-full h-full object-cover" />
                  {selectedImageIndex === index && (
                    <div className="absolute top-2 right-2 bg-accent-primary text-white rounded-full p-1 shadow-sm">
                      <CheckCircle2 size={16} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center opacity-30">
              <Sparkles size={64} className="mx-auto mb-4" />
              <p className="text-lg font-medium">准备开始想象</p>
              <p className="text-sm mt-2">{dimensions.width} x {dimensions.height}px</p>
            </div>
          )}
          
          {selectedImageIndex !== null && generatedImages.length > 0 && (
            <div className="absolute bottom-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <button className="p-3 bg-white shadow-lg rounded-xl hover:bg-gray-50 transition-colors pointer-events-auto" title="查看大图">
                <Maximize2 size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="mt-6 flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={() => {
                if (selectedImageIndex === null) return;
                const selectedPrompt = usePromptOptimizer && optimizedPrompt.trim()
                  ? optimizedPrompt.trim()
                  : originalPrompt.trim();
                const imageUrl = generatedImages[selectedImageIndex];
                const width = dimensions.width;
                const height = dimensions.height;
                const existsInPersonalSpace = currentProject ? projects.some(p => p.id === currentProject.id) : false;
                if (currentProject && (isDirty || !existsInPersonalSpace)) {
                  setPendingStartEdit({ width, height, prompt: selectedPrompt, imageUrl });
                  setIsStartEditModalOpen(true);
                  return;
                }
                createProject(width, height, 'AI 文生图项目', {
                  sourceType: 'text-to-image',
                  aiResizeBinding: {
                    defaultPrompt: selectedPrompt,
                    originalPrompt: originalPrompt.trim(),
                    optimizedPrompt: optimizedPrompt.trim(),
                    generatedImage: imageUrl,
                    sourceWidth: width,
                    sourceHeight: height
                  }
                });
                navigate('/editor');
              }}
              className={clsx(
                "btn-secondary py-2.5 px-5 flex items-center gap-2 text-sm",
                selectedImageIndex === null && "opacity-50 cursor-not-allowed"
              )}
            >
              <Edit3 size={16} />
              去编辑
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              className={clsx(
                "btn-secondary py-2.5 px-5 flex items-center gap-2 text-sm",
                selectedImageIndex === null && "opacity-50 cursor-not-allowed"
              )}
            >
              <Scissors size={16} />
              一键抠图
            </button>
            <button 
              onClick={() => {
                if (selectedImageIndex === null) {
                  return;
                }
                setIsExportModalOpen(true);
              }}
              className={clsx(
                "btn-primary py-2.5 px-5 flex items-center gap-2 text-sm",
                selectedImageIndex === null && "opacity-50 cursor-not-allowed"
              )}
            >
              <Download size={16} />
              导出
            </button>
          </div>
        </div>
      </div>
      
      {isStartEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsStartEditModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-black/10 overflow-hidden">
            <div className="p-6 border-b border-black/5 flex items-start justify-between">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-medium">未保存提示</div>
                <div className="text-lg font-semibold text-gray-900">当前画布有未保存修改</div>
              </div>
              <button onClick={() => setIsStartEditModalOpen(false)} className="p-2 rounded-xl hover:bg-black/5 text-gray-500 transition-colors" title="关闭">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="text-sm text-gray-600 leading-relaxed">
                继续开始编辑将新建项目并离开当前画布。你可以先把当前画布保存为一份个人设计（备份），再继续。
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    if (!pendingStartEdit) return;
                    const status = saveCurrentProjectAsNew();
                    if (status === 'limit_reached') {
                      toast.show('已达到个人文件数量上限 (5个)，无法先保存当前画布。');
                      return;
                    }
                    toast.show('已保存到个人设计');
                    setIsStartEditModalOpen(false);
                    const { width, height, prompt, imageUrl } = pendingStartEdit;
                    createProject(width, height, 'AI 文生图项目', {
                      sourceType: 'text-to-image',
                      aiResizeBinding: {
                        defaultPrompt: prompt,
                        originalPrompt: originalPrompt.trim(),
                        optimizedPrompt: optimizedPrompt.trim(),
                        generatedImage: imageUrl,
                        sourceWidth: width,
                        sourceHeight: height
                      }
                    });
                    navigate('/editor');
                  }}
                  className="btn-breeze-orange flex-1 justify-center px-4 py-3 rounded-2xl"
                >
                  保存到个人设计并继续
                </button>
                <button
                  onClick={() => {
                    if (!pendingStartEdit) return;
                    setIsStartEditModalOpen(false);
                    const { width, height, prompt, imageUrl } = pendingStartEdit;
                    createProject(width, height, 'AI 文生图项目', {
                      sourceType: 'text-to-image',
                      aiResizeBinding: {
                        defaultPrompt: prompt,
                        originalPrompt: originalPrompt.trim(),
                        optimizedPrompt: optimizedPrompt.trim(),
                        generatedImage: imageUrl,
                        sourceWidth: width,
                        sourceHeight: height
                      }
                    });
                    navigate('/editor');
                  }}
                  className="btn-secondary flex-1 justify-center px-4 py-3 rounded-2xl"
                >
                  直接覆盖
                </button>
              </div>
              <button
                onClick={() => setIsStartEditModalOpen(false)}
                className="btn-flat-neutral w-full justify-center px-4 py-3 rounded-2xl"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Right Column: Controls */}
      <div className="w-[560px] flex flex-col gap-4 h-full">
        <div className="bg-white/60 backdrop-blur-xl border border-black/5 rounded-3xl p-5 flex flex-col gap-4 flex-1 h-full shadow-xl shadow-black/5">
          <div className="flex-1 rounded-2xl border border-black/5 bg-white/70 p-4 relative">
            <textarea
              value={promptDisplayValue}
              onChange={(e) => {
                const next = e.target.value;
                if (usePromptOptimizer && promptDisplaySource === 'optimized') {
                  setOptimizedPrompt(next);
                  return;
                }
                setOriginalPrompt(next);
              }}
              placeholder="描述你想要看到的画面..."
              maxLength={1500}
              className="w-full h-full bg-transparent border-none p-0 resize-none focus:outline-none text-sm leading-relaxed placeholder:text-gray-400"
            />
            <div className="absolute bottom-3 right-4 text-xs text-gray-400">
              {promptDisplayValue.length}/1500
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-xs font-semibold text-gray-500 w-[176px] whitespace-nowrap">
                模式：{usePromptOptimizer ? '调用提示词优化器' : '不调用提示词优化器'}
              </div>

              <div className="bg-white border border-black/10 rounded-full p-1 shadow-sm flex items-center gap-1">
                <Tooltip content="不调用提示词优化器" position="top">
                  <button
                    onClick={() => setUsePromptOptimizer(false)}
                    className={clsx(
                      "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                      !usePromptOptimizer
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-black/5"
                    )}
                  >
                    <Lightbulb size={16} />
                  </button>
                </Tooltip>
                <Tooltip content="调用提示词优化器" position="top">
                  <button
                    onClick={() => setUsePromptOptimizer(true)}
                    className={clsx(
                      "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                      usePromptOptimizer
                        ? "bg-accent-promotion text-white"
                        : "text-gray-600 hover:bg-black/5"
                    )}
                  >
                    <Zap size={16} />
                  </button>
                </Tooltip>
              </div>
            </div>

            <div className="bg-white border border-black/10 rounded-full p-1 shadow-sm">
              <button
                className={clsx(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                  isGenerating ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-accent-promotion text-white"
                )}
                onClick={() => {
                  if (isGenerating) return;
                  const userInput = promptDisplayValue.trim();

                  if (usePromptOptimizer) {
                    if (promptDisplaySource === 'original') {
                      setOriginalPrompt(userInput);
                      const nextOptimized = optimizePrompt(userInput);
                      setOptimizedPrompt(nextOptimized);
                      setLastOptimizedOriginalPrompt(userInput);
                    }
                  } else {
                    setOriginalPrompt(userInput);
                  }

                  setIsGenerating(true);
                  setGeneratedImages([]);
                  setSelectedImageIndex(null);
                  setTimeout(() => {
                    setIsGenerating(false);
                    setGeneratedImages([
                      'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80',
                      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80',
                      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
                      'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80'
                    ]);
                  }, 2000);
                }}
              >
                {isGenerating ? <RefreshCw size={18} className="animate-spin" /> : <Sparkles size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        previewImage={selectedImageIndex !== null ? generatedImages[selectedImageIndex] : ''}
        onExport={(settings) => {
          console.log('Exporting with settings:', settings);
          setIsExportModalOpen(false);
          toast.success('导出成功');
        }}
      />
    </div>
  );
}

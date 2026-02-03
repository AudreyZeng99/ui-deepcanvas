import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Wand2, 
  Image as ImageIcon, 
  Download, 
  Share2, 
  Edit3, 
  RefreshCw,
  Sparkles,
  Maximize2,
  CheckCircle2,
  Scaling,
  Palette,
  Sliders
} from 'lucide-react';
import clsx from 'clsx';

const STYLES = [
  { id: 'none', label: 'No Style' },
  { id: 'cinematic', label: 'Cinematic' },
  { id: 'photorealistic', label: 'Photorealistic' },
  { id: 'anime', label: 'Anime' },
  { id: 'digital-art', label: 'Digital Art' },
  { id: 'oil-painting', label: 'Oil Painting' },
  { id: 'cyberpunk', label: 'Cyberpunk' },
  { id: 'studio-photo', label: 'Studio Photo' },
];

import { Tooltip } from '../components/Tooltip';

export default function TextToImage() {
  const location = useLocation();
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [activeSource, setActiveSource] = useState<'original' | 'optimized'>('original');
  const [isGenerating, setIsGenerating] = useState(false);
  
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

  const handleOptimize = () => {
    // Mock optimization logic
    const enhancements = ", highly detailed, 8k resolution, cinematic lighting, photorealistic, trending on artstation, masterpiece, sharp focus";
    setOptimizedPrompt((originalPrompt || "A beautiful scene") + enhancements);
    setActiveSource('optimized');
  };

  return (
    <div className="h-screen p-6 flex gap-6 overflow-hidden bg-background">
      {/* Left Column: Image Preview + Settings Toolbar */}
      <div className="flex-1 bg-white/50 backdrop-blur-xl border border-black/5 rounded-3xl p-6 flex flex-col relative group transition-all duration-300">
        
        {/* Top Toolbar with Settings */}
        <div className="flex items-center justify-between mb-6 z-20 relative" ref={settingsRef}>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold flex items-center gap-2 mr-4">
              <ImageIcon className="text-primary" />
              Generation Preview
            </h2>
            
            {/* Dimensions Button */}
            <div className="relative">
              <Tooltip content="调整尺寸" position="bottom">
                <button 
                  onClick={() => setActiveSetting(activeSetting === 'dimensions' ? null : 'dimensions')}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border",
                    activeSetting === 'dimensions' 
                      ? "bg-primary text-primary-foreground border-primary shadow-lg" 
                      : "bg-white text-gray-700 border-black/5 hover:bg-gray-50 hover:border-black/10"
                  )}
                >
                  <Scaling size={16} />
                  {dimensions.width} x {dimensions.height}
                </button>
              </Tooltip>
              
              {activeSetting === 'dimensions' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-black/5 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Dimensions (px)</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="number"
                      value={dimensions.width}
                      onChange={(e) => setDimensions(prev => ({ ...prev, width: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-transparent focus:bg-white focus:border-accent-primary focus:outline-none text-sm"
                      placeholder="W"
                    />
                    <span className="text-gray-400">×</span>
                    <input
                      type="number"
                      value={dimensions.height}
                      onChange={(e) => setDimensions(prev => ({ ...prev, height: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-transparent focus:bg-white focus:border-accent-primary focus:outline-none text-sm"
                      placeholder="H"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setDimensions({ width: 1024, height: 1024 })} className="flex-1 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg">1:1</button>
                    <button onClick={() => setDimensions({ width: 1920, height: 1080 })} className="flex-1 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg">16:9</button>
                    <button onClick={() => setDimensions({ width: 1080, height: 1920 })} className="flex-1 py-1 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg">9:16</button>
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
                      ? "bg-primary text-primary-foreground border-primary shadow-lg" 
                      : "bg-white text-gray-700 border-black/5 hover:bg-gray-50 hover:border-black/10"
                  )}
                >
                  <Palette size={16} />
                  {STYLES.find(s => s.id === selectedStyle)?.label || 'Style'}
                </button>
              </Tooltip>

              {activeSetting === 'style' && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-black/5 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-left max-h-[300px] overflow-y-auto custom-scrollbar">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Select Style</label>
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
                            ? "bg-primary text-primary-foreground" 
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
                    ? "bg-primary text-primary-foreground border-primary shadow-lg" 
                    : "bg-white text-gray-700 border-black/5 hover:bg-gray-50 hover:border-black/10"
                )}
              >
                <Sliders size={16} />
                Advanced
              </button>

              {activeSetting === 'advanced' && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-black/5 p-5 animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Steps</label>
                        <span className="text-xs font-mono">{modelParams.steps}</span>
                      </div>
                      <input 
                        type="range" min="10" max="150" value={modelParams.steps}
                        onChange={(e) => setModelParams(prev => ({ ...prev, steps: Number(e.target.value) }))}
                        className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Guidance (CFG)</label>
                        <span className="text-xs font-mono">{modelParams.cfgScale}</span>
                      </div>
                      <input 
                        type="range" min="1" max="20" step="0.5" value={modelParams.cfgScale}
                        onChange={(e) => setModelParams(prev => ({ ...prev, cfgScale: Number(e.target.value) }))}
                        className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Seed</label>
                      <div className="flex gap-2">
                        <input 
                          type="number"
                          value={modelParams.seed}
                          onChange={(e) => setModelParams(prev => ({ ...prev, seed: Number(e.target.value) }))}
                          className="flex-1 px-3 py-2 rounded-lg bg-gray-50 border border-transparent focus:bg-white focus:border-accent-primary focus:outline-none text-xs font-mono"
                          placeholder="-1 for random"
                        />
                        <button 
                          onClick={() => setModelParams(prev => ({ ...prev, seed: -1 }))}
                          className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 text-gray-600"
                          title="Randomize"
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
        
        <div className="flex-1 flex items-center justify-center bg-[#F5F5F7] rounded-2xl border border-black/5 relative overflow-hidden">
          {/* Placeholder for Generated Image */}
          <div className="text-center opacity-30">
            <Sparkles size={64} className="mx-auto mb-4" />
            <p className="text-lg font-medium">Ready to imagine</p>
            <p className="text-sm mt-2">{dimensions.width} x {dimensions.height}px</p>
          </div>
          
          <div className="absolute bottom-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-3 bg-white shadow-lg rounded-xl hover:bg-gray-50 transition-colors" title="Expand">
              <Maximize2 size={20} />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-6 flex justify-between items-center">
          <div className="flex gap-2">
            <button className="btn-secondary py-2.5 px-5 flex items-center gap-2 text-sm">
              <Edit3 size={16} />
              Edit in Canvas
            </button>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary py-2.5 px-5 flex items-center gap-2 text-sm">
              <Share2 size={16} />
              Share
            </button>
            <button className="btn-primary py-2.5 px-5 flex items-center gap-2 text-sm">
              <Download size={16} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Controls */}
      <div className="w-[560px] flex flex-col gap-4 h-full">
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          
          {/* Prompt Engineering Section */}
          <div className="bg-white/60 backdrop-blur-xl border border-black/5 rounded-3xl p-5 flex flex-col gap-4 flex-1 h-full">
            <div className="flex items-center gap-2 mb-1">
              <Wand2 size={20} className="text-accent-primary" />
              <h3 className="font-bold text-lg">Prompt Engineering</h3>
            </div>

            {/* Original Prompt */}
            <div 
              className={clsx(
                "rounded-2xl border-2 transition-all p-4 relative group flex-1",
                activeSource === 'original' ? "border-primary bg-primary/5" : "border-transparent bg-white hover:border-black/5"
              )}
              onClick={() => setActiveSource('original')}
            >
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Original Prompt</label>
                <div className={clsx(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  activeSource === 'original' ? "border-primary bg-primary text-primary-foreground" : "border-gray-300 text-transparent"
                )}>
                  <CheckCircle2 size={14} />
                </div>
              </div>
              <textarea 
                value={originalPrompt}
                onChange={(e) => setOriginalPrompt(e.target.value)}
                placeholder="Describe what you want to see..."
                maxLength={1500}
                className="w-full h-[calc(100%-2rem)] bg-transparent border-none p-0 resize-none focus:outline-none text-sm leading-relaxed placeholder:text-gray-400"
              />
              <div className="absolute bottom-4 right-4 text-xs text-gray-400">{originalPrompt.length}/1500</div>
            </div>

            {/* Optimization Action */}
            <div className="relative h-4 flex items-center justify-center -my-2 z-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/5"></div>
              </div>
              <Tooltip content="AI 优化提示词">
                <button 
                  onClick={handleOptimize}
                  className="relative bg-white border border-black/10 shadow-sm text-promotion hover:text-promotion-foreground hover:bg-promotion hover:border-promotion px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all transform hover:scale-105"
                >
                  <Sparkles size={12} />
                  AI Optimize
                </button>
              </Tooltip>
            </div>

            {/* Optimized Prompt */}
            <div 
              className={clsx(
                "rounded-2xl border-2 transition-all p-4 relative flex-1",
                activeSource === 'optimized' ? "border-promotion bg-promotion/5" : "border-transparent bg-white hover:border-black/5",
                !optimizedPrompt && "opacity-50"
              )}
              onClick={() => optimizedPrompt && setActiveSource('optimized')}
            >
              <div className="flex justify-between items-center mb-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Optimized Prompt</label>
                <div className={clsx(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                  activeSource === 'optimized' ? "border-promotion bg-promotion text-promotion-foreground" : "border-gray-300 text-transparent"
                )}>
                  <CheckCircle2 size={14} />
                </div>
              </div>
              <textarea 
                value={optimizedPrompt}
                onChange={(e) => setOptimizedPrompt(e.target.value)}
                placeholder="AI optimized prompt will appear here..."
                maxLength={1500}
                disabled={!optimizedPrompt && activeSource !== 'optimized'}
                className="w-full h-[calc(100%-2rem)] bg-transparent border-none p-0 resize-none focus:outline-none text-sm leading-relaxed placeholder:text-gray-400"
              />
              <div className="absolute bottom-4 right-4 text-xs text-gray-400">{optimizedPrompt.length}/1500</div>
            </div>
          </div>
        </div>

        {/* Generate Button Footer */}
        <div className="p-4 bg-white/60 backdrop-blur-xl border border-black/5 rounded-3xl mt-auto shadow-xl shadow-black/5">
          <button 
            className={clsx(
              "w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]",
              isGenerating ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-primary text-primary-foreground hover:opacity-90 shadow-lg hover:shadow-xl"
            )}
            onClick={() => setIsGenerating(!isGenerating)}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

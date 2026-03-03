import { useState, useRef, useEffect } from 'react';
import ToolLayout from './ToolLayout';
import { 
  Upload, 
  Image as ImageIcon, 
  Brush, 
  Eraser, 
  RotateCcw, 
  Download, 
  Wand2, 
  Play, 
  RefreshCw, 
  Check
} from 'lucide-react';
import clsx from 'clsx';

export default function AIEdit() {
  const [image, setImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  
  // Brush settings
  const [brushSize, setBrushSize] = useState(20);
  const [brushColor, setBrushColor] = useState('#FF00FF'); // Default to Magenta
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasMask, setHasMask] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize canvas when image is loaded
  useEffect(() => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const img = new Image();
      img.src = image;
      img.onload = () => {
        // Set canvas dimensions to match image but constrained to container
        const containerWidth = canvas.parentElement?.clientWidth || 800;
        const scale = Math.min(1, containerWidth / img.width);
        
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Setup drawing context
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        contextRef.current = ctx;
      };
    }
  }, [image]);

  // Update brush style
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.lineWidth = brushSize;
      contextRef.current.strokeStyle = brushColor;
      contextRef.current.globalAlpha = 0.5; // Semi-transparent brush
    }
  }, [brushSize, brushColor]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setResultImage(null);
        setHasMask(false);
        setPrompt('');
      };
      reader.readAsDataURL(file);
    }
  };

  const startDrawing = ({ nativeEvent }: React.MouseEvent) => {
    if (!contextRef.current) return;
    
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
    setHasMask(true);
  };

  const draw = ({ nativeEvent }: React.MouseEvent) => {
    if (!isDrawing || !contextRef.current) return;
    
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const clearMask = () => {
    if (image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const img = new Image();
      img.src = image;
      img.onload = () => {
        ctx.globalAlpha = 1;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Reset context for drawing
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = brushSize;
        ctx.strokeStyle = brushColor;
        ctx.globalAlpha = 0.5;
        
        setHasMask(false);
      };
    }
  };

  const handleGenerate = () => {
    if (!prompt) return;
    
    setIsGenerating(true);
    
    // Mock generation process
    setTimeout(() => {
      // For demo purposes, we'll just use a placeholder image or modify the current one slightly if we could
      // Here we just use a different Unsplash image to simulate "edited" result
      const mockResults = [
        'https://images.unsplash.com/photo-1620641788427-b9f4dbd0b50d?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop'
      ];
      setResultImage(mockResults[Math.floor(Math.random() * mockResults.length)]);
      setIsGenerating(false);
    }, 2000);
  };

  const handleContinueEditing = () => {
    if (resultImage) {
      setImage(resultImage);
      setResultImage(null);
      setHasMask(false);
      setPrompt('');
      // Canvas will re-render due to useEffect dependency on [image]
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `deepcanvas-edit-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <ToolLayout title="AI 创意改图 ✨">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[600px]">
        {/* Left: Canvas Area */}
        <div className="lg:col-span-2 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden group">
          {!image ? (
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">上传图片开始改图</h3>
              <p className="text-gray-500 mb-6">支持 JPG, PNG 格式，最大 10MB</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                选择本地图片
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          ) : resultImage ? (
            <div className="relative w-full h-full flex items-center justify-center bg-gray-900/5">
               <img src={resultImage} alt="Generated Result" className="max-w-full max-h-full object-contain shadow-xl rounded-lg" />
               <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                 生成预览
               </div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center bg-white p-4">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className={clsx(
                  "max-w-full max-h-full object-contain shadow-lg cursor-crosshair",
                  isGenerating && "opacity-50 blur-sm pointer-events-none"
                )}
              />
              {isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-lg font-bold text-gray-700 animate-pulse">AI 正在施展魔法...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Controls */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 flex flex-col h-full">
          {!image ? (
            // Empty State Sidebar
            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
              <ImageIcon size={48} className="opacity-20" />
              <p>请先在左侧上传图片</p>
            </div>
          ) : resultImage ? (
            // Result Actions Sidebar
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="text-center pb-6 border-b border-gray-100">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} />
                </div>
                <h3 className="text-xl font-bold">改图完成！</h3>
                <p className="text-sm text-gray-500 mt-1">您可以保存结果或继续在此基础上修改</p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleDownload}
                  className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={20} />
                  导出图片
                </button>
                
                <button 
                  onClick={handleContinueEditing}
                  className="w-full py-4 bg-white border-2 border-black text-black rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Wand2 size={20} />
                  继续修改
                </button>
                
                <button 
                  onClick={() => {
                    setImage(null);
                    setResultImage(null);
                    setHasMask(false);
                    setPrompt('');
                  }}
                  className="w-full py-4 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} />
                  重新上传
                </button>
              </div>
            </div>
          ) : (
            // Editing Controls Sidebar
            <div className="flex flex-col h-full space-y-8 animate-in slide-in-from-right-4 duration-300">
              {/* Step 1: Brush Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Brush size={18} />
                    画笔设置
                  </h3>
                  {hasMask && (
                    <button 
                      onClick={clearMask}
                      className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                    >
                      <Eraser size={14} />
                      清除涂抹
                    </button>
                  )}
                </div>
                
                <div className="p-4 bg-gray-50 rounded-xl space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>画笔大小</span>
                      <span>{brushSize}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="100" 
                      value={brushSize} 
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">画笔颜色 (用于区分原图)</label>
                    <div className="flex gap-2">
                      {['#FF00FF', '#00FF00', '#00FFFF', '#FFFF00', '#FF0000'].map(color => (
                        <button
                          key={color}
                          onClick={() => setBrushColor(color)}
                          className={clsx(
                            "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                            brushColor === color ? "border-black scale-110 shadow-sm" : "border-transparent"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                      <input 
                        type="color" 
                        value={brushColor}
                        onChange={(e) => setBrushColor(e.target.value)}
                        className="w-8 h-8 rounded-full overflow-hidden border-none p-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  * 涂抹您想要修改的区域，AI 将只针对该区域进行重绘
                </p>
              </div>

              {/* Step 2: Prompt */}
              <div className="flex-1 flex flex-col">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                  <Wand2 size={18} />
                  改图指令
                </h3>
                <div className="relative flex-1">
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={hasMask 
                      ? "请描述您希望将涂抹区域修改成什么样子？例如：换成一朵红色的玫瑰花..." 
                      : "请输入改图指令..."
                    }
                    className="w-full h-full p-4 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all text-sm leading-relaxed"
                  />
                  <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                    {prompt.length}/500
                  </div>
                </div>
              </div>

              {/* Step 3: Action */}
              <button 
                onClick={handleGenerate}
                disabled={!prompt || isGenerating}
                className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={20} className="animate-spin" />
                    正在生成...
                  </>
                ) : (
                  <>
                    <Play size={20} fill="currentColor" />
                    立即改图
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
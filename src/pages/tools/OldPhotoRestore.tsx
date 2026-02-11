import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Download, RefreshCw, Camera, Image as ImageIcon, X, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import ExportModal, { ExportSettings } from '../../components/ExportModal';

export default function OldPhotoRestore() {
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [restoredUrl, setRestoredUrl] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [developingProgress, setDevelopingProgress] = useState(0);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Retro Logs Data
  const [logs, setLogs] = useState<string[]>([]);
  const LOG_MESSAGES = [
    "INITIALIZING SYSTEM CORE...",
    "LOADING RETRO_VISION_MODULE_V1.0...",
    "CHECKING MEMORY BANKS... OK",
    "CALIBRATING LENS OPTICS...",
    "DETECTING VINTAGE ARTIFACTS...",
    "ANALYZING CHROMATIC ABERRATION...",
    "LOADING SEPIA TONE MATRIX...",
    "WARMING UP VACUUM TUBES...",
    "SYNCHRONIZING TIME CRYSTALS...",
    "BYPASSING FLUX CAPACITOR...",
    "OPTIMIZING GRAIN ALGORITHMS...",
    "FETCHING NEURAL WEIGHTS...",
    "ESTABLISHING TEMPORAL LINK...",
    "BUFFERING IMAGE DATA...",
    "READY FOR INPUT STREAM...",
    "WAITING FOR USER COMMAND...",
    "SYSTEM READY."
  ];

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < LOG_MESSAGES.length) {
        setLogs(prev => [...prev, LOG_MESSAGES[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Simulate the "developing" process of a polaroid
  useEffect(() => {
    if (isRestoring) {
      setDevelopingProgress(0);
      const interval = setInterval(() => {
        setDevelopingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2; 
        });
      }, 60);
      
      return () => clearInterval(interval);
    }
  }, [isRestoring]);

  // Finish restoring when progress hits 100
  useEffect(() => {
    if (developingProgress === 100) {
      setTimeout(() => {
        setIsRestoring(false);
        setRestoredUrl(previewUrl); 
      }, 500);
    }
  }, [developingProgress, previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setRestoredUrl(null);
      setDevelopingProgress(0);
    }
  };

  const handleRestore = () => {
    if (!previewUrl) return;
    setIsRestoring(true);
    setRestoredUrl(null);
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setRestoredUrl(null);
    setDevelopingProgress(0);
  };

  const handleExport = (settings: ExportSettings) => {
    console.log('Exporting with settings:', settings);
    setIsExportModalOpen(false);
    alert('老照片已成功修复并导出！');
  };

  return (
    <div className="min-h-screen bg-[#e8dfd1] font-serif relative overflow-hidden text-[#4a3b2a]">
      {/* Background Texture - Old Paper/Grain */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")` 
        }} 
      />

      {/* Retro Header */}
      <header className="relative z-50 px-8 py-6 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="group flex items-center justify-center w-12 h-12 rounded-full border-2 border-[#5c4a35] text-[#5c4a35] hover:bg-[#5c4a35] hover:text-[#e8dfd1] transition-all duration-300 shadow-[2px_2px_0px_0px_rgba(92,74,53,0.3)] hover:shadow-none hover:translate-y-[2px]"
          title="返回"
        >
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>
        
        <div className="flex flex-col items-center">
          <div className="border-b-2 border-[#5c4a35] pb-2 mb-1 px-8">
            <h1 className="text-3xl md:text-4xl font-black tracking-[0.2em] text-[#3d2b1f] uppercase" style={{ fontFamily: '"Courier New", Courier, monospace' }}>
              老照片修复
            </h1>
          </div>
          <span className="text-xs tracking-widest text-[#8c7b6c] uppercase font-bold">Retro Photo Restoration Lab</span>
        </div>

        <div className="w-12" /> {/* Spacer for centering */}
      </header>

      <ExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        previewImage={restoredUrl || ''}
        onExport={handleExport}
      />

      {/* Main Content Area */}
      <div className="relative z-10 container mx-auto px-4 py-8 flex-1 flex flex-col items-center justify-center min-h-[70vh]">
        
        {/* Vintage Camera Body / Workspace */}
        <div className="w-full max-w-5xl bg-[#2b2b2b] rounded-[3rem] p-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border-t border-white/10 relative overflow-hidden group">
          
          {/* Leather Texture Overlay */}
          <div className="absolute inset-0 opacity-40 pointer-events-none" 
               style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/leather.png")' }} />
          
          {/* Metallic Frame Detail */}
          <div className="absolute top-0 left-10 right-10 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {/* Top Metallic Control Bar */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#444] to-[#222] border-b border-[#111] flex items-center px-10 justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-[#ff3333] shadow-[0_0_10px_#ff3333] animate-pulse" />
              <div className="h-8 w-[1px] bg-[#555] mx-2" />
              <span className="text-[#bbb] font-mono text-xs tracking-[0.2em]">MODEL: TIME-MACHINE-X1</span>
            </div>
            
            {/* Decorative Dials */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#333] border border-[#555] shadow-inner flex items-center justify-center transform rotate-45">
                 <div className="w-1 h-4 bg-[#111] rounded-full" />
              </div>
              <div className="w-10 h-10 rounded-full bg-[#333] border border-[#555] shadow-inner flex items-center justify-center transform -rotate-12">
                 <div className="w-1 h-4 bg-[#111] rounded-full" />
              </div>
            </div>
          </div>

          <div className="mt-20 flex flex-col md:flex-row gap-12 items-center justify-center min-h-[500px]">
            
            {/* Left Side: Controls & Upload */}
            <div className="w-full md:w-1/3 flex flex-col gap-8 z-10 relative">
              {!previewUrl ? (
                <div className="relative group cursor-pointer transform transition-transform duration-300 hover:scale-[1.02]">
                  {/* Photo Corner Decor */}
                  <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-[#e8dfd1] z-20" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-[#e8dfd1] z-20" />
                  <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-[#e8dfd1] z-20" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-[#e8dfd1] z-20" />

                  <div className="relative bg-[#e8dfd1] p-1 rounded shadow-xl transform rotate-[-1deg] transition-transform group-hover:rotate-0">
                    <div className="border-2 border-dashed border-[#a89b8c] rounded h-72 flex flex-col items-center justify-center bg-[#f4efe6]">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      />
                      <div className="w-16 h-16 rounded-full bg-[#d6cbb9] flex items-center justify-center mb-4 text-[#8c7b6c]">
                        <Upload size={32} />
                      </div>
                      <p className="text-[#5c4a35] font-serif font-bold text-lg">UPLOAD PHOTO</p>
                      <p className="text-[#8c7b6c] text-xs mt-2 font-mono tracking-wider">JPG / PNG SUPPORTED</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Preview Polaroid */}
                  <div className="relative bg-white p-3 pb-12 shadow-xl transform -rotate-2 transition-transform hover:rotate-0 hover:scale-105 duration-300">
                    <div className="relative overflow-hidden bg-gray-900 aspect-[4/5]">
                      <img src={previewUrl} alt="Original" className="w-full h-full object-cover filter sepia-[.3] contrast-[1.1]" />
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                      <p className="font-handwriting text-gray-600 text-sm font-bold opacity-70" style={{ fontFamily: '"Courier New", monospace' }}>Original Copy</p>
                    </div>
                    
                    <button 
                      onClick={handleReset}
                      className="absolute -top-3 -right-3 bg-[#8b0000] text-[#e8dfd1] rounded-full p-2 shadow-[2px_2px_0_#3d2b1f] hover:bg-[#a52a2a] transition-all hover:rotate-90 border-2 border-[#e8dfd1]"
                    >
                      <X size={16} strokeWidth={3} />
                    </button>
                  </div>

                  {!isRestoring && !restoredUrl && (
                    <button
                      onClick={handleRestore}
                      className="group relative w-full h-24 bg-[#1a1a1a] rounded-2xl shadow-[0_10px_0_#000] active:shadow-none active:translate-y-[10px] transition-all flex items-center justify-center overflow-hidden border-2 border-[#333]"
                    >
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-50" />
                      
                      {/* Shutter Button Effect */}
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-b from-[#ff3333] to-[#cc0000] border-4 border-[#880000] shadow-[inset_0_2px_5px_rgba(255,255,255,0.4),0_5px_10px_rgba(0,0,0,0.5)] flex items-center justify-center group-hover:brightness-110 transition-all">
                        <Camera className="text-white drop-shadow-md" size={24} />
                      </div>
                      
                      <div className="ml-6 flex flex-col items-start">
                        <span className="text-[#e8dfd1] font-black text-2xl tracking-widest uppercase drop-shadow-md" style={{ fontFamily: 'Impact, sans-serif' }}>RESTORE</span>
                        <span className="text-[#8c7b6c] text-[10px] font-mono tracking-[0.2em] uppercase">Press Shutter</span>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right Side: Output / Animation Area */}
            <div className="w-full md:w-2/3 h-[550px] bg-[#151515] rounded-xl border-8 border-[#222] shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] relative flex items-center justify-center overflow-hidden">
              
              {/* Retro Logs Display (Overlay) */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none opacity-50">
                <div className="font-mono text-[10px] leading-relaxed text-[#0f0] shadow-black drop-shadow-md" style={{ fontFamily: '"Courier New", monospace' }}>
                  {logs.map((log, i) => (
                    <div key={i} className="animate-fade-in whitespace-nowrap overflow-hidden">
                      <span className="mr-2 opacity-50">[{String(i + 1).padStart(2, '0')}]</span>
                      {log}
                    </div>
                  ))}
                  {logs.length === 17 && (
                    <div className="animate-pulse mt-1">_</div>
                  )}
                </div>
              </div>

              {/* Darkroom Red Light Effect */}
              <div className="absolute inset-0 bg-red-900/10 pointer-events-none mix-blend-overlay z-20" />
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none z-20" />

              {/* Default State / Placeholder */}
              {!isRestoring && !restoredUrl && (
                <div className="text-center opacity-20 flex flex-col items-center">
                  <div className="w-24 h-24 border-4 border-dashed border-white rounded-full flex items-center justify-center mb-4">
                    <ImageIcon size={48} className="text-white" />
                  </div>
                  <p className="text-white font-mono tracking-widest text-sm">WAITING FOR INPUT...</p>
                </div>
              )}

              {/* Printing Animation Container */}
              {(isRestoring || restoredUrl) && (
                <div className={clsx(
                  "relative bg-white p-4 pb-16 shadow-2xl transition-all duration-[3000ms] ease-[cubic-bezier(0.25,1,0.5,1)] transform z-30",
                  isRestoring ? "translate-y-[-120%]" : "translate-y-0",
                  developingProgress > 0 && developingProgress < 100 && "translate-y-0"
                )}
                style={{
                  width: '340px',
                  height: '440px',
                  animation: isRestoring ? 'slideDown 3s cubic-bezier(0.25, 1, 0.5, 1) forwards' : 'none'
                }}>
                  {/* The Photo Paper */}
                  <div className="w-full h-full bg-[#111] relative overflow-hidden ring-1 ring-black/10">
                    <img 
                      src={previewUrl!} 
                      alt="Restoring" 
                      className="w-full h-full object-cover transition-all duration-[3000ms] ease-in-out"
                      style={{
                        filter: `grayscale(${100 - developingProgress}%) brightness(${developingProgress * 1.1}%) contrast(${80 + developingProgress * 0.4}%) blur(${Math.max(0, (100 - developingProgress) / 8)}px)`
                      }}
                    />
                    
                    {/* Developing liquid effect overlay */}
                    <div 
                      className="absolute inset-0 pointer-events-none mix-blend-color-dodge transition-opacity duration-[3000ms]"
                      style={{
                        background: `radial-gradient(circle at center, transparent ${developingProgress}%, #000 150%)`,
                        opacity: (100 - developingProgress) / 100
                      }}
                    />
                  </div>
                  
                  {/* Polaroid Bottom Text Area */}
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                     <div className="flex items-center justify-center gap-2">
                       {developingProgress < 100 && (
                         <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                       )}
                       <p className="font-mono text-gray-500 text-xs tracking-widest uppercase">
                         {developingProgress < 100 ? `Developing ${developingProgress}%` : 'RESTORED • 2024'}
                       </p>
                     </div>
                  </div>
                </div>
              )}

              {/* Success Actions (Overlay when done) */}
              {restoredUrl && !isRestoring && (
                <div className="absolute bottom-8 right-8 flex gap-4 animate-fade-in z-40">
                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="bg-[#e8dfd1] text-[#3d2b1f] px-6 py-3 rounded-full font-bold shadow-lg hover:bg-white hover:scale-105 transition-all flex items-center gap-2 border-2 border-[#3d2b1f]"
                  >
                    <Download size={18} />
                    EXPORT
                  </button>
                  <button
                    onClick={handleReset}
                    className="bg-[#222] text-white w-12 h-12 rounded-full shadow-lg hover:bg-[#333] hover:rotate-180 transition-all flex items-center justify-center border border-white/20"
                    title="Start Over"
                  >
                    <RefreshCw size={18} />
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Camera Lens Decoration (Background) */}
          <div className="absolute right-[-120px] top-1/2 transform -translate-y-1/2 w-[500px] h-[500px] rounded-full border-[40px] border-[#1a1a1a] opacity-50 pointer-events-none shadow-inner" />
          <div className="absolute right-[-40px] top-1/2 transform -translate-y-1/2 w-[340px] h-[340px] rounded-full border-[2px] border-white/5 opacity-30 pointer-events-none" />

        </div>
        
        {/* Table Surface Reflection/Shadow */}
        <div className="w-[80%] max-w-4xl h-8 bg-black/20 blur-2xl rounded-[100%] mt-8" />

      </div>
      
      <style>{`
        @keyframes slideDown {
          0% { transform: translateY(-150%); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

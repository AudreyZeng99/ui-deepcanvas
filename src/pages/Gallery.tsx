import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, CheckCircle, X, ShieldCheck, 
  Sparkles, Import, ChevronLeft, ChevronRight
} from 'lucide-react';
import clsx from 'clsx';

// Mock Data Generation
const generateMockAssets = (type: AssetType, count: number, startId: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: startId + i,
    src: `https://images.unsplash.com/photo-${[
      '1620641788421-7a1c342ea42e',
      '1618005182384-a83a8bd57fbe',
      '1518531933037-91b2f5f229cc',
      '1506744038136-46273834b3fb',
      '1550684848-fac1c5b4e853',
      '1535930749574-1399327ce78f',
      '1614850523459-c2f4c699c52e',
      '1618172193763-c511deb635ca'
    ][i % 8]}?q=80&w=800&auto=format&fit=crop`,
    title: `${type === 'text-to-image' ? 'Generated' : type === 'edit' ? 'Edited' : 'Exported'} Image ${i + 1}`,
    type,
    date: `${Math.floor(Math.random() * 24)}h ago`
  }));
};

const textToImageAssets = generateMockAssets('text-to-image', 45, 100);
const editAssets = generateMockAssets('edit', 12, 200);
const exportAssets = generateMockAssets('export', 8, 300);

type AssetType = 'text-to-image' | 'edit' | 'export';

export default function Gallery() {
  const { currentProject } = useProject();
  const [activeTab, setActiveTab] = useState<AssetType>('text-to-image');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [previewItem, setPreviewItem] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Filter assets based on active tab
  const allCurrentAssets = activeTab === 'text-to-image' ? textToImageAssets : 
                        activeTab === 'edit' ? editAssets : exportAssets;

  // Pagination Logic
  const totalPages = Math.ceil(allCurrentAssets.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedAssets = allCurrentAssets.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleTabChange = (tab: AssetType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSelectedItems(new Set());
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSelection = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleClearSelection = () => {
    setSelectedItems(new Set());
  };

  const handlePreview = (item: any) => {
    setPreviewItem(item);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Standard Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="text-xl text-gray-500 font-medium">
            资产管理 <span className="mx-2">|</span> 管理您的创意资产与项目文件
          </div>
          <div className="flex gap-3 items-center">
             {selectedItems.size > 0 && (
               <button 
                 onClick={handleClearSelection}
                 className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
               >
                 <X size={16} />
                 取消勾选 ({selectedItems.size})
               </button>
             )}
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors">
                <ShieldCheck size={14} />
                消保审核
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent-primary bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/20 rounded-lg transition-colors">
                <Sparkles size={14} />
                体验审核
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors">
                <Import size={14} />
                导入素材库
              </button>
          </div>
        </header>

        {/* Main Layout Grid */}
        <div className="flex flex-col gap-8">
          
          {/* Section 2: Asset History (Main Content) */}
          <main className="w-full bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-6 border-b border-gray-100 w-full">
                <button 
                  onClick={() => handleTabChange('text-to-image')}
                  className={clsx(
                    "pb-3 px-1 font-medium transition-colors relative text-sm",
                    activeTab === 'text-to-image' ? "text-black" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  文生图资产
                  {activeTab === 'text-to-image' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
                  )}
                </button>
                <button 
                  onClick={() => handleTabChange('edit')}
                  className={clsx(
                    "pb-3 px-1 font-medium transition-colors relative text-sm",
                    activeTab === 'edit' ? "text-black" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  编辑资产
                  {activeTab === 'edit' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
                  )}
                </button>
                <button 
                  onClick={() => handleTabChange('export')}
                  className={clsx(
                    "pb-3 px-1 font-medium transition-colors relative text-sm",
                    activeTab === 'export' ? "text-black" : "text-gray-400 hover:text-gray-600"
                  )}
                >
                  导出资产
                  {activeTab === 'export' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {paginatedAssets.map((asset) => (
                <div 
                  key={asset.id} 
                  className={clsx(
                    "group relative aspect-square rounded-xl overflow-hidden cursor-pointer border transition-all duration-300",
                    selectedItems.has(asset.id) ? "border-accent-primary ring-2 ring-accent-primary/20" : "border-gray-100 hover:shadow-lg"
                  )}
                  onClick={() => handlePreview(asset)}
                >
                  <img 
                    src={asset.src} 
                    alt={asset.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors">
                    <button 
                      onClick={(e) => toggleSelection(e, asset.id)}
                      className={clsx(
                        "absolute top-2 left-2 w-5 h-5 rounded border flex items-center justify-center transition-all",
                        selectedItems.has(asset.id) 
                          ? "bg-accent-primary border-accent-primary text-white" 
                          : "bg-white/80 border-gray-300 text-transparent hover:border-accent-primary opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <CheckCircle size={12} fill="currentColor" className={clsx(selectedItems.has(asset.id) ? "opacity-100" : "opacity-0")} />
                    </button>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="w-8 h-8 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                        <Eye size={16} />
                      </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-[10px] font-medium truncate">{asset.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {allCurrentAssets.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="text-xs text-gray-500">
                  {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, allCurrentAssets.length)} / {allCurrentAssets.length}
                  {selectedItems.size > 0 && <span className="ml-2 font-medium text-accent-primary">({selectedItems.size} 选定)</span>}
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  
                  <div className="flex items-center gap-1 px-2 text-xs">
                    <span className="font-medium">{currentPage}</span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-400">{totalPages}</span>
                  </div>

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-8" onClick={() => setPreviewItem(null)}>
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
            onClick={() => setPreviewItem(null)}
          >
            <X size={32} />
          </button>
          <img 
            src={previewItem.src} 
            alt={previewItem.title} 
            className="max-w-full max-h-full rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full text-white flex items-center gap-4">
             <span>{previewItem.title}</span>
             <span className="text-white/50">|</span>
             <span className="text-white/70 text-sm">{previewItem.date}</span>
          </div>
        </div>
      )}
    </div>
  );
}

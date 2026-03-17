import { useMemo, useState } from 'react';
import clsx from 'clsx';

interface MaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddElement: (type: string, subType?: string, props?: any, content?: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  personalMaterials: string[];
}

export default function MaterialsModal({ 
  isOpen, 
  onClose, 
  onAddElement, 
  onUpload, 
  personalMaterials 
}: MaterialsModalProps) {
  type MaterialSource = 'personal' | 'public-logo' | 'public-ip' | 'public-campaign' | 'public-cutout' | 'traffic-banner';
  type MaterialEntry = {
    url: string;
    source: MaterialSource;
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'personal' | 'public-logo' | 'public-ip' | 'public-campaign' | 'public-cutout' | 'traffic-banner'>('personal');
  const [expandedFolders, setExpandedFolders] = useState({
    personal: true,
    public: true,
    traffic: true,
  });
  const [favoriteUrls, setFavoriteUrls] = useState<Set<string>>(
    () => new Set([
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80',
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=700&q=80',
    ])
  );
  const [deletedUrls, setDeletedUrls] = useState<Set<string>>(new Set());
  const [hoverLogicText, setHoverLogicText] = useState<string | null>(null);
  const [favoritePage, setFavoritePage] = useState(1);
  const [personalPage, setPersonalPage] = useState(1);
  const [libraryPage, setLibraryPage] = useState(1);

  const demoPersonalMaterials = [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=700&q=80',
    'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=700&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=700&q=80',
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=700&q=80',
    'https://upload.wikimedia.org/wikipedia/commons/8/84/Example.svg',
    'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=700&q=80',
    'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=700&q=80',
  ];

  const publicLogoItems = [
    'https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=700&q=80',
    'https://images.unsplash.com/photo-1618005198919-d3d4b5a92eee?w=700&q=80',
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=700&q=80',
    'https://images.unsplash.com/photo-1636956111619-0b9b3e3d5c9c?w=700&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&q=80',
    'https://images.unsplash.com/photo-1613909207039-6b173b755cc1?w=700&q=80',
  ];

  const ipCharacterItems = [
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=700&q=80',
    'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=700&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=700&q=80',
    'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=700&q=80',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=700&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=700&q=80',
  ];

  const campaignItems = [
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=700&q=80',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=700&q=80',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=700&q=80',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=80',
    'https://images.unsplash.com/photo-1493246318656-5bfd4cfb29b8?w=700&q=80',
    'https://images.unsplash.com/photo-1496483648148-47c686dc86a8?w=700&q=80',
  ];

  const cutoutItems = [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80',
    'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=700&q=80',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=700&q=80',
    'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=700&q=80',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=700&q=80',
    'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=700&q=80',
  ];

  const trafficBannerItems = [
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80',
    'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&q=80',
    'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=400&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&q=80',
  ];

  const ITEMS_PER_PAGE = 10;

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setLibraryPage(1);
  };

  const toggleFolder = (folder: 'personal' | 'public' | 'traffic') => {
    setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const rawPersonalList = useMemo(
    () => [...personalMaterials, ...demoPersonalMaterials],
    [personalMaterials]
  );

  const personalList = useMemo(() => {
    const seen = new Set<string>();
    return rawPersonalList.filter((url) => {
      if (deletedUrls.has(url)) return false;
      if (searchQuery && !url.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  }, [rawPersonalList, deletedUrls, searchQuery]);

  const allVisibleMaterials = useMemo<MaterialEntry[]>(() => {
    const sourceBuckets: MaterialEntry[] = [
      ...personalList.map((url) => ({ url, source: 'personal' as const })),
      ...publicLogoItems.map((url) => ({ url, source: 'public-logo' as const })),
      ...ipCharacterItems.map((url) => ({ url, source: 'public-ip' as const })),
      ...campaignItems.map((url) => ({ url, source: 'public-campaign' as const })),
      ...cutoutItems.map((url) => ({ url, source: 'public-cutout' as const })),
      ...trafficBannerItems.map((url) => ({ url, source: 'traffic-banner' as const })),
    ];
    const seen = new Set<string>();
    return sourceBuckets.filter(({ url }) => {
      if (deletedUrls.has(url)) return false;
      if (searchQuery && !url.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  }, [
    personalList,
    publicLogoItems,
    ipCharacterItems,
    campaignItems,
    cutoutItems,
    trafficBannerItems,
    deletedUrls,
    searchQuery,
  ]);

  const favoriteList = useMemo(
    () => allVisibleMaterials.filter(({ url }) => favoriteUrls.has(url)),
    [allVisibleMaterials, favoriteUrls]
  );

  const paginate = <T,>(items: T[], page: number, size: number) => {
    const totalPages = Math.max(1, Math.ceil(items.length / size));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * size;
    return {
      totalPages,
      current: safePage,
      data: items.slice(start, start + size),
    };
  };

  const toggleFavorite = (url: string) => {
    setFavoriteUrls(prev => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const confirmDeleteMaterial = (url: string) => {
    const shouldDelete = window.confirm('确认删除该素材吗？删除后将从平台彻底移除。');
    if (!shouldDelete) return;
    setDeletedUrls(prev => new Set(prev).add(url));
    setFavoriteUrls(prev => {
      const next = new Set(prev);
      next.delete(url);
      return next;
    });
  };

  const renderPagination = (
    current: number,
    totalPages: number,
    onChange: (nextPage: number) => void
  ) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="px-2 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm text-gray-600"
      >
        ←
      </button>
      <span className="text-xs font-medium text-gray-600">{current} / {totalPages}</span>
      <button
        onClick={() => onChange(Math.min(totalPages, current + 1))}
        disabled={current === totalPages}
        className="px-2 py-1 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm text-gray-600"
      >
        →
      </button>
    </div>
  );

  const renderMaterialCard = (url: string, subType?: string, canDelete = true) => {
    const isFavorite = favoriteUrls.has(url);
    return (
      <div
        key={url}
        className="group relative aspect-[4/5] rounded-xl overflow-hidden border border-gray-100 bg-white hover:shadow-md hover:-translate-y-0.5 transition-all"
      >
        <img src={url} alt="素材预览" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <button
            onClick={() => onAddElement('image', subType, { src: url })}
            onMouseEnter={() => setHoverLogicText('点击后会将当前素材即时添加到画布中，保留原图比例。')}
            onMouseLeave={() => setHoverLogicText(null)}
            className="px-2 py-1 text-white/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] hover:text-white hover:scale-110 transition-all flex items-center justify-center pointer-events-auto"
          >
            <span className="text-[26px] leading-none font-normal">+</span>
          </button>
        </div>
        <div className="absolute right-2 bottom-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
          <button
            onClick={() => toggleFavorite(url)}
            onMouseEnter={() => setHoverLogicText(isFavorite ? '点击后会从收藏列表中移除该素材。' : '点击后会将该素材加入收藏列表。')}
            onMouseLeave={() => setHoverLogicText(null)}
            className="px-1 py-0.5 text-white/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] hover:text-white hover:scale-110 transition-all flex items-center justify-center pointer-events-auto"
          >
            <span className={clsx("text-[18px] leading-none", isFavorite ? "text-red-500" : "text-white")}>
              {isFavorite ? '♥' : '♡'}
            </span>
          </button>
          {canDelete && (
            <button
              onClick={() => confirmDeleteMaterial(url)}
              onMouseEnter={() => setHoverLogicText('点击后会删除该个人素材，并自动从收藏列表移除。')}
              onMouseLeave={() => setHoverLogicText(null)}
              className="px-1 py-0.5 text-white/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] hover:text-red-300 hover:scale-110 transition-all flex items-center justify-center pointer-events-auto"
            >
              <span className="relative w-[17px] h-[17px] block">
                <span className="absolute left-1/2 -translate-x-1/2 top-[1px] w-[5px] h-[1px] rounded bg-current" />
                <span className="absolute left-1/2 -translate-x-1/2 top-[3px] w-[11px] h-[1.5px] rounded bg-current" />
                <span className="absolute left-1/2 -translate-x-1/2 top-[5px] w-[9px] h-[10px] rounded-[2px] border-[1.4px] border-current" />
              </span>
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderPersonalContent = () => {
    const favoritePagination = paginate(favoriteList, favoritePage, ITEMS_PER_PAGE);
    const personalPagination = paginate(personalList, personalPage, ITEMS_PER_PAGE);
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <section className="space-y-3">
          <div className="text-sm font-semibold text-gray-900">上传</div>
          <label className="w-full flex items-center justify-center gap-3 p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 hover:border-accent-primary transition-all text-gray-500 hover:text-accent-primary group">
            <span className="text-sm font-medium">点击上传本地素材（支持 PNG / JPG / SVG）</span>
            <input type="file" accept=".png,.jpg,.jpeg,.svg,image/png,image/jpeg,image/svg+xml" className="hidden" onChange={onUpload} />
          </label>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">收藏列表</div>
            {renderPagination(favoritePagination.current, favoritePagination.totalPages, setFavoritePage)}
          </div>
          {favoriteList.length === 0 ? (
            <div className="flex items-center justify-center h-32 rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
              暂无收藏素材，请在任意素材列表中点击收藏
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-3">
              {favoritePagination.data.map(({ url, source }) => (
                renderMaterialCard(url, source === 'personal' ? 'personal' : undefined, source === 'personal')
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900">个人素材列表</div>
              <div className="text-xs text-gray-500 mt-1">可自行上传免抠素材或图片素材，支持 png、jpg、svg 格式</div>
            </div>
            {renderPagination(personalPagination.current, personalPagination.totalPages, setPersonalPage)}
          </div>
          {personalList.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-gray-400 py-12 bg-gray-50/50 rounded-xl border border-gray-100 border-dashed">
              <p className="text-sm">暂无个人素材</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-3">
              {personalPagination.data.map((url) => renderMaterialCard(url, 'personal'))}
            </div>
          )}
        </section>
      </div>
    );
  };

  const renderLibraryContent = (title: string, source: string[]) => {
    const filtered = source.filter((url) =>
      !deletedUrls.has(url) && (searchQuery ? url.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    );
    const pagination = paginate(filtered, libraryPage, ITEMS_PER_PAGE);
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900">{title}</div>
          {renderPagination(pagination.current, pagination.totalPages, setLibraryPage)}
        </div>
        {filtered.length === 0 ? (
          <div className="h-32 rounded-xl border border-dashed border-gray-200 text-sm text-gray-400 flex items-center justify-center">
            未找到匹配素材
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-3">
            {pagination.data.map((url) => renderMaterialCard(url))}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (activeTab === 'personal') {
      return renderPersonalContent();
    }
    if (activeTab === 'public-logo') {
      return renderLibraryContent('官方logo', publicLogoItems);
    }
    if (activeTab === 'public-ip') {
      return renderLibraryContent('IP人物', ipCharacterItems);
    }
    if (activeTab === 'public-campaign') {
      return renderLibraryContent('中心宣传', campaignItems);
    }
    if (activeTab === 'public-cutout') {
      return renderLibraryContent('免抠素材', cutoutItems);
    }
    return renderLibraryContent('通用运营入口banner背景图', trafficBannerItems);
  };

  const menuButtonClass = (isActive: boolean) =>
    clsx(
      "w-full flex items-center px-3.5 py-2 rounded-lg text-[13px] font-medium leading-5 transition-all",
      isActive
        ? "bg-white text-accent-primary shadow-sm ring-1 ring-gray-100"
        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
    );

  const folderTitleClass = "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[13px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-[900px] h-[600px] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0 z-20 relative">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">素材百宝箱</h2>
              <p className="text-xs text-gray-500">管理和使用您的创意素材</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <input
                type="text"
                placeholder="搜索素材..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-accent-primary/20 focus:ring-2 focus:ring-accent-primary/10 rounded-full text-sm outline-none transition-all w-64"
              />
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-800">
              <span className="text-lg leading-none">×</span>
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-56 bg-gray-50 border-r border-gray-100 flex flex-col p-4 gap-4 overflow-y-auto">
            <div className="space-y-1">
              <button onClick={() => toggleFolder('personal')} className={folderTitleClass}>
                <span>个人库</span>
                <span className={clsx("transition-transform inline-block", !expandedFolders.personal && "-rotate-90")}>⌄</span>
              </button>
              {expandedFolders.personal && (
                <div className="pl-2">
                  <button onClick={() => handleTabChange('personal')} className={menuButtonClass(activeTab === 'personal')}>
                    个人素材
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <button onClick={() => toggleFolder('public')} className={folderTitleClass}>
                <span>公共库</span>
                <span className={clsx("transition-transform inline-block", !expandedFolders.public && "-rotate-90")}>⌄</span>
              </button>
              {expandedFolders.public && (
                <div className="space-y-1 pl-2">
                  <button onClick={() => handleTabChange('public-logo')} className={menuButtonClass(activeTab === 'public-logo')}>
                    官方logo
                  </button>
                  <button onClick={() => handleTabChange('public-ip')} className={menuButtonClass(activeTab === 'public-ip')}>
                    IP人物
                  </button>
                  <button onClick={() => handleTabChange('public-campaign')} className={menuButtonClass(activeTab === 'public-campaign')}>
                    中心宣传
                  </button>
                  <button onClick={() => handleTabChange('public-cutout')} className={menuButtonClass(activeTab === 'public-cutout')}>
                    免抠素材
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <button onClick={() => toggleFolder('traffic')} className={folderTitleClass}>
                <span>流量投放素材库</span>
                <span className={clsx("transition-transform inline-block", !expandedFolders.traffic && "-rotate-90")}>⌄</span>
              </button>
              {expandedFolders.traffic && (
                <div className="pl-2">
                  <button onClick={() => handleTabChange('traffic-banner')} className={menuButtonClass(activeTab === 'traffic-banner')}>
                    通用运营入口banner背景图
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 bg-white p-6 overflow-y-auto custom-scrollbar">
            {renderContent()}
          </div>
        </div>
      </div>
      {hoverLogicText && (
        <div className="fixed inset-0 z-[60] pointer-events-none flex items-center justify-center px-6">
          <div className="max-w-xl rounded-xl border border-yellow-300/70 bg-yellow-100/80 text-yellow-950 shadow-lg backdrop-blur-sm px-5 py-4 text-sm font-medium leading-6 text-center">
            {hoverLogicText}
          </div>
        </div>
      )}
    </div>
  );
}

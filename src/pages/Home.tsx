import { useMemo, useRef, useState } from 'react';
import type { ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUp,
  Search,
  RotateCw,
  Wand2,
  Eraser,
  Scissors,
  Layers,
  FileText,
  Presentation,
  ScanFace,
  History,
  MoreHorizontal,
} from 'lucide-react';
import clsx from 'clsx';

import { useToast } from '../components/ToastProvider';
import { inspirationCategories } from './Inspiration';

export default function Home() {
  const navigate = useNavigate();
  const toast = useToast();
  const [centerMode, setCenterMode] = useState<'search' | 'generate'>('generate');
  const [searchInput, setSearchInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [selectedSize, setSelectedSize] = useState<'1080x1920' | '1920x1080' | '1080x1080' | '1200x628'>('1080x1920');
  const [seedValue, setSeedValue] = useState('');
  const [brokenInspirationImageIds, setBrokenInspirationImageIds] = useState<Set<string>>(() => new Set());

  const purple = useMemo(
    () => ({
      solid: '#8F7AFB',
      solidHover: '#7C67F5',
      softBg: 'rgba(143, 122, 251, 0.12)',
      softBgHover: 'rgba(143, 122, 251, 0.18)',
      softBorder: 'rgba(143, 122, 251, 0.25)',
      text: '#6F58F3',
    }),
    []
  );

  const resolvedSize = useMemo(() => {
    const [w, h] = selectedSize.split('x').map((n) => Number(n));
    return { width: w || 1080, height: h || 1920 };
  }, [selectedSize]);

  const handleChatSubmit = () => {
    const q = chatInput.trim();
    if (!q) return;
    const params = new URLSearchParams();
    params.set('q', q);
    params.set('width', String(resolvedSize.width));
    params.set('height', String(resolvedSize.height));
    if (seedValue.trim()) params.set('seed', seedValue.trim());
    const path = `/public-canvas?${params.toString()}`;
    const url = `${window.location.origin}${import.meta.env.BASE_URL}#${path}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const submitSearch = (value: string) => {
    const q = value.trim();
    if (!q) return;
    navigate(`/public?module=projects&q=${encodeURIComponent(q)}`);
  };

  const handleSearchSubmit = () => {
    submitSearch(searchInput);
  };
  
  const toolIconClass = "bg-transparent hover:bg-gray-50 text-gray-900";

  const commonSearchKeywords = useMemo(() => ['国庆节', '培训海报', '坐席图', '招聘', '粘土风', '中秋'], []);

  const aiTools = useMemo(
    () => [
      { icon: Wand2, label: 'AI 改图', path: '/tools/ai-edit' },
      { icon: Eraser, label: 'AI 擦除', path: '/tools/ai-erase' },
      { icon: Scissors, label: 'AI 抠图', path: '/tools/ai-matting' },
      { icon: Layers, label: 'AI 溶图', path: '/tools/ai-blend' },
      { icon: FileText, label: 'md2Card', path: '/tools/md2card' },
      { icon: Presentation, label: 'PPT 生成', path: '/tools/ppt-gen' },
      { icon: ScanFace, label: '证件照生成', path: '/tools/id-photo' },
      { icon: History, label: '老照片修复', path: '/tools/old-photo' },
      { icon: MoreHorizontal, label: '结构化海报', path: '' },
    ],
    []
  );

  const backgroundInspirationItems = useMemo(() => {
    const category = inspirationCategories.find((c) => c.id === 'backgrounds');
    const items = Array.isArray(category?.items) ? category!.items : [];
    return items.filter((item: any) => typeof item?.prompt === 'string' && (typeof item?.imageUrl === 'string' || typeof item?.image === 'string'));
  }, []);

  const publicTemplateCommunityItems = useMemo(
    () => [
      {
        id: 'public-1',
        title: '双11 电商大促主视觉',
        previewUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
        authorName: '社区作者A',
        width: 1920,
        height: 1080,
      },
      {
        id: 'public-2',
        title: '春节 新品发布长图',
        previewUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80',
        authorName: '社区作者B',
        width: 1080,
        height: 1920,
      },
      {
        id: 'public-3',
        title: '情人节 品牌KV留白版',
        previewUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80',
        authorName: '社区作者C',
        width: 1920,
        height: 1080,
      },
      {
        id: 'public-4',
        title: '母亲节 活动海报模板',
        previewUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1200&q=80',
        authorName: '社区作者D',
        width: 1242,
        height: 2208,
      },
      {
        id: 'public-5',
        title: '端午 节日促销海报（国潮）',
        previewUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80',
        authorName: '社区作者E',
        width: 1242,
        height: 2208,
      },
      {
        id: 'public-6',
        title: '招聘 H5 竖版长图',
        previewUrl: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1200&q=80',
        authorName: '社区作者F',
        width: 1080,
        height: 1920,
      },
      {
        id: 'public-7',
        title: '培训通知 会议海报',
        previewUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=80',
        authorName: '社区作者G',
        width: 1080,
        height: 1920,
      },
      {
        id: 'public-8',
        title: '国庆 红金风格主KV',
        previewUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80',
        authorName: '社区作者H',
        width: 1920,
        height: 1080,
      },
    ],
    []
  );

  const openPublicCanvasFromTemplate = (detail: { id: string; title: string; previewUrl: string }) => {
    const params = new URLSearchParams();
    params.set('src', detail.previewUrl);
    params.set('name', detail.title);
    params.set('id', detail.id);
    params.set('q', detail.title);
    const path = `/public-canvas?${params.toString()}`;
    const url = `${window.location.origin}${import.meta.env.BASE_URL}#${path}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-white via-white to-purple-50/40"
      style={{
        ['--home-tool-bg' as any]: purple.softBg,
        ['--home-tool-bg-hover' as any]: purple.softBgHover,
        ['--home-tool-border' as any]: purple.softBorder,
        ['--home-tool-border-hover' as any]: 'rgba(143, 122, 251, 0.38)',
        ['--home-tool-fg' as any]: purple.text,
      }}
    >
      <div className="max-w-[1120px] mx-auto px-6 pt-12 pb-12 space-y-8">
        <header className="flex flex-col items-center text-center gap-1">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-950">Deepcanvas</h1>
          <div className="text-lg md:text-xl font-semibold text-gray-700 max-w-[720px] leading-snug">让设计更简单</div>
        </header>

        <section className="rounded-3xl bg-white border border-black/5 shadow-sm">
          <div className="p-5 md:p-6 flex flex-col items-center text-center gap-2">
            <div className="inline-flex items-center rounded-full p-1 bg-gray-100">
              <button
                type="button"
                onClick={() => setCenterMode('search')}
                className={clsx(
                  'h-9 px-4 rounded-full text-sm font-semibold transition-colors',
                  centerMode === 'search' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                )}
                aria-selected={centerMode === 'search'}
              >
                搜索
              </button>
              <button
                type="button"
                onClick={() => setCenterMode('generate')}
                className={clsx(
                  'h-9 px-4 rounded-full text-sm font-semibold transition-colors',
                  centerMode === 'generate' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                )}
                aria-selected={centerMode === 'generate'}
              >
                生图
              </button>
            </div>
            <div className="text-xs text-gray-500">
              {centerMode === 'search' ? '在公共模板里搜关键词' : '输入提示词，点击发送进入无限画布'}
            </div>
          </div>

          <div className="p-5 md:p-6">
            {centerMode === 'search' ? (
              <div className="relative">
                <input
                  placeholder="搜索公共模板，例如：母亲节海报 / 小狗 / 红金风格"
                  className="w-full h-12 pl-11 pr-24 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all"
                  style={{
                    ['--tw-ring-color' as any]: purple.softBg,
                    ['--tw-ring-opacity' as any]: '1',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = purple.softBorder;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '';
                  }}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchSubmit();
                    }
                  }}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Search size={18} />
                </div>
                <button
                  onClick={handleSearchSubmit}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-4 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!searchInput.trim()}
                  style={{ backgroundColor: purple.solid }}
                  onMouseEnter={(e) => {
                    if ((e.currentTarget as HTMLButtonElement).disabled) return;
                    e.currentTarget.style.backgroundColor = purple.solidHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = purple.solid;
                  }}
                >
                  搜索
                </button>
                <div className="mt-3 flex flex-wrap gap-2">
                  {commonSearchKeywords.map((keyword) => {
                    const isActive = searchInput.trim() === keyword;
                    return (
                      <button
                        key={keyword}
                        type="button"
                        onClick={() => {
                          setSearchInput(keyword);
                          submitSearch(keyword);
                        }}
                        className={clsx(
                          'h-8 px-3 rounded-full border text-xs font-semibold transition-colors',
                          isActive ? 'text-gray-900' : 'bg-gray-50 text-gray-700 border-black/5 hover:bg-gray-100'
                        )}
                        style={
                          isActive
                            ? { backgroundColor: purple.softBg, borderColor: purple.softBorder }
                            : undefined
                        }
                      >
                        {keyword}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="relative rounded-3xl border overflow-hidden bg-white shadow-[0_18px_60px_-35px_rgba(88,28,135,0.45)]" style={{ borderColor: purple.softBorder }}>
                <textarea
                  ref={chatInputRef}
                  placeholder="例如：帮我生成一张母亲节营销海报，风格清爽高级，渠道小红书，品牌色紫，包含 CTA 按钮"
                  className="w-full min-h-[148px] pt-4 pb-16 px-5 bg-white focus:outline-none focus:ring-4 text-sm text-gray-900 placeholder:text-gray-400 transition-all resize-none leading-snug"
                  style={{
                    backgroundColor: '#ffffff',
                    ['--tw-ring-color' as any]: purple.softBg,
                    ['--tw-ring-opacity' as any]: '1',
                  }}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleChatSubmit();
                    }
                  }}
                />
                <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between gap-3">
                  <div className="h-10 inline-flex items-center gap-2 px-3 rounded-2xl bg-gray-50 border border-black/5">
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value as any)}
                      className="h-8 text-xs font-semibold text-gray-700 bg-transparent outline-none"
                      aria-label="尺寸"
                    >
                      <option value="1080x1920">1080×1920 px</option>
                      <option value="1920x1080">1920×1080 px</option>
                      <option value="1080x1080">1080×1080 px</option>
                      <option value="1200x628">1200×628 px</option>
                    </select>
                    <div className="w-px h-5 bg-black/10" />
                    <input
                      value={seedValue}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === '' || /^\d+$/.test(v)) setSeedValue(v);
                      }}
                      placeholder="seed"
                      className="w-24 h-8 text-xs font-semibold text-gray-700 bg-transparent outline-none placeholder:text-gray-400"
                      inputMode="numeric"
                      aria-label="随机种子"
                    />
                    <button
                      type="button"
                      onClick={() => setSeedValue(String(Math.floor(Math.random() * 1_000_000_000)))}
                      className="w-8 h-8 rounded-xl text-gray-500 flex items-center justify-center transition-colors"
                      aria-label="随机生成种子"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = purple.softBg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <RotateCw size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 text-xs font-semibold" style={{ color: purple.text }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: purple.solid }} />
                      <span>Ctrl+Enter 发送</span>
                    </div>
                    <button
                      onClick={handleChatSubmit}
                      className="w-11 h-11 rounded-2xl text-white flex items-center justify-center transition-colors shadow-[0_12px_28px_-12px_rgba(88,28,135,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!chatInput.trim()}
                      aria-label="发送"
                      style={{ backgroundColor: purple.solid }}
                      onMouseEnter={(e) => {
                        if ((e.currentTarget as HTMLButtonElement).disabled) return;
                        e.currentTarget.style.backgroundColor = purple.solidHover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = purple.solid;
                      }}
                    >
                      <ArrowUp size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="pt-6 border-t border-black/5">
          <div className="flex items-end justify-between gap-3 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: purple.solid }} />
                <div className="text-base font-semibold text-gray-900">玩转 AI 工具</div>
              </div>
              <div className="text-sm text-gray-500">常用小工具入口，一键直达</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2">
              {aiTools.map((t) => (
                <ToolIcon
                  key={t.label}
                  icon={t.icon}
                  label={t.label}
                  className={toolIconClass}
                  onClick={() => {
                    if (!t.path) {
                      toast.show('结构化海报功能开发中');
                      return;
                    }
                    navigate(t.path);
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {centerMode === 'search' ? (
          <section className="pt-6 border-t border-black/5 space-y-4">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <div className="text-base font-semibold text-gray-900">公共模板社区</div>
                <div className="text-sm text-gray-500">直接浏览社区热门模板，点开即可在无限画布里编辑</div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/public?module=projects')}
                className="h-9 px-4 rounded-full text-sm font-semibold bg-white border border-black/5 text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
              >
                去社区看看
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {publicTemplateCommunityItems.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col gap-2 cursor-pointer"
                  onClick={() => openPublicCanvasFromTemplate(item)}
                >
                  <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                    <img src={item.previewUrl} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPublicCanvasFromTemplate(item);
                        }}
                        className="pointer-events-auto px-4 py-2 rounded-full bg-white text-gray-900 text-sm font-semibold shadow-lg"
                        aria-label="使用该模板"
                      >
                        使用该模板
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                      {item.authorName.trim().slice(0, 1)}
                    </div>
                    <span className="text-xs text-gray-500 truncate flex-1">{item.authorName}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="pt-6 border-t border-black/5 space-y-4">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <div className="text-base font-semibold text-gray-900">提示词灵感</div>
                <div className="text-sm text-gray-500">不会写提示词？这里有为你准备好的背景底图～</div>
              </div>
            </div>

            <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
              {backgroundInspirationItems.map((item: any) => {
                const isBroken = brokenInspirationImageIds.has(item.id);
                return (
                  <div key={item.id} className="mb-4 break-inside-avoid">
                    <div className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white">
                      <div className={clsx('w-full aspect-[4/3]', item.imageUrl ? 'bg-gray-100' : item.image)}>
                        {item.imageUrl && !isBroken ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={() => {
                              setBrokenInspirationImageIds((prev) => {
                                const next = new Set(prev);
                                next.add(item.id);
                                return next;
                              });
                            }}
                          />
                        ) : (
                          <div
                            className="w-full h-full"
                            style={{
                              background: `linear-gradient(135deg, ${purple.softBg} 0%, rgba(17, 24, 39, 0.06) 100%)`,
                            }}
                          />
                        )}
                      </div>
                      <div className="p-3 space-y-1">
                        <div className="text-xs font-semibold text-gray-900 line-clamp-1">{item.title}</div>
                        <div className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{item.prompt}</div>
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors" />
                      <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            setCenterMode('generate');
                            setChatInput(item.prompt);
                            requestAnimationFrame(() => {
                              chatInputRef.current?.focus();
                            });
                          }}
                          className="w-full h-10 rounded-xl bg-white text-gray-900 text-sm font-semibold shadow-lg"
                        >
                          使用该提示词
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function ToolIcon({ icon: Icon, label, className, onClick }: { icon: ElementType; label: string; className?: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={clsx(
        "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-colors duration-200 cursor-pointer group/icon hover:bg-[rgba(143,122,251,0.08)]",
        className
      )}
    >
      <div
        className="w-10 h-10 rounded-2xl border flex items-center justify-center transition-colors bg-[var(--home-tool-bg)] border-[var(--home-tool-border)] text-[var(--home-tool-fg)] group-hover/icon:bg-[var(--home-tool-bg-hover)] group-hover/icon:border-[var(--home-tool-border-hover)]"
      >
        <Icon size={22} strokeWidth={2.2} />
      </div>
      <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">{label}</span>
    </button>
  );
}

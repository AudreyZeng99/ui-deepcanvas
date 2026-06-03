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

  const handleSearchSubmit = () => {
    const q = searchInput.trim();
    if (!q) return;
    navigate(`/public?module=projects&q=${encodeURIComponent(q)}`);
  };
  
  const toolIconClass = "bg-transparent hover:bg-gray-50 text-gray-900";

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

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-white via-white to-purple-50/40"
      style={{
        ['--home-tool-bg' as any]: purple.softBg,
        ['--home-tool-border' as any]: purple.softBorder,
        ['--home-tool-fg' as any]: purple.text,
      }}
    >
      <div className="max-w-[1120px] mx-auto px-6 pt-20 pb-12 space-y-10">
        <header className="flex flex-col items-center text-center gap-2 pb-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-950">Deepcanvas</h1>
          <div className="text-xl md:text-2xl font-bold text-gray-900/85 max-w-[720px] leading-snug">让设计更简单</div>
        </header>

        <section className="rounded-3xl bg-white/0 mt-4">
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
              {centerMode === 'search' ? '在公共模板里搜关键词' : '写清楚需求，生成后进入无限画布'}
            </div>
          </div>

          <div className="p-5 md:p-6">
            {centerMode === 'search' ? (
              <div className="relative">
                <input
                  placeholder="搜索公共模板，例如：母亲节 海报 红金"
                  className="w-full h-14 pl-12 pr-28 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-4 text-base text-gray-900 placeholder:text-gray-400 transition-all"
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-4 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>
            ) : (
              <div className="relative">
                <textarea
                  ref={chatInputRef}
                  placeholder="告诉我你想设计什么，例如：帮我生成一张母亲节营销海报...\n也可以补充：目标人群/渠道/版式/风格/品牌色/CTA"
                  className="w-full min-h-[180px] pt-5 pb-16 px-5 rounded-3xl border shadow-[0_18px_60px_-35px_rgba(88,28,135,0.45)] focus:outline-none focus:ring-4 text-base text-gray-900 placeholder:text-gray-400 transition-all resize-none leading-relaxed"
                  style={{
                    borderColor: purple.softBorder,
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
                <div className="absolute left-4 bottom-4 flex items-center gap-2">
                  <div
                    className="h-10 flex items-center gap-2 px-3 rounded-xl bg-white/80 backdrop-blur border shadow-sm"
                    style={{ borderColor: purple.softBorder }}
                  >
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
                    <div className="w-px h-5 bg-gray-200" />
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
                      className="w-8 h-8 rounded-lg text-gray-500 flex items-center justify-center transition-colors"
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
                </div>
                <button
                  onClick={handleChatSubmit}
                  className="absolute right-4 bottom-4 w-11 h-11 rounded-2xl text-white flex items-center justify-center transition-colors shadow-[0_12px_28px_-12px_rgba(88,28,135,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
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
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-white/0">
          <div className="p-5 md:p-6 flex items-end justify-between gap-3 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: purple.solid }} />
                <div className="text-sm font-semibold text-gray-900">玩转 AI 工具</div>
              </div>
              <div className="text-xs text-gray-500">常用小工具入口，一键直达</div>
            </div>
          </div>
          <div className="px-5 md:px-6 pb-6">
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
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

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="text-lg font-semibold text-gray-900">提示词灵感</div>
              <div className="text-sm text-gray-500">不会写提示词？这里有为你准备好的背景底图～</div>
            </div>
          </div>

          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {backgroundInspirationItems.map((item: any) => {
              const isBroken = brokenInspirationImageIds.has(item.id);
              return (
                <div key={item.id} className="mb-4 break-inside-avoid">
                  <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className={clsx('w-full', item.imageUrl ? 'aspect-[4/3]' : 'aspect-[4/3]', item.imageUrl ? 'bg-gray-100' : item.image)}>
                      {item.imageUrl && !isBroken && (
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
        "flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl transition-all duration-200 cursor-pointer group/icon",
        className
      )}
    >
      <div
        className="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors"
        style={{
          backgroundColor: 'var(--home-tool-bg, rgba(147, 51, 234, 0.10))',
          borderColor: 'var(--home-tool-border, rgba(147, 51, 234, 0.22))',
          color: 'var(--home-tool-fg, #7E22CE)',
        }}
      >
        <Icon size={20} />
      </div>
      <span className="text-[11px] font-semibold text-gray-700 whitespace-nowrap">{label}</span>
    </button>
  );
}

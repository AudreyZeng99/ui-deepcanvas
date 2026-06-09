import { useEffect, useMemo, useRef, useState } from 'react';
import type { ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUp,
  Search,
  RotateCw,
  Sparkles,
  ChevronDown,
  X,
  Wand2,
  Eraser,
  Scissors,
  Layers,
  FileText,
  PencilLine,
  ScanFace,
  History,
  MoreHorizontal,
} from 'lucide-react';
import clsx from 'clsx';

import { Tooltip } from '../components/Tooltip';
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
  const [isPromptReferenceOpen, setIsPromptReferenceOpen] = useState(false);
  const [activePromptReferenceGroupId, setActivePromptReferenceGroupId] = useState<'subject' | 'background' | 'poster' | 'quality'>('subject');
  const [activePromptReferenceCategoryId, setActivePromptReferenceCategoryId] = useState('people');
  const promptReferencePanelRef = useRef<HTMLDivElement | null>(null);
  const promptReferenceButtonRef = useRef<HTMLButtonElement | null>(null);

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

  const openInNewTab = (path: string) => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const url = `${window.location.origin}${import.meta.env.BASE_URL}#${normalized}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const commonSearchKeywords = useMemo(() => ['国庆节', '培训海报', '坐席图', '招聘', '粘土风', '中秋'], []);

  const aiTools = useMemo(
    () => [
      { icon: Wand2, label: 'AI 改图', desc: '一键调整风格与版式', tooltip: '风格/尺寸一键调整', path: '/tools/ai-edit', tone: 'primary' as const },
      { icon: Eraser, label: 'AI 擦除', desc: '去路人 / 去杂物 / 去水印', tooltip: '圈选即可去除', path: '/tools/ai-erase', tone: 'rose' as const },
      { icon: Scissors, label: 'AI 抠图', desc: '一键去背景，保主体', tooltip: '人像/商品去背景', path: '/tools/ai-matting', tone: 'amber' as const },
      { icon: Layers, label: 'AI 溶图', desc: '两图自然融合更好看', tooltip: '拼贴更自然', path: '/tools/ai-blend', tone: 'sky' as const },
      { icon: FileText, label: 'md2Card', desc: '把文章变成海报卡片', tooltip: 'Markdown 转卡片图', path: '/tools/md2card', tone: 'slate' as const },
      { icon: PencilLine, label: 'AI 文案', desc: '标题卖点一键润色改写', tooltip: '文案优化/改写', path: '/tools/ai-copy', openInNewTab: true, tone: 'mint' as const },
      { icon: ScanFace, label: '证件照生成', desc: '换底色 / 裁切 / 规格', tooltip: '证件照一键生成', path: '/tools/id-photo', tone: 'sky' as const },
      { icon: History, label: '老照片修复', desc: '变清晰 / 去噪 / 上色', tooltip: '修复模糊旧照', path: '/tools/old-photo', tone: 'amber' as const },
      { icon: MoreHorizontal, label: '结构化海报', desc: '输入要点，一键出版式', tooltip: '要点 → 海报版式', path: '', tone: 'slate' as const },
    ],
    []
  );

  const backgroundInspirationItems = useMemo(() => {
    const category = inspirationCategories.find((c) => c.id === 'backgrounds');
    const items = Array.isArray(category?.items) ? category!.items : [];
    return items.filter((item: any) => typeof item?.prompt === 'string' && (typeof item?.imageUrl === 'string' || typeof item?.image === 'string'));
  }, []);

  const promptReferenceGroups = useMemo(
    () => [
      {
        id: 'subject' as const,
        label: '主体内容',
        categories: [
          {
            id: 'people',
            label: '人物',
            items: ['职业装', 'POLO衫', '短发', '棕色头发', '大眼睛', '自然微笑', '青年女性', '青年男性', '半身人像', '正面站姿', '商务手势', '精致妆容'],
          },
          {
            id: 'action',
            label: '动作',
            items: ['站立展示', '手持手机', '双手持卡', '微笑看镜头', '交流沟通', '步行动态', '坐姿办公', '指向画面', '握手', '讲解姿态', '自然互动', '服务引导'],
          },
          {
            id: 'clothing',
            label: '服饰',
            items: ['银行制服', '白衬衫', '西装外套', '丝巾', '工牌', '休闲商务', '蓝色工装', '卡其风衣', '针织上衣', '轻职场穿搭', '高跟鞋', '皮鞋'],
          },
          {
            id: 'product',
            label: '产品主体',
            items: ['手机界面', '银行卡', '贷款产品海报', '宣传折页', '金融图标', '礼盒', '红包', '积分权益', '理财卡片', '优惠券', 'App 页面', '数据看板'],
          },
        ],
      },
      {
        id: 'background' as const,
        label: '背景内容',
        categories: [
          {
            id: 'sky',
            label: '天空天气',
            items: ['天空', '蓝天', '白云', '云朵', '日落晚霞', '清晨阳光', '雨后天晴', '黄昏天空', '晨雾', '晴朗天气', '夜空', '微风感'],
          },
          {
            id: 'space',
            label: '空间场景',
            items: ['银行大厅', '办公区', '会议室', '城市街景', '商场中庭', '地铁通道', '咖啡馆', '橱窗前', '展厅空间', '户外广场', '校园场景', '社区街道'],
          },
          {
            id: 'environment',
            label: '环境元素',
            items: ['玻璃幕墙', '植物绿植', '金属装饰', '大理石地面', '木质桌面', '渐变背景', '纯色背景', '几何背景', '柔和光斑', '漂浮粒子', '水滴质感', '云层纹理'],
          },
          {
            id: 'festival',
            label: '节日氛围',
            items: ['春节场景', '端午元素', '中秋月亮', '国庆红旗', '圣诞灯串', '七夕浪漫', '毕业季', '开学季', '双11电商氛围', '618促销氛围', '年会舞台', '庆典氛围'],
          },
        ],
      },
      {
        id: 'poster' as const,
        label: '海报素材',
        categories: [
          {
            id: 'layout',
            label: '版式构图',
            items: ['居中构图', '左右分栏', '上下分区', '大标题留白', '信息卡片布局', '三分法构图', '对称排版', '对角线构图', '海报主视觉', 'KV 大图布局', '文字排版区域', '底部 CTA 区域'],
          },
          {
            id: 'graphic',
            label: '装饰素材',
            items: ['渐变光斑', '几何图形', '波浪线条', '发光圆环', '科技网格', '玻璃拟态卡片', '立体几何块', '金属徽章', '漂浮标签', '数字粒子', '品牌图标', '箭头引导'],
          },
          {
            id: 'marketing',
            label: '营销元素',
            items: ['优惠标签', '限时抢购', '爆款推荐', '新品上市', '活动倒计时', '扫码入口', '按钮 CTA', '福利权益', '礼赠信息', '品牌 slogan', '数据亮点', '转化引导'],
          },
          {
            id: 'material',
            label: '材质质感',
            items: ['玻璃质感', '金属质感', '磨砂材质', '纸张纹理', '丝绸纹理', '皮革质感', '亚克力', '水晶透明', '珠光质感', '颗粒噪点', '半透明叠层', '反射高光'],
          },
        ],
      },
      {
        id: 'quality' as const,
        label: '画质氛围',
        categories: [
          {
            id: 'style',
            label: '整体风格',
            items: ['清爽高级', '极简', '轻奢', '科技感', '国潮红金', '杂志封面', '摄影写实', '品牌海报风', '电商主视觉', '插画风', '3D 粘土', '高级商业摄影'],
          },
          {
            id: 'color',
            label: '色彩体系',
            items: ['品牌紫', '蓝白配色', '黑金', '红金', '奶油色', '莫兰迪', '低饱和', '高对比', '冷色调', '暖色调', '荧光撞色', '高级灰'],
          },
          {
            id: 'light',
            label: '光影镜头',
            items: ['柔光', '自然光', '侧逆光', '轮廓光', '电影感打光', '棚拍打光', '通透感', '背景虚化', '浅景深', '广角镜头', '特写镜头', '超清 8K'],
          },
          {
            id: 'mood',
            label: '情绪氛围',
            items: ['温暖治愈', '年轻活力', '商务专业', '信任感', '节日喜庆', '梦幻浪漫', '冷静高级', '未来科技', '松弛自然', '高级时尚', '品质感', '大气留白'],
          },
        ],
      },
    ],
    []
  );

  const activePromptReferenceGroup = useMemo(() => {
    return promptReferenceGroups.find((group) => group.id === activePromptReferenceGroupId) ?? promptReferenceGroups[0];
  }, [activePromptReferenceGroupId, promptReferenceGroups]);

  const activePromptReferenceCategory = useMemo(() => {
    return activePromptReferenceGroup.categories.find((category) => category.id === activePromptReferenceCategoryId) ?? activePromptReferenceGroup.categories[0];
  }, [activePromptReferenceCategoryId, activePromptReferenceGroup]);

  const insertPromptFragment = (fragment: string) => {
    const el = chatInputRef.current;
    if (!el) {
      setChatInput((prev) => {
        const trimmed = prev.trimEnd();
        if (!trimmed) return fragment;
        if (/[，,\n ]$/.test(trimmed)) return `${prev}${fragment}`;
        return `${prev}，${fragment}`;
      });
      return;
    }
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const current = el.value;
    const before = current.slice(0, start);
    const after = current.slice(end);
    const normalizedBefore = before.trimEnd();
    const separator = !normalizedBefore ? '' : /[，,\n ]$/.test(before) ? '' : '，';
    const next = `${before}${separator}${fragment}${after}`;
    setChatInput(next);
    requestAnimationFrame(() => {
      el.focus();
      const nextPos = (before + separator + fragment).length;
      el.setSelectionRange(nextPos, nextPos);
    });
  };

  useEffect(() => {
    if (!isPromptReferenceOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (promptReferencePanelRef.current && promptReferencePanelRef.current.contains(target)) return;
      if (promptReferenceButtonRef.current && promptReferenceButtonRef.current.contains(target)) return;
      setIsPromptReferenceOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPromptReferenceOpen]);

  useEffect(() => {
    if (!activePromptReferenceGroup.categories.some((category) => category.id === activePromptReferenceCategoryId)) {
      setActivePromptReferenceCategoryId(activePromptReferenceGroup.categories[0]?.id ?? '');
    }
  }, [activePromptReferenceCategoryId, activePromptReferenceGroup]);

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
      className="min-h-screen bg-[#FAFAFB]"
      style={{
        ['--home-tool-bg' as any]: purple.softBg,
        ['--home-tool-bg-hover' as any]: purple.softBgHover,
        ['--home-tool-border' as any]: purple.softBorder,
        ['--home-tool-border-hover' as any]: 'rgba(143, 122, 251, 0.38)',
        ['--home-tool-fg' as any]: purple.text,
      }}
    >
      <div className="max-w-[1120px] mx-auto px-6 pt-12 pb-12 space-y-8">
        <header className="flex flex-col items-center text-center gap-2">
          <div className="inline-flex items-center justify-center gap-3">
            <div
              className="w-20 h-20 md:w-[84px] md:h-[84px] rounded-full border border-black/5 flex items-center justify-center"
              style={{
                backgroundColor: centerMode === 'search' ? purple.softBg : purple.solid,
                borderColor: centerMode === 'search' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(143, 122, 251, 0.35)',
              }}
            >
              <img
                src={`${import.meta.env.BASE_URL}figure/${centerMode === 'search' ? 'blue-cloud-v2.png' : 'cloud-white.png'}`}
                alt=""
                className="w-16 h-16 md:w-[68px] md:h-[68px] object-contain"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-950">Deepcanvas</h1>
          </div>
          <div className="text-lg md:text-xl font-semibold text-gray-700 max-w-[720px] leading-snug">让设计更简单</div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-white border border-black/5 text-xs font-semibold text-gray-700 shadow-sm">
              <Search size={14} className="text-[#8F7AFB]" />
              公共模板搜索
            </div>
            <div className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-white border border-black/5 text-xs font-semibold text-gray-700 shadow-sm">
              <Sparkles size={14} className="text-[#34D399]" />
              一键生成灵感
            </div>
            <div className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-white border border-black/5 text-xs font-semibold text-gray-700 shadow-sm">
              <Layers size={14} className="text-[#38BDF8]" />
              无限画布编辑
            </div>
          </div>
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
              <div className="space-y-3">
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
                </div>
                <div className="flex flex-wrap gap-2">
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
              <div className="space-y-3">
                <div className="relative z-10 rounded-3xl border bg-white shadow-[0_18px_60px_-35px_rgba(88,28,135,0.45)] overflow-hidden" style={{ borderColor: purple.softBorder }}>
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

                <div className="flex items-center justify-between gap-3">
                  <button
                    ref={promptReferenceButtonRef}
                    type="button"
                    onClick={() => setIsPromptReferenceOpen((prev) => !prev)}
                    className={clsx(
                      "h-9 px-4 rounded-full text-sm font-semibold border transition-colors inline-flex items-center gap-2",
                      isPromptReferenceOpen ? "hover:opacity-90" : "bg-white text-gray-700 border-black/10 hover:bg-gray-50"
                    )}
                    style={
                      isPromptReferenceOpen
                        ? {
                            color: 'var(--accent-primary)',
                            backgroundColor: 'color-mix(in srgb, var(--accent-primary) 10%, white)',
                            borderColor: 'color-mix(in srgb, var(--accent-primary) 35%, transparent)',
                          }
                        : undefined
                    }
                    aria-expanded={isPromptReferenceOpen}
                    aria-label="打开提示词参考"
                  >
                    <Sparkles size={16} />
                    <span>提示词参考</span>
                    <ChevronDown size={16} className={clsx("transition-transform", isPromptReferenceOpen && "rotate-180")} />
                  </button>
                  <div className="text-xs text-gray-500">点选关键词，自动填入提示词</div>
                </div>

                {isPromptReferenceOpen && (
                  <div
                    ref={promptReferencePanelRef}
                    className="rounded-2xl bg-white border border-black/10 shadow-[0_16px_50px_rgba(0,0,0,0.12)] overflow-hidden"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-900">提示词参考</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">按分类挑选关键词组合更完整的描述</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsPromptReferenceOpen(false)}
                        className="w-9 h-9 rounded-xl hover:bg-black/5 text-gray-500 flex items-center justify-center transition-colors"
                        aria-label="关闭提示词参考"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="px-4 pt-3 pb-3 border-b border-black/5">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {promptReferenceGroups.map((group) => {
                          const isActive = group.id === activePromptReferenceGroupId;
                          return (
                            <button
                              key={group.id}
                              type="button"
                              onClick={() => setActivePromptReferenceGroupId(group.id)}
                              className={clsx(
                                "h-10 px-3 rounded-xl text-xs font-semibold border transition-colors",
                                isActive ? "text-white border-transparent" : "bg-white text-gray-700 border-black/10 hover:bg-gray-50"
                              )}
                              style={
                                isActive
                                  ? { backgroundColor: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }
                                  : undefined
                              }
                            >
                              {group.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex">
                      <div className="w-44 shrink-0 border-r border-black/5 bg-gray-50/60">
                        <div className="p-3">
                          <div className="grid grid-cols-1 gap-2 max-h-[320px] overflow-auto pr-1">
                            {activePromptReferenceGroup.categories.map((category) => {
                              const isActive = category.id === activePromptReferenceCategoryId;
                              return (
                                <button
                                  key={category.id}
                                  type="button"
                                  onClick={() => setActivePromptReferenceCategoryId(category.id)}
                                  className={clsx(
                                    "w-full px-3 py-2 rounded-xl text-left text-xs font-semibold border transition-colors",
                                    isActive ? "bg-white border-transparent shadow-sm" : "bg-white/70 text-gray-700 border-black/10 hover:bg-white"
                                  )}
                                  style={
                                    isActive
                                      ? {
                                          color: 'var(--accent-primary)',
                                          borderColor: 'color-mix(in srgb, var(--accent-primary) 35%, transparent)',
                                        }
                                      : undefined
                                  }
                                >
                                  {category.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 px-4 py-4">
                        <div className="mb-2 text-[11px] font-semibold text-gray-500">
                          {activePromptReferenceGroup.label} / {activePromptReferenceCategory.label}
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-[320px] overflow-auto pr-1">
                          {activePromptReferenceCategory.items.map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => insertPromptFragment(item)}
                              className="h-8 px-3 rounded-xl border text-xs font-semibold transition-colors"
                              style={{
                                color: 'var(--accent-primary)',
                                backgroundColor: 'color-mix(in srgb, var(--accent-primary) 7%, white)',
                                borderColor: 'color-mix(in srgb, var(--accent-primary) 24%, transparent)',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--accent-primary) 12%, white)';
                                e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent-primary) 36%, transparent)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--accent-primary) 7%, white)';
                                e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent-primary) 24%, transparent)';
                              }}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                  desc={t.desc}
                  tooltip={t.tooltip}
                  tone={t.tone}
                  onClick={() => {
                    if (!t.path) {
                      toast.show('结构化海报功能开发中');
                      return;
                    }
                    if (t.openInNewTab) {
                      openInNewTab(t.path);
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
              <button
                type="button"
                onClick={() => navigate('/inspiration')}
                className="h-9 px-4 rounded-full text-sm font-semibold bg-white border border-black/5 text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
              >
                前往灵感页面浏览更多
              </button>
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
                              backgroundColor: purple.softBg,
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

function ToolIcon({
  icon: Icon,
  label,
  desc,
  tooltip,
  tone = 'primary',
  className,
  onClick,
}: {
  icon: ElementType;
  label: string;
  desc?: string;
  tooltip?: string;
  tone?: 'primary' | 'mint' | 'amber' | 'sky' | 'rose' | 'slate';
  className?: string;
  onClick?: () => void;
}) {
  const toneVars = {
    primary: {
      cardHover: 'rgba(143, 122, 251, 0.06)',
      bg: 'rgba(143, 122, 251, 0.10)',
      bgHover: 'rgba(143, 122, 251, 0.16)',
      border: 'rgba(143, 122, 251, 0.22)',
      borderHover: 'rgba(143, 122, 251, 0.34)',
      fg: '#6F58F3',
    },
    mint: {
      cardHover: 'rgba(52, 211, 153, 0.07)',
      bg: 'rgba(52, 211, 153, 0.12)',
      bgHover: 'rgba(52, 211, 153, 0.18)',
      border: 'rgba(52, 211, 153, 0.24)',
      borderHover: 'rgba(52, 211, 153, 0.36)',
      fg: '#0F766E',
    },
    amber: {
      cardHover: 'rgba(251, 191, 36, 0.10)',
      bg: 'rgba(251, 191, 36, 0.14)',
      bgHover: 'rgba(251, 191, 36, 0.20)',
      border: 'rgba(251, 191, 36, 0.26)',
      borderHover: 'rgba(251, 191, 36, 0.40)',
      fg: '#92400E',
    },
    sky: {
      cardHover: 'rgba(56, 189, 248, 0.08)',
      bg: 'rgba(56, 189, 248, 0.12)',
      bgHover: 'rgba(56, 189, 248, 0.18)',
      border: 'rgba(56, 189, 248, 0.24)',
      borderHover: 'rgba(56, 189, 248, 0.36)',
      fg: '#0369A1',
    },
    rose: {
      cardHover: 'rgba(251, 113, 133, 0.08)',
      bg: 'rgba(251, 113, 133, 0.12)',
      bgHover: 'rgba(251, 113, 133, 0.18)',
      border: 'rgba(251, 113, 133, 0.24)',
      borderHover: 'rgba(251, 113, 133, 0.36)',
      fg: '#9F1239',
    },
    slate: {
      cardHover: 'rgba(17, 24, 39, 0.04)',
      bg: 'rgba(17, 24, 39, 0.05)',
      bgHover: 'rgba(17, 24, 39, 0.08)',
      border: 'rgba(17, 24, 39, 0.10)',
      borderHover: 'rgba(17, 24, 39, 0.14)',
      fg: '#111827',
    },
  } as const;
  const vars = toneVars[tone];
  const content = tooltip || '';
  const button = (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={clsx(
        'flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl transition-all duration-200 cursor-pointer group/icon bg-white border border-black/5 hover:bg-[var(--home-tool-card-hover)] hover:-translate-y-0.5 hover:shadow-sm',
        className
      )}
      style={{
        ['--home-tool-card-hover' as any]: vars.cardHover,
        ['--home-tool-bg' as any]: vars.bg,
        ['--home-tool-bg-hover' as any]: vars.bgHover,
        ['--home-tool-border' as any]: vars.border,
        ['--home-tool-border-hover' as any]: vars.borderHover,
        ['--home-tool-fg' as any]: vars.fg,
      }}
    >
      <div
        className="w-10 h-10 rounded-2xl border flex items-center justify-center transition-colors bg-[var(--home-tool-bg)] border-[var(--home-tool-border)] text-[var(--home-tool-fg)] group-hover/icon:bg-[var(--home-tool-bg-hover)] group-hover/icon:border-[var(--home-tool-border-hover)]"
      >
        <Icon size={22} strokeWidth={2.2} />
      </div>
      <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">{label}</span>
      {desc ? (
        <span className="text-[11px] text-gray-500 leading-snug text-center line-clamp-1 px-0.5">{desc}</span>
      ) : null}
    </button>
  );
  return content ? (
    <Tooltip content={content} position="top">
      {button}
    </Tooltip>
  ) : (
    button
  );
}

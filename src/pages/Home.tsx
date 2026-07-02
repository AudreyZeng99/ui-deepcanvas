import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUp,
  RotateCw,
  Sparkles,
  ChevronDown,
  X,
} from 'lucide-react';
import clsx from 'clsx';

import { inspirationCategories } from './Inspiration';

type SearchChannelId = 'seat' | 'mobileBank' | 'portalPromo' | 'internalEvent' | 'partyBuilding' | 'more';

type SearchScenario = {
  id: string;
  title: string;
  description: string;
  sizeHint: string;
  previewUrl: string;
};

type SearchChannel = {
  id: SearchChannelId;
  label: string;
  ink: string;
  description: string;
  sizeHint: string;
  scenarios: SearchScenario[];
};

type HomeTemplateDetail = {
  id: string;
  title: string;
  previewUrl: string;
  authorName: string;
  width: number;
  height: number;
  scene: string;
};

export default function Home() {
  const navigate = useNavigate();
  const [centerMode, setCenterMode] = useState<'search' | 'generate'>('search');
  const [activeSearchChannelId, setActiveSearchChannelId] = useState<SearchChannelId | null>(null);
  const [activeSearchScenarioId, setActiveSearchScenarioId] = useState<string | null>(null);
  const [activeHomeTemplateDetail, setActiveHomeTemplateDetail] = useState<HomeTemplateDetail | null>(null);
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

  const submitSearch = (channelLabel: string, scenarioTitle: string) => {
    if (channelLabel === '图层模板库') {
      navigate('/layer-library');
      return;
    }
    const params = new URLSearchParams();
    params.set('channel', channelLabel);
    params.set('scene', scenarioTitle);
    params.set('keyword', scenarioTitle);
    navigate(`/templates?${params.toString()}`);
  };

  const handleSearchSubmit = () => {
    if (!activeSearchChannel || !activeSearchScenario) return;
    submitSearch(activeSearchChannel.label, activeSearchScenario.title);
  };

  const searchChannels = useMemo<SearchChannel[]>(
    () => [
      {
        id: 'seat' as const,
        label: '品牌宣传',
        ink: 'text-gray-900',
        description: '适合品牌宣传、节气海报和固定栏目类微信物料。',
        sizeHint: '品牌传播 / 3:4 海报',
        scenarios: [
          {
            id: 'brand-season',
            title: '3:4节气',
            description: '适合品牌节气宣传、节点问候和常规运营更新。',
            sizeHint: '3:4 竖版',
            previewUrl: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?q=80&w=1200&auto=format&fit=crop',
          },
          {
            id: 'brand-monthly',
            title: '3:4每月你好',
            description: '适合每月固定栏目、月初问候和品牌温和露出。',
            sizeHint: '3:4 栏目海报',
            previewUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop',
          },
        ],
      },
      {
        id: 'mobileBank' as const,
        label: '手机银行',
        ink: 'text-[#2563EB]',
        description: '适合活动运营、功能上新、权益促活和 App 内投放物料。',
        sizeHint: '开屏 / 竖版 Banner',
        scenarios: [
          {
            id: 'mobile-small-banner',
            title: '小banner',
            description: '适合轻量曝光、卡片入口和低干扰运营位。',
            sizeHint: '小尺寸 Banner',
            previewUrl: 'https://images.unsplash.com/photo-1548625361-9f9392e2133f?q=80&w=1200&auto=format&fit=crop',
          },
          {
            id: 'mobile-medium-banner',
            title: '中banner',
            description: '适合常规活动宣传、权益曝光和功能推荐入口。',
            sizeHint: '中尺寸 Banner',
            previewUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop',
          },
          {
            id: 'mobile-new-medium-banner',
            title: '新-中banner',
            description: '适合新版中位资源位、重点活动和新版模块露出。',
            sizeHint: '新版中位 Banner',
            previewUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop',
          },
          {
            id: 'mobile-large-banner',
            title: '大banner',
            description: '适合主视觉曝光、重点活动和高优先级宣传位。',
            sizeHint: '大尺寸 Banner',
            previewUrl: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?q=80&w=1200&auto=format&fit=crop',
          },
          {
            id: 'mobile-home-banner',
            title: '首页banner（504x720）',
            description: '适合首页核心曝光位，强调活动转化和重点产品展示。',
            sizeHint: '504x720',
            previewUrl: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=1200&auto=format&fit=crop',
          },
        ],
      },
      {
        id: 'portalPromo' as const,
        label: '门户宣传',
        ink: 'text-[#6F58F3]',
        description: '适合门户首页横幅、专题页宣传、品牌露出和活动导流。',
        sizeHint: '横版 KV / 专题头图',
        scenarios: [
          {
            id: 'portal-festival',
            title: '节日祝福',
            description: '适合门户首页节庆氛围图、祝福横幅和节点换肤。',
            sizeHint: '横版 Banner',
            previewUrl: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=1200&auto=format&fit=crop',
          },
          {
            id: 'portal-thanks',
            title: '感谢信',
            description: '适合感谢信、荣誉致谢和对外表达类宣传内容。',
            sizeHint: '专题头图',
            previewUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1200&auto=format&fit=crop',
          },
        ],
      },
      {
        id: 'internalEvent' as const,
        label: '对内活动',
        ink: 'text-[#B45309]',
        description: '适合通知公告、培训招募、讲座宣传和内部活动视觉物料。',
        sizeHint: '长图 / 竖版通知',
        scenarios: [
          {
            id: 'internal-notice',
            title: '节日通知',
            description: '适合节日安排、放假通知和节点通知模板。',
            sizeHint: '竖版通知',
            previewUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop',
          },
          {
            id: 'internal-training',
            title: '培训',
            description: '适合讲座、课程报名、内训计划和学习活动宣传。',
            sizeHint: '讲座海报',
            previewUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop',
          },
          {
            id: 'internal-care',
            title: '员工关怀',
            description: '适合节日福利、员工活动、团建宣传和文化活动。',
            sizeHint: '活动长图',
            previewUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop',
          },
          {
            id: 'internal-party',
            title: '党建活动',
            description: '适合内部党建相关活动通知、宣传和学习活动物料。',
            sizeHint: '党建海报',
            previewUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
          },
        ],
      },
      {
        id: 'partyBuilding' as const,
        label: '营销宣传',
        ink: 'text-[#DB2777]',
        description: '适合活动营销导流、转化引导和落地页相关宣传物料。',
        sizeHint: '营销引导 / 落地页',
        scenarios: [
          {
            id: 'marketing-guide',
            title: '活动参与引导图',
            description: '适合强调参与路径、活动规则和转化引导的宣传图。',
            sizeHint: '引导海报',
            previewUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
          },
          {
            id: 'marketing-landing',
            title: '落地页',
            description: '适合活动落地页、专题承接页和完整营销页面。',
            sizeHint: '页面承接',
            previewUrl: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=1200&auto=format&fit=crop',
          },
        ],
      },
      {
        id: 'more' as const,
        label: '图层模板库',
        ink: 'text-gray-600',
        description: '进入图层模板库页面，查看并筛选图层模板。',
        sizeHint: '图层模板 / 可筛选',
        scenarios: [],
      },
    ],
    []
  );

  const activeSearchChannel = useMemo(
    () => (activeSearchChannelId ? searchChannels.find((scene) => scene.id === activeSearchChannelId) ?? null : null),
    [activeSearchChannelId, searchChannels]
  );
  const activeSearchScenario = useMemo(
    () => activeSearchChannel?.scenarios.find((scenario) => scenario.id === activeSearchScenarioId) ?? null,
    [activeSearchChannel, activeSearchScenarioId]
  );
  const handleSearchChannelToggle = (channel: SearchChannel) => {
    if (channel.id === 'more') {
      navigate('/layer-library');
      return;
    }
    if (activeSearchChannelId === channel.id) {
      setActiveSearchChannelId(null);
      setActiveSearchScenarioId(null);
      return;
    }
    setActiveSearchChannelId(channel.id);
    setActiveSearchScenarioId(channel.scenarios[0]?.id ?? null);
  };
  const handleSearchScenarioToggle = (scenarioId: string) => {
    setActiveSearchScenarioId(scenarioId);
  };

  useEffect(() => {
    if (!activeSearchChannel) return;
    if (activeSearchChannel.scenarios.some((scenario) => scenario.id === activeSearchScenarioId)) return;
    setActiveSearchScenarioId(activeSearchChannel.scenarios[0]?.id ?? null);
  }, [activeSearchChannel, activeSearchScenarioId]);

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

  const recentPublicTemplateItems = useMemo<HomeTemplateDetail[]>(
    () => {
      const recentTemplates = [
        { title: '最近制作·品牌节气海报', previewUrl: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=1200&q=80', width: 1080, height: 1440, scene: '品牌宣传' },
        { title: '最近制作·每月你好海报', previewUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80', width: 1080, height: 1440, scene: '品牌宣传' },
        { title: '最近制作·手机银行小banner', previewUrl: 'https://images.unsplash.com/photo-1548625361-9f9392e2133f?w=1200&q=80', width: 1920, height: 1080, scene: '手机银行' },
        { title: '最近制作·手机银行中banner', previewUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80', width: 1920, height: 1080, scene: '手机银行' },
        { title: '最近制作·手机银行大banner', previewUrl: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=1200&q=80', width: 1920, height: 1080, scene: '手机银行' },
        { title: '最近制作·首页banner（504x720）', previewUrl: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1200&q=80', width: 504, height: 720, scene: '手机银行' },
        { title: '最近制作·门户节日祝福', previewUrl: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?w=1200&q=80', width: 1920, height: 1080, scene: '门户宣传' },
        { title: '最近制作·门户感谢信', previewUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&q=80', width: 1920, height: 1080, scene: '门户宣传' },
        { title: '最近制作·节日通知海报', previewUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80', width: 1080, height: 1440, scene: '对内活动' },
        { title: '最近制作·培训海报', previewUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=80', width: 1080, height: 1440, scene: '对内活动' },
        { title: '最近制作·员工关怀长图', previewUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80', width: 1080, height: 1440, scene: '对内活动' },
        { title: '最近制作·党建活动海报', previewUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80', width: 1080, height: 1440, scene: '对内活动' },
        { title: '最近制作·活动参与引导图', previewUrl: 'https://images.unsplash.com/photo-1520975682031-a29e9f3492b7?w=1200&q=80', width: 1080, height: 1440, scene: '营销宣传' },
        { title: '最近制作·营销落地页', previewUrl: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=1200&q=80', width: 1080, height: 1920, scene: '营销宣传' },
        { title: '最近制作·品牌栏目海报', previewUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80', width: 1080, height: 1440, scene: '品牌宣传' },
        { title: '最近制作·专题横幅', previewUrl: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1200&q=80', width: 1920, height: 1080, scene: '门户宣传' },
        { title: '最近制作·主视觉 KV', previewUrl: 'https://images.unsplash.com/photo-1557682260-96773eb01377?w=1200&q=80', width: 1920, height: 1080, scene: '门户宣传' },
        { title: '最近制作·图文长图', previewUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1200&q=80', width: 1080, height: 1440, scene: '公共模板' },
        { title: '最近制作·活动通知模板', previewUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80', width: 1080, height: 1440, scene: '公共模板' },
        { title: '最近制作·节庆主视觉', previewUrl: 'https://images.unsplash.com/photo-1611003446057-08c35359146c?w=1200&q=80', width: 1920, height: 1080, scene: '公共模板' },
      ];
      const authors = ['社区作者A', '社区作者B', '社区作者C', '社区作者D', '社区作者E', '社区作者F'];
      return recentTemplates.map((item, index) => ({
        id: `recent-public-${index + 1}`,
        title: item.title,
        previewUrl: item.previewUrl,
        authorName: authors[index % authors.length],
        width: item.width,
        height: item.height,
        scene: item.scene,
      }));
    },
    []
  );

  const publicTemplateCommunityItems = useMemo<HomeTemplateDetail[]>(
    () => {
      if (!activeSearchChannel || !activeSearchScenario) return recentPublicTemplateItems;
      const authors = ['社区作者A', '社区作者B', '社区作者C', '社区作者D', '社区作者E', '社区作者F'];
      const relatedImages = [activeSearchScenario.previewUrl, ...activeSearchChannel.scenarios.map((item) => item.previewUrl)].filter(Boolean);
      const widthHeight =
        activeSearchScenario.title.includes('banner') || activeSearchChannel.id === 'portalPromo'
          ? { width: 1920, height: 1080 }
          : activeSearchScenario.title.includes('落地页')
            ? { width: 1080, height: 1920 }
            : { width: 1080, height: 1440 };
      const titlePool = [
        `${activeSearchScenario.title} 模板`,
        `${activeSearchChannel.label}${activeSearchScenario.title} 海报`,
        `${activeSearchScenario.title} 宣传图`,
        `${activeSearchScenario.title} 物料`,
        `${activeSearchScenario.title} 主视觉`,
        `${activeSearchScenario.title} 长图`,
      ];
      return Array.from({ length: 8 }).map((_, index) => ({
        id: `${activeSearchChannel.id}-${activeSearchScenario.id}-${index + 1}`,
        title: titlePool[index % titlePool.length],
        previewUrl: relatedImages[index % relatedImages.length],
        authorName: authors[index % authors.length],
        width: widthHeight.width,
        height: widthHeight.height,
        scene: activeSearchChannel.label,
      }));
    },
    [activeSearchChannel, activeSearchScenario, recentPublicTemplateItems]
  );

  const openPublicCanvasFromTemplate = (detail: HomeTemplateDetail) => {
    const params = new URLSearchParams();
    params.set('src', detail.previewUrl);
    params.set('name', detail.title);
    params.set('id', detail.id);
    params.set('q', detail.title);
    params.set('width', String(detail.width));
    params.set('height', String(detail.height));
    params.set('scene', detail.scene);
    const path = `/public-canvas?${params.toString()}`;
    const url = `${window.location.origin}${import.meta.env.BASE_URL}#${path}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="min-h-screen bg-background"
      style={{
        ['--home-tool-card-hover' as any]: 'rgba(143, 122, 251, 0.06)',
        ['--home-tool-bg' as any]: purple.softBg,
        ['--home-tool-bg-hover' as any]: purple.softBgHover,
        ['--home-tool-border' as any]: purple.softBorder,
        ['--home-tool-border-hover' as any]: 'rgba(143, 122, 251, 0.38)',
        ['--home-tool-fg' as any]: purple.text,
      }}
    >
      <div className="max-w-[1120px] mx-auto px-6 pt-14 pb-12 space-y-10">
        <header className="flex flex-col items-center text-center gap-3">
          <div className="inline-flex items-center justify-center gap-3">
            <div
              className="w-20 h-20 md:w-[84px] md:h-[84px] rounded-full border border-black/5 flex items-center justify-center"
              style={{
                backgroundColor: centerMode === 'search' ? purple.softBg : purple.solid,
                borderColor: centerMode === 'search' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(143, 122, 251, 0.35)',
              }}
            >
              <img
                src={`${import.meta.env.BASE_URL}figure/${centerMode === 'search' ? 'cloud-white.png' : 'blue-cloud-v2.png'}`}
                alt=""
                className="w-16 h-16 md:w-[68px] md:h-[68px] object-contain"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-gray-950">Deepcanvas 让设计更简单</h1>
          </div>
          <div className="text-sm md:text-base font-medium text-gray-600 max-w-[640px] leading-relaxed">
            新一代企业级AI创意设计工作台
          </div>
        </header>

        <section className="max-w-[760px] mx-auto">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="inline-flex items-center rounded-full p-0.5 border border-black/5 bg-white/90">
              <div className="relative group/mode">
                <button
                  type="button"
                  onClick={() => setCenterMode('search')}
                  className={clsx(
                    'h-8 px-3 rounded-full border text-xs font-semibold transition-colors',
                    centerMode === 'search'
                      ? 'border-black/10 bg-[#F7F4FF] text-[#6F58F3]'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  )}
                  aria-selected={centerMode === 'search'}
                >
                  搜索
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[280px] -translate-x-1/2 rounded-xl border border-black/5 bg-[#FCFCFD] px-3 py-2 text-left text-xs leading-relaxed text-gray-500 opacity-0 transition-opacity duration-150 group-hover/mode:opacity-100">
                  选择您的使用场景和具体内容，下方快速查看对应模板
                </div>
              </div>
              <div className="relative group/mode">
                <button
                  type="button"
                  onClick={() => setCenterMode('generate')}
                  className={clsx(
                    'h-8 px-3 rounded-full border text-xs font-semibold transition-colors',
                    centerMode === 'generate'
                      ? 'border-black/10 bg-[#F7F4FF] text-[#6F58F3]'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  )}
                  aria-selected={centerMode === 'generate'}
                >
                  生图
                </button>
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[260px] -translate-x-1/2 rounded-xl border border-black/5 bg-[#FCFCFD] px-3 py-2 text-left text-xs leading-relaxed text-gray-500 opacity-0 transition-opacity duration-150 group-hover/mode:opacity-100">
                  输入提示词，点击发送进入无限画布
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5">
            {centerMode === 'search' ? (
              <div className="space-y-5">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-9 items-center justify-center">
                    {!activeSearchChannel ? (
                      <div className="flex items-center gap-2 text-left">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: purple.text }} />
                        <span className="text-sm font-medium text-gray-700">请先选择一个使用场景</span>
                        <span className="text-[11px] text-gray-400">从下方卡片开始</span>
                      </div>
                    ) : (
                      <div className="text-[11px] font-semibold tracking-[0.18em] text-gray-400">1 使用场景（再次点击可取消勾选）</div>
                    )}
                  </div>
                  <div
                    className={clsx(
                      'relative w-full rounded-[30px] px-2 py-2 transition-all duration-300',
                      !activeSearchChannel && 'border border-black/5 bg-white/70'
                    )}
                    style={
                      !activeSearchChannel
                        ? {
                            backgroundImage:
                              'linear-gradient(180deg, rgba(250,250,252,0.96), rgba(255,255,255,0.72))',
                          }
                        : undefined
                    }
                  >
                    <div className="grid w-full grid-cols-3 gap-x-1 gap-y-2 sm:grid-cols-6">
                      {searchChannels.map((channel) => {
                        const isActive = activeSearchChannelId === channel.id;
                        const helperLabel =
                          channel.id === 'seat' || channel.id === 'mobileBank'
                            ? '推荐'
                            : channel.id === 'more'
                              ? '试用'
                              : null;
                        return (
                          <button
                            key={channel.id}
                            type="button"
                            onClick={() => handleSearchChannelToggle(channel)}
                            className={clsx(
                              'group flex flex-col items-center justify-center gap-1.5 h-[92px] rounded-2xl border border-transparent bg-transparent transition-colors',
                              'group-hover:[--scene-stroke:2.9]'
                            )}
                            aria-label={`搜索${channel.label}`}
                            style={{
                              backgroundColor: isActive ? 'rgba(143, 122, 251, 0.12)' : 'transparent',
                              ['--scene-stroke' as any]: isActive ? '2.9' : '2.4',
                            }}
                          >
                            <div className={clsx('w-11 h-11 rounded-2xl border border-transparent flex items-center justify-center bg-transparent transition-colors', channel.ink)}>
                              <SceneIllustration id={channel.id} className="w-9 h-9" />
                            </div>
                            <div
                              className={clsx(
                                'text-xs font-semibold text-gray-800 leading-none transition-colors',
                                isActive ? 'text-gray-900 font-bold' : 'group-hover:text-gray-900 group-hover:font-bold'
                              )}
                            >
                              {channel.label}
                            </div>
                            {helperLabel ? (
                              <div
                                className="text-[10px] font-medium leading-none"
                                style={{
                                  color:
                                    channel.id === 'seat'
                                      ? purple.text
                                      : channel.id === 'mobileBank'
                                        ? '#2563EB'
                                        : '#6B7280',
                                }}
                              >
                                {helperLabel}
                              </div>
                            ) : (
                              <div className="h-[10px]" aria-hidden="true" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {activeSearchChannel && activeSearchChannel.scenarios.length > 0 ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-[11px] font-semibold tracking-[0.14em] text-gray-400">2 具体内容</div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {activeSearchChannel.scenarios.map((scenario) => {
                        const isActive = activeSearchScenarioId === scenario.id;
                        return (
                          <button
                            key={scenario.id}
                            type="button"
                            onClick={() => handleSearchScenarioToggle(scenario.id)}
                            className={clsx(
                              'h-7 px-3 rounded-full border text-[11px] font-medium transition-colors',
                              isActive ? 'text-gray-900' : 'text-gray-500 border-black/5 hover:text-gray-700 hover:border-black/10'
                            )}
                            style={
                              isActive
                                ? { backgroundColor: purple.softBg, borderColor: purple.softBorder }
                                : { backgroundColor: 'rgba(255,255,255,0.55)' }
                            }
                          >
                            {scenario.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
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

        {centerMode === 'search' ? (
          <section className="pt-6 border-t border-black/5 space-y-4">
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                    <div className="text-base font-semibold text-gray-900">公共模板</div>
                <div className="text-sm text-gray-500">
                  {activeSearchChannel && activeSearchScenario
                    ? `当前展示 ${activeSearchChannel.label} / ${activeSearchScenario.title} 对应模板`
                    : '当前未筛选，展示最近制作的 20 张公共模板'}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="h-9 px-4 rounded-full text-sm font-semibold bg-white border border-black/5 text-gray-900 hover:bg-gray-50 transition-colors shadow-sm"
                disabled={!activeSearchChannel || !activeSearchScenario}
              >
                查看全部模板
              </button>
            </div>
            <div className="text-[11px] text-gray-400">
              点击任意模板卡即可开始制作
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {publicTemplateCommunityItems.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col gap-2 cursor-pointer"
                  onClick={() => setActiveHomeTemplateDetail(item)}
                >
                  <div
                    className="relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1"
                    style={{ aspectRatio: `${item.width} / ${item.height}` }}
                  >
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
                  <div className="px-1 text-xs font-semibold text-gray-900 line-clamp-1">{item.title}</div>
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

        {activeHomeTemplateDetail && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" onClick={() => setActiveHomeTemplateDetail(null)} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_120px_rgba(0,0,0,0.22)]">
                <button
                  type="button"
                  onClick={() => setActiveHomeTemplateDetail(null)}
                  className="absolute right-5 top-5 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-sm transition-colors hover:bg-white hover:text-gray-800"
                  aria-label="关闭模板详情"
                >
                  <X size={18} />
                </button>
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_360px]">
                  <div className="bg-[#F6F7FB] p-6 lg:p-8">
                    <div className="overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-sm">
                      <img
                        src={activeHomeTemplateDetail.previewUrl}
                        alt={activeHomeTemplateDetail.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col justify-between gap-6 p-6 lg:p-8">
                    <div className="space-y-6">
                      <div>
                        <div className="text-xs font-semibold tracking-wide text-gray-500">模板详情</div>
                        <div className="mt-2 text-xl font-bold text-gray-900 break-words">{activeHomeTemplateDetail.title}</div>
                        <div className="mt-2 text-sm text-gray-500">点击卡片查看详情，点击下方按钮直接开始制作。</div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-semibold tracking-wide text-gray-500">模板作者</div>
                        <div className="h-11 px-4 rounded-2xl bg-white border border-black/10 flex items-center text-sm text-gray-700">
                          {activeHomeTemplateDetail.authorName}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-semibold tracking-wide text-gray-500">模板尺寸</div>
                        <div className="h-11 px-4 rounded-2xl bg-white border border-black/10 flex items-center text-sm text-gray-700">
                          {activeHomeTemplateDetail.width}×{activeHomeTemplateDetail.height} px
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-semibold tracking-wide text-gray-500">场景类别展示</div>
                        <div className="h-11 px-4 rounded-2xl bg-white border border-black/10 flex items-center text-sm text-gray-700">
                          {activeHomeTemplateDetail.scene}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        openPublicCanvasFromTemplate(activeHomeTemplateDetail);
                        setActiveHomeTemplateDetail(null);
                      }}
                      className="w-full justify-center px-4 py-3 rounded-2xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                    >
                      使用该模板
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SceneIllustration({
  id,
  className,
}: {
  id: SearchChannelId;
  className?: string;
}) {
  const shared = {
    viewBox: '0 0 64 64',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 'var(--scene-stroke, 2.4)',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (id === 'portalPromo') {
    return (
      <svg {...shared} className={className} aria-hidden="true">
        <path d="M18 14h28a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4Z" />
        <path d="M22 22h16" opacity="0.55" />
        <path d="M22 28h20" opacity="0.55" />
        <path d="M22 34h12" opacity="0.55" />
        <path d="M41 40l2.2 4.2L48 45l-3.6 3.2.9 4.8-4.3-2.2-4.3 2.2.9-4.8L34 45l4.8-.8L41 40Z" />
      </svg>
    );
  }

  if (id === 'mobileBank') {
    return (
      <svg {...shared} className={className} aria-hidden="true">
        <path d="M24 12h16a5 5 0 0 1 5 5v30a5 5 0 0 1-5 5H24a5 5 0 0 1-5-5V17a5 5 0 0 1 5-5Z" />
        <path d="M26 18h12" opacity="0.55" />
        <path d="M24 24h16" opacity="0.55" />
        <path d="M24 30h16" opacity="0.55" />
        <path d="M24 36h11" opacity="0.55" />
        <path d="M28 49h8" />
      </svg>
    );
  }

  if (id === 'internalEvent') {
    return (
      <svg {...shared} className={className} aria-hidden="true">
        <path d="M18 20h28a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V24a4 4 0 0 1 4-4Z" />
        <path d="M20 26h15" opacity="0.55" />
        <path d="M20 32h20" opacity="0.55" />
        <path d="M20 38h12" opacity="0.55" />
        <path d="M26 42v8" />
        <path d="M38 42v8" />
        <path d="M22 52h20" />
        <path d="M46 24l4-4" />
        <path d="M48 26l4-4" opacity="0.6" />
      </svg>
    );
  }

  if (id === 'partyBuilding') {
    return (
      <svg {...shared} className={className} aria-hidden="true">
        <path d="M22 28h20v22a2 2 0 0 1-2 2H24a2 2 0 0 1-2-2V28Z" />
        <path d="M22 28h20" />
        <path d="M32 28v24" opacity="0.7" />
        <path d="M26 22c2 0 4 2 6 6-6 0-10-2-10-4 0-1.2 1.2-2 4-2Z" />
        <path d="M38 22c2.8 0 4 0.8 4 2 0 2-4 4-10 4 2-4 4-6 6-6Z" />
        <path d="M26 40h6" opacity="0.55" />
        <path d="M26 46h10" opacity="0.55" />
      </svg>
    );
  }

  if (id === 'more') {
    return (
      <svg {...shared} className={className} aria-hidden="true">
        <path d="M18 18h28a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V22a4 4 0 0 1 4-4Z" />
        <path d="M26 30h0.01" />
        <path d="M32 30h0.01" />
        <path d="M38 30h0.01" />
        <path d="M26 36h0.01" opacity="0.7" />
        <path d="M32 36h0.01" opacity="0.7" />
        <path d="M38 36h0.01" opacity="0.7" />
      </svg>
    );
  }

  return (
    <svg {...shared} className={className} aria-hidden="true">
      <path d="M18 18h28a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V22a4 4 0 0 1 4-4Z" />
      <path d="M21 26h22" opacity="0.55" />
      <path d="M21 32h22" opacity="0.55" />
      <path d="M21 38h22" opacity="0.55" />
      <path d="M22 46l6-6 6 6 6-6 2 2-8 8-6-6-6 6-2-2Z" />
    </svg>
  );
}

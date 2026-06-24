import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUp,
  Search,
  RotateCw,
  Sparkles,
  ChevronDown,
  X,
  ArrowRight,
  Lightbulb,
  MousePointerClick,
  PencilRuler,
  CheckCircle2,
} from 'lucide-react';
import clsx from 'clsx';

import { inspirationCategories } from './Inspiration';

type SearchExperienceVersion = 'a' | 'b' | 'c';
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

export default function Home() {
  const navigate = useNavigate();
  const [centerMode, setCenterMode] = useState<'search' | 'generate'>('search');
  const [searchExperienceVersion, setSearchExperienceVersion] = useState<SearchExperienceVersion>('a');
  const [activeSearchChannelId, setActiveSearchChannelId] = useState<SearchChannelId>('mobileBank');
  const [activeSearchScenarioId, setActiveSearchScenarioId] = useState<string | null>(null);
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
    const params = new URLSearchParams();
    params.set('channel', channelLabel);
    params.set('scene', channelLabel);
    params.set('keyword', scenarioTitle);
    navigate(`/templates?${params.toString()}`);
  };

  const handleSearchSubmit = () => {
    if (!activeSearchChannel || !activeSearchScenario) return;
    submitSearch(activeSearchChannel.label, activeSearchScenario.title);
  };

  const searchGuideCards = useMemo(
    () => [
      {
        id: 'idea',
        title: '先选渠道',
        description: '从你的投放渠道或内容阵地开始，不需要自己想分类。',
        icon: Lightbulb,
      },
      {
        id: 'pick',
        title: '再选场景',
        description: '系统会给出该渠道常见场景，直接点图卡即可进入下一步。',
        icon: MousePointerClick,
      },
      {
        id: 'template',
        title: '自动筛模板',
        description: '我们会自动带你进入对应的公共模板页，避免重复搜索。',
        icon: Sparkles,
      },
      {
        id: 'edit',
        title: '直接开始设计',
        description: '在模板页里挑中后即可进入编辑，不需要再做二次筛选。',
        icon: PencilRuler,
      },
    ],
    []
  );

  const searchChannels = useMemo<SearchChannel[]>(
    () => [
      {
        id: 'seat' as const,
        label: '微信',
        ink: 'text-gray-900',
        description: '适合朋友圈宣传、客户经理营销活动图和微信渠道常用物料。',
        sizeHint: '朋友圈 / 微信营销素材',
        scenarios: [
          {
            id: 'wechat-moments',
            title: '朋友圈宣传3:4',
            description: '适合朋友圈传播、活动曝光和轻量营销宣传。',
            sizeHint: '3:4 竖版',
            previewUrl: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?q=80&w=1200&auto=format&fit=crop',
          },
          {
            id: 'wechat-manager',
            title: '客户经理营销活动图',
            description: '适合客户经理转发、活动邀约和产品营销推广。',
            sizeHint: '营销海报',
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
            id: 'portal-event',
            title: '活动导流',
            description: '适合报名活动、专题宣传和首页焦点图露出。',
            sizeHint: '横版 Banner',
            previewUrl: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=1200&auto=format&fit=crop',
          },
          {
            id: 'portal-brand',
            title: '品牌露出',
            description: '适合品牌宣传、能力介绍和重点产品曝光。',
            sizeHint: '宽屏头图',
            previewUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1200&auto=format&fit=crop',
          },
          {
            id: 'portal-festival',
            title: '节日祝福',
            description: '适合门户首页节庆氛围图、祝福横幅和节点换肤。',
            sizeHint: '节日横幅',
            previewUrl: 'https://images.unsplash.com/photo-1611003446057-08c35359146c?q=80&w=1200&auto=format&fit=crop',
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
            title: '通知公告',
            description: '适合制度通知、园区公告、会议安排和统一通知模板。',
            sizeHint: '竖版通知',
            previewUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop',
          },
          {
            id: 'internal-training',
            title: '培训招募',
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
        ],
      },
      {
        id: 'partyBuilding' as const,
        label: '党建活动',
        ink: 'text-[#DB2777]',
        description: '适合主题党日、学习活动、志愿服务和党建宣传场景。',
        sizeHint: '红色主题 / 展板海报',
        scenarios: [
          {
            id: 'party-study',
            title: '学习宣传',
            description: '适合主题学习、党课活动和思想教育宣传物料。',
            sizeHint: '竖版海报',
            previewUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop',
          },
          {
            id: 'party-service',
            title: '志愿服务',
            description: '适合社区服务、公益行动和党员志愿活动宣传。',
            sizeHint: '活动展板',
            previewUrl: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=1200&auto=format&fit=crop',
          },
          {
            id: 'party-day',
            title: '主题党日',
            description: '适合主题党日、红色教育和专题活动主视觉。',
            sizeHint: '红金长图',
            previewUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop',
          },
        ],
      },
      {
        id: 'more' as const,
        label: '更多内容',
        ink: 'text-gray-600',
        description: '适合直播预告、通用背景、图文排版和通用营销模板。',
        sizeHint: '通用模板 / 多尺寸',
        scenarios: [
          {
            id: 'more-live',
            title: '直播预告',
            description: '适合直播预热、嘉宾预告和时间提醒场景。',
            sizeHint: '直播海报',
            previewUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1200&auto=format&fit=crop',
          },
          {
            id: 'more-cards',
            title: '信息卡片',
            description: '适合产品卖点、图文卡片和多模块信息排版。',
            sizeHint: '图文卡片',
            previewUrl: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=1200&auto=format&fit=crop',
          },
          {
            id: 'more-bg',
            title: '通用背景',
            description: '适合做底图、留白海报和二次加工的通用素材。',
            sizeHint: '底图模板',
            previewUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1200&auto=format&fit=crop',
          },
        ],
      },
    ],
    []
  );

  const activeSearchChannel = useMemo(
    () => searchChannels.find((scene) => scene.id === activeSearchChannelId) ?? null,
    [activeSearchChannelId, searchChannels]
  );
  const activeSearchScenario = useMemo(
    () => activeSearchChannel?.scenarios.find((scenario) => scenario.id === activeSearchScenarioId) ?? null,
    [activeSearchChannel, activeSearchScenarioId]
  );
  const searchQuery = useMemo(() => {
    if (!activeSearchChannel || !activeSearchScenario) return '';
    const tokens = [activeSearchChannel.label, activeSearchScenario.title];
    return tokens.join(' ');
  }, [activeSearchChannel, activeSearchScenario]);

  useEffect(() => {
    if (!activeSearchChannel) {
      setActiveSearchScenarioId(null);
      return;
    }
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
            <div className="inline-flex items-center rounded-full p-1 border border-black/5 bg-white/80 backdrop-blur-sm shadow-[0_6px_20px_rgba(0,0,0,0.04)]">
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
            <div className="text-sm text-gray-500">
              {centerMode === 'search' ? '在公共模板里搜关键词' : '输入提示词，点击发送进入无限画布'}
            </div>
          </div>

          <div className="pt-5">
            {centerMode === 'search' ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-2 text-left">
                    <div className="text-xl font-bold text-gray-950">像专业设计师一样快速开始</div>
                    <div className="text-sm text-gray-500 leading-relaxed">
                      不用自己搜索关键词，先选渠道，再选场景，系统会自动把你带到合适的模板页。
                    </div>
                  </div>
                  <div className="inline-flex items-center rounded-full p-1 border border-black/5 bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() => setSearchExperienceVersion('a')}
                      className={clsx(
                        'h-9 px-4 rounded-full text-sm font-semibold transition-colors',
                        searchExperienceVersion === 'a' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      方案 A
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchExperienceVersion('b')}
                      className={clsx(
                        'h-9 px-4 rounded-full text-sm font-semibold transition-colors',
                        searchExperienceVersion === 'b' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      方案 B
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchExperienceVersion('c')}
                      className={clsx(
                        'h-9 px-4 rounded-full text-sm font-semibold transition-colors',
                        searchExperienceVersion === 'c' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
                      )}
                    >
                      方案 C
                    </button>
                  </div>
                </div>

                {searchExperienceVersion === 'a' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {searchGuideCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                          <div
                            key={card.id}
                            className="rounded-[26px] border border-black/5 bg-white/90 px-5 py-5 text-left shadow-[0_18px_40px_-36px_rgba(0,0,0,0.35)]"
                          >
                            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-50 text-gray-900">
                              <Icon size={20} />
                            </div>
                            <div className="mt-5 text-xs font-semibold tracking-[0.18em] text-gray-400">STEP {index + 1}</div>
                            <div className="mt-2 text-base font-semibold text-gray-900">{card.title}</div>
                            <div className="mt-2 text-sm leading-relaxed text-gray-500">{card.description}</div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="rounded-[32px] border border-black/5 bg-white p-5 shadow-[0_22px_60px_-40px_rgba(0,0,0,0.26)]">
                      <div className="text-[11px] font-semibold tracking-[0.2em] text-gray-400">第一步 选择投放渠道</div>
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {searchChannels.map((channel) => {
                          const isActive = activeSearchChannelId === channel.id;
                          return (
                            <button
                              key={channel.id}
                              type="button"
                              onClick={() => setActiveSearchChannelId(channel.id)}
                              className={clsx(
                                'rounded-[26px] border px-4 py-4 text-left transition-all',
                                isActive ? 'border-transparent shadow-sm' : 'border-black/5 hover:border-black/10 hover:bg-gray-50/70'
                              )}
                              style={isActive ? { backgroundColor: purple.softBg } : undefined}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className={clsx('inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white', channel.ink)}>
                                  <SceneIllustration id={channel.id} className="h-8 w-8" />
                                </div>
                                {isActive ? (
                                  <span
                                    className="inline-flex h-7 items-center rounded-full px-3 text-[11px] font-semibold"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.86)', color: purple.text }}
                                  >
                                    已选择
                                  </span>
                                ) : null}
                              </div>
                              <div className="mt-4 text-base font-semibold text-gray-900">{channel.label}</div>
                              <div className="mt-2 text-sm leading-relaxed text-gray-500">{channel.description}</div>
                              <div className="mt-3 text-xs font-medium text-gray-400">{channel.sizeHint}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {activeSearchChannel ? (
                      <div className="rounded-[32px] border border-black/5 bg-white p-5 shadow-[0_22px_60px_-40px_rgba(0,0,0,0.26)]">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div>
                            <div className="text-[11px] font-semibold tracking-[0.2em] text-gray-400">第二步 选择应用场景</div>
                            <div className="mt-2 text-sm text-gray-500">
                              已切换到 <span className="font-semibold text-gray-900">{activeSearchChannel.label}</span>，点击下方图卡即可继续。
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">{activeSearchChannel.sizeHint}</div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                          {activeSearchChannel.scenarios.map((scenario) => {
                            const isActive = activeSearchScenarioId === scenario.id;
                            return (
                              <button
                                key={scenario.id}
                                type="button"
                                onClick={() => setActiveSearchScenarioId(scenario.id)}
                                className={clsx(
                                  'group overflow-hidden rounded-[24px] border bg-white text-left transition-all',
                                  isActive ? 'border-transparent shadow-lg -translate-y-0.5' : 'border-black/5 hover:border-black/10 hover:-translate-y-0.5 hover:shadow-md'
                                )}
                                style={isActive ? { boxShadow: '0 18px 40px -28px rgba(111, 88, 243, 0.42)' } : undefined}
                              >
                                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                  <img src={scenario.previewUrl} alt={scenario.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                                  <div className={clsx('absolute inset-0 transition-colors', isActive ? 'bg-black/10' : 'bg-black/0 group-hover:bg-black/10')} />
                                </div>
                                <div className="space-y-2 px-4 py-4">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="text-base font-semibold text-gray-900">{scenario.title}</div>
                                    {isActive ? <CheckCircle2 size={18} style={{ color: purple.text }} /> : null}
                                  </div>
                                  <div className="text-sm leading-relaxed text-gray-500">{scenario.description}</div>
                                  <div className="text-xs font-medium text-gray-400">{scenario.sizeHint}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    <div className="rounded-[32px] border border-black/5 bg-white px-5 py-5 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.28)]">
                      <div className="text-[11px] font-semibold tracking-[0.2em] text-gray-400">第三步 进入模板库</div>
                      <div className="mt-4 flex items-center justify-between gap-4 flex-wrap">
                        <div className="min-w-[260px] flex-1">
                          <div className="text-base font-semibold text-gray-900">
                            {searchQuery ? `已选择：${searchQuery}` : '请选择渠道和场景'}
                          </div>
                          <div className="mt-2 text-sm leading-relaxed text-gray-500">
                            {searchQuery
                              ? '系统将直接打开该渠道、该场景下的公共模板列表，帮助你快速开始。'
                              : '完成上面的两个步骤后，这里会出现一键进入模板库的入口。'}
                          </div>
                        </div>
                        <button
                          onClick={handleSearchSubmit}
                          className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={!activeSearchChannel || !activeSearchScenario}
                          style={{ backgroundColor: purple.solid }}
                          onMouseEnter={(e) => {
                            if ((e.currentTarget as HTMLButtonElement).disabled) return;
                            e.currentTarget.style.backgroundColor = purple.solidHover;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = purple.solid;
                          }}
                        >
                          <span>查看这个场景的模板</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : searchExperienceVersion === 'b' ? (
                  <div className="rounded-[34px] border border-black/5 bg-white p-5 shadow-[0_28px_80px_-46px_rgba(0,0,0,0.28)]">
                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
                      <div className="rounded-[28px] bg-gray-50/80 p-5">
                        <div className="text-[11px] font-semibold tracking-[0.2em] text-gray-400">新手路线</div>
                        <div className="mt-3 text-lg font-bold text-gray-900">按步骤完成，直接进入模板</div>
                        <div className="mt-2 text-sm leading-relaxed text-gray-500">
                          方案 B 更像一个带路型首页，左边告诉用户现在做到了哪一步，右边直接给出可点选的场景结果。
                        </div>

                        <div className="mt-5 space-y-3">
                          {[
                            { step: '01', title: '选择渠道', description: '先锁定你的投放阵地' },
                            { step: '02', title: '点击场景', description: '只保留这个渠道常用模板' },
                            { step: '03', title: '进入模板页', description: '直接开始挑模板并编辑' },
                          ].map((item) => (
                            <div key={item.step} className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 border border-black/5">
                              <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                                {item.step}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                                <div className="mt-1 text-xs leading-relaxed text-gray-500">{item.description}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6">
                          <div className="text-[11px] font-semibold tracking-[0.18em] text-gray-400">选择渠道</div>
                          <div className="mt-3 space-y-2">
                            {searchChannels.map((channel) => {
                              const isActive = activeSearchChannelId === channel.id;
                              return (
                                <button
                                  key={channel.id}
                                  type="button"
                                  onClick={() => setActiveSearchChannelId(channel.id)}
                                  className={clsx(
                                    'w-full rounded-2xl border px-4 py-3 text-left transition-all',
                                    isActive ? 'border-transparent text-gray-900 shadow-sm' : 'border-black/5 bg-white text-gray-600 hover:border-black/10 hover:text-gray-900'
                                  )}
                                  style={isActive ? { backgroundColor: purple.softBg } : undefined}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={clsx('inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white', channel.ink)}>
                                      <SceneIllustration id={channel.id} className="h-7 w-7" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-sm font-semibold">{channel.label}</div>
                                      <div className="mt-1 text-xs text-gray-400">{channel.sizeHint}</div>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-5">
                        {activeSearchChannel ? (
                          <div
                            className="rounded-[28px] px-6 py-6 text-left text-white"
                            style={{
                              background: 'linear-gradient(135deg, rgba(111,88,243,0.96), rgba(37,99,235,0.92))',
                            }}
                          >
                            <div className="text-xs font-semibold tracking-[0.2em] text-white/65">当前渠道</div>
                            <div className="mt-3 flex items-end justify-between gap-4 flex-wrap">
                              <div>
                                <div className="text-2xl font-bold">{activeSearchChannel.label}</div>
                                <div className="mt-2 max-w-[620px] text-sm leading-relaxed text-white/82">
                                  {activeSearchChannel.description}
                                </div>
                              </div>
                              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                                {activeSearchChannel.sizeHint}
                              </div>
                            </div>
                          </div>
                        ) : null}

                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div>
                            <div className="text-[11px] font-semibold tracking-[0.2em] text-gray-400">第二步 选择应用场景</div>
                            <div className="mt-2 text-sm text-gray-500">点击场景卡片，下方会出现最终确认按钮。</div>
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-2 text-xs text-gray-500">
                            <Search size={14} />
                            <span>{activeSearchChannel?.scenarios.length ?? 0} 个推荐场景</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          {activeSearchChannel?.scenarios.map((scenario, index) => {
                            const isActive = activeSearchScenarioId === scenario.id;
                            return (
                              <button
                                key={scenario.id}
                                type="button"
                                onClick={() => setActiveSearchScenarioId(scenario.id)}
                                className={clsx(
                                  'group overflow-hidden rounded-[28px] border bg-white text-left transition-all',
                                  isActive ? 'border-transparent shadow-xl' : 'border-black/5 hover:border-black/10 hover:shadow-md'
                                )}
                                style={isActive ? { boxShadow: '0 24px 60px -40px rgba(111, 88, 243, 0.52)' } : undefined}
                              >
                                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                                  <img src={scenario.previewUrl} alt={scenario.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
                                  <div className="absolute left-4 top-4 inline-flex h-8 items-center rounded-full bg-white/88 px-3 text-xs font-semibold text-gray-900">
                                    方案 {index + 1}
                                  </div>
                                  <div className="absolute left-4 right-4 bottom-4">
                                    <div className="text-lg font-semibold text-white">{scenario.title}</div>
                                    <div className="mt-1 text-sm text-white/78">{scenario.sizeHint}</div>
                                  </div>
                                </div>
                                <div className="space-y-3 px-5 py-5">
                                  <div className="text-sm leading-relaxed text-gray-500">{scenario.description}</div>
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="inline-flex items-center gap-2 text-xs font-semibold" style={{ color: isActive ? purple.text : '#6b7280' }}>
                                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: isActive ? purple.solid : '#9ca3af' }} />
                                      <span>{isActive ? '已选中这个场景' : '点击后进入该场景模板'}</span>
                                    </div>
                                    <ArrowRight size={16} className={clsx('transition-transform', isActive ? 'translate-x-0.5 text-gray-900' : 'text-gray-400 group-hover:translate-x-0.5')} />
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="rounded-[28px] border border-black/5 bg-gray-50/70 px-5 py-5">
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="min-w-[260px] flex-1">
                              <div className="text-[11px] font-semibold tracking-[0.2em] text-gray-400">第三步 一键进入模板</div>
                              <div className="mt-2 text-base font-semibold text-gray-900">
                                {searchQuery ? `已锁定：${searchQuery}` : '请选择一个场景'}
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                进入模板页后会展示当前渠道下对应场景的公共模板，并保留筛选状态。
                              </div>
                            </div>
                            <button
                              onClick={handleSearchSubmit}
                              className="inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                              disabled={!activeSearchChannel || !activeSearchScenario}
                              style={{ backgroundColor: purple.solid }}
                              onMouseEnter={(e) => {
                                if ((e.currentTarget as HTMLButtonElement).disabled) return;
                                e.currentTarget.style.backgroundColor = purple.solidHover;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = purple.solid;
                              }}
                            >
                              <span>查看这个场景的模板</span>
                              <ArrowRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex flex-col items-center gap-3">
                      <div className="text-[11px] font-semibold tracking-[0.18em] text-gray-400">常用场景</div>
                      <div className="grid w-full grid-cols-3 gap-x-1 gap-y-2 sm:grid-cols-6">
                        {searchChannels.map((channel) => {
                          const isActive = activeSearchChannelId === channel.id;
                          return (
                            <button
                              key={channel.id}
                              type="button"
                              onClick={() => setActiveSearchChannelId(channel.id)}
                              className={clsx(
                                'group flex flex-col items-center justify-center gap-2 h-[84px] rounded-2xl border border-transparent bg-transparent transition-colors',
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
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="rounded-[28px] border border-black/5 bg-white shadow-[0_22px_50px_-36px_rgba(0,0,0,0.24)] overflow-hidden">
                      <div className="relative px-5 pt-4 pb-3">
                        <input
                          placeholder="请选择一个常用场景"
                          className="w-full h-12 pl-11 pr-24 border-0 bg-transparent focus:outline-none focus:ring-0 text-sm text-gray-900 placeholder:text-gray-400"
                          value={searchQuery}
                          readOnly
                          aria-readonly="true"
                          tabIndex={-1}
                          style={{ cursor: 'default' }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSearchSubmit();
                            }
                          }}
                        />
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                          <Search size={18} />
                        </div>
                        <button
                          onClick={handleSearchSubmit}
                          className="absolute right-4 top-1/2 -translate-y-1/2 h-9 px-4 rounded-full text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_22px_-12px_rgba(88,28,135,0.5)]"
                          disabled={!activeSearchChannel || !activeSearchScenario}
                          style={{ backgroundColor: purple.solid }}
                          onMouseEnter={(e) => {
                            if ((e.currentTarget as HTMLButtonElement).disabled) return;
                            e.currentTarget.style.backgroundColor = purple.solidHover;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = purple.solid;
                          }}
                        >
                          开始设计
                        </button>
                      </div>
                      <div className="px-5 pb-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-400">
                        <div className="inline-flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span>搜索后进入公共模板社区</span>
                        </div>
                        <div className="inline-flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span>支持活动、银行、招聘等场景</span>
                        </div>
                      </div>
                    </div>
                    {activeSearchChannel && activeSearchChannel.scenarios.length > 0 ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="text-[11px] font-semibold tracking-[0.14em] text-gray-400">快速开始</div>
                        <div className="flex flex-wrap justify-center gap-2">
                          {activeSearchChannel.scenarios.map((scenario) => {
                            const isActive = activeSearchScenarioId === scenario.id;
                            return (
                              <button
                                key={scenario.id}
                                type="button"
                                onClick={() => setActiveSearchScenarioId(scenario.id)}
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
                )}
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
                <div className="text-base font-semibold text-gray-900">公共模板社区</div>
                <div className="text-sm text-gray-500">直接浏览社区热门模板，点开即可在无限画布里编辑</div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/templates')}
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

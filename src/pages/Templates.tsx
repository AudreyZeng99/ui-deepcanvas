import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Camera, ChevronRight, Heart, Plus, Share2, PencilLine, X } from 'lucide-react';
import clsx from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { useProject } from '../context/ProjectContext';
import { createP2PShareRecord, makeTemplateElements } from '../utils/p2pShare';

// Mock Data Interfaces
interface Template {
  id: string;
  title: string;
  imageUrl: string;
  type?: 'video' | 'image';
  author: {
    name: string;
    avatar: string;
  };
  stats?: {
    views: number;
  };
  tags?: string[];
}

interface Section {
  id: string;
  title: string;
  subtitle: string;
  items: Template[];
}

// Mock Data Generation
const generateMockData = (): Section[] => {
  const categories = [
    {
      id: 'seat',
      title: '坐席图',
      subtitle: '坐席信息展示、通讯录排版、组织分工与岗位公示等',
    },
    {
      id: 'mobile-bank',
      title: '手机银行',
      subtitle: 'App 活动运营、功能上新、权益促活等',
    },
    {
      id: 'portal-promo',
      title: '门户宣传',
      subtitle: '门户首页横幅、专题宣传、品牌露出与活动导流等',
    },
    {
      id: 'internal-event',
      title: '对内活动',
      subtitle: '通知公告、培训招募、内部活动宣传等',
    },
    {
      id: 'party-building',
      title: '党建活动',
      subtitle: '主题党日、学习活动、宣传展板与宣发物料',
    },
    {
      id: 'more',
      title: '更多内容',
      subtitle: '通用底图、信息排版与更多灵感模板',
    },
  ];

  const authors = [
    { name: '大大大林子lin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { name: '星火YY', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
    { name: 'Ody0', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
    { name: '用户NrUiLk9y', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Cal' },
  ];

  // CNY Red/Gold themed images from Unsplash
  const cnyImages = [
    'https://images.unsplash.com/photo-1548625361-9f9392e2133f?q=80&w=400&auto=format&fit=crop', // Red envelope/lanterns
    'https://images.unsplash.com/photo-1518600570419-86927d7f7e0b?q=80&w=400&auto=format&fit=crop', // Red festive
    'https://images.unsplash.com/photo-1611003446057-08c35359146c?q=80&w=400&auto=format&fit=crop', // Red background
    'https://images.unsplash.com/photo-1580259830304-4e4b52583842?q=80&w=400&auto=format&fit=crop', // Red paper cut
    'https://images.unsplash.com/photo-1643285747683-9b98c3635749?q=80&w=400&auto=format&fit=crop', // Chinese knot
    'https://images.unsplash.com/photo-1613426742510-4497e8838507?q=80&w=400&auto=format&fit=crop', // Gold ingot
    'https://images.unsplash.com/photo-1643940889271-70337c76742b?q=80&w=400&auto=format&fit=crop', // Tiger/Animal
    'https://images.unsplash.com/photo-1548126959-1c9f71c4c95f?q=80&w=400&auto=format&fit=crop', // Lanterns
  ];

  const bannerImages = [
    'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1557682260-96773eb01377?q=80&w=400&auto=format&fit=crop',
  ];

  const mobileBankImages = [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556740749-887f6717d7e4?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=400&auto=format&fit=crop',
  ];

  const internalImages = [
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1523475472560-d2df97ec485c?q=80&w=400&auto=format&fit=crop',
  ];

  const partyBuildingImages = [
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1455849318743-b2233052fcff?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520975682031-a29e9f3492b7?q=80&w=400&auto=format&fit=crop',
  ];

  const otherImages = [
    'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=400&auto=format&fit=crop',
  ];

  const seatImages = [
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497366412874-3415097a27e7?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=400&auto=format&fit=crop',
  ];

  const templateTitlesByCategory: Record<string, string[]> = {
    seat: ['营业网点坐席图', '客服坐席分布图', '部门联络坐席表', '岗位职责坐席图', '值班安排坐席表', '团队组织坐席图', '柜面服务坐席图', '楼层坐席导览图'],
    'mobile-bank': ['手机银行功能上新海报', '掌上银行权益活动海报', 'App 开屏主视觉', '会员日权益长图', '转账免费提现活动', '生活缴费促活海报', '理财专区运营KV', '信用卡活动主视觉'],
    'portal-promo': ['门户首页焦点图', '内网专题宣传横幅', '品牌宣传主视觉', '活动报名导流图', '产品能力介绍横幅', '门户频道运营Banner', '服务公告焦点图', '专题页头图'],
    'internal-event': ['内部活动通知海报', '园区公告长图', '培训报名海报', '会议议程长图', '员工关怀活动海报', '安全生产宣传海报', '周报/月报封面', '内宣活动长图'],
    'party-building': ['党建主题活动海报', '党员学习日海报', '主题党日活动长图', '先进典型宣传海报', '组织生活会海报', '志愿服务活动海报', '红色教育活动长图', '党建展板封面'],
    more: ['通用信息排版模板', '标题留白版海报', '多模块长图排版', '产品信息卡片', '活动日历海报', '直播预告海报', '图文混排长图', '通用背景底图'],
  };

  const imagePoolsByCategory: Record<string, string[]> = {
    seat: seatImages,
    'mobile-bank': mobileBankImages.length ? mobileBankImages : bannerImages,
    'portal-promo': bannerImages,
    'internal-event': internalImages,
    'party-building': partyBuildingImages,
    more: otherImages.length ? otherImages : cnyImages,
  };

  return categories.map((cat) => {
    const titlePool = templateTitlesByCategory[cat.id] || ['公共模板'];
    const imagePool = imagePoolsByCategory[cat.id] || cnyImages;
    return {
      ...cat,
      items: Array.from({ length: 24 }).map((_, i) => ({
        id: `${cat.id}-${i}`,
        title: titlePool[i % titlePool.length],
        imageUrl: imagePool[i % imagePool.length],
        type: i % 3 === 0 ? 'video' : 'image',
        author: authors[i % authors.length],
        stats: {
          views: Math.floor(Math.random() * 10000),
        },
      })),
    };
  });
};

const sections = generateMockData();

type TemplateCardProps = {
  item: Template;
  onUseTemplate: (detail: PublicTemplateDetail) => void;
  onOpenDetail: (detail: PublicTemplateDetail) => void;
  className?: string;
};

type PublicTemplateDetail = {
  id: string;
  title: string;
  previewUrl: string;
  authorName: string;
  width: number;
  height: number;
  scene: string;
  elements: string[];
};

function resolveSceneLabelFromTemplateId(templateId: string): string {
  const id = templateId.trim();
  if (id.startsWith('seat-') || id.startsWith('search-seat-')) return '坐席图';
  if (id.startsWith('mobile-bank-') || id.startsWith('search-mobile-bank-')) return '手机银行';
  if (id.startsWith('portal-promo-') || id.startsWith('search-portal-promo-')) return '门户宣传';
  if (id.startsWith('internal-event-') || id.startsWith('search-internal-event-')) return '对内活动';
  if (id.startsWith('party-building-') || id.startsWith('search-party-building-')) return '党建活动';
  return '更多内容';
}

const SCENE_OPTIONS = ['坐席图', '手机银行', '门户宣传', '对内活动', '党建活动', '更多内容'] as const;

const TemplateCard = ({ item, onUseTemplate, onOpenDetail, className }: TemplateCardProps) => {
  const toast = useToast();
  const detail: PublicTemplateDetail = {
    id: item.id,
    title: item.title,
    previewUrl: item.imageUrl,
    authorName: item.author.name,
    width: 1080,
    height: 1920,
    scene: resolveSceneLabelFromTemplateId(item.id),
    elements: ['元素：海报'],
  };
  return (
    <div
      className={clsx('flex-shrink-0 group cursor-pointer flex flex-col gap-2', className ?? 'w-full')}
      onClick={() => onOpenDetail(detail)}
    >
      {/* Card Image Container */}
      <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-100 border border-gray-100 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-full object-cover"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUseTemplate(detail);
            }}
            className="pointer-events-auto px-4 py-2 rounded-full bg-white text-gray-900 text-sm font-semibold shadow-lg"
            aria-label="使用该模板"
          >
            使用该模板
          </button>
        </div>
        <button
          onClick={async (e) => {
            e.stopPropagation();
            const width = 1080;
            const height = 1920;
            const record = createP2PShareRecord({
              kind: 'public_template',
              payload: {
                title: item.title,
                previewImageUrl: item.imageUrl,
                width,
                height,
                elements: makeTemplateElements(item.imageUrl, width, height),
                sourceLabel: '公共模板',
              },
            });
            try {
              await navigator.clipboard.writeText(record.code);
              toast.show('口令已复制到剪切板');
            } catch {
              toast.show('口令已复制到剪切板');
            }
          }}
          className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/85 backdrop-blur border border-black/10 shadow-sm flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
          title="分享口令"
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-2 px-1">
        <img 
          src={item.author.avatar} 
          alt={item.author.name} 
          className="w-5 h-5 rounded-full bg-gray-200"
        />
        <span className="text-xs text-gray-500 truncate flex-1">{item.author.name}</span>
        {/* Optional: Views/More */}
        {/* <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={14} />
        </button> */}
      </div>
    </div>
  );
};

type TrafficTeamTemplate = {
  id: string;
  title: string;
  previewUrl: string;
  clickRate: number;
  useRate: number;
};

const TRAFFIC_TEAM_TEMPLATES: TrafficTeamTemplate[] = [
  {
    id: 'traffic-1',
    title: '高转化拉新 Banner（红金热区）',
    previewUrl: 'https://images.unsplash.com/photo-1520975897680-8f8cde0b7b1a?q=80&w=900&auto=format&fit=crop',
    clickRate: 0.186,
    useRate: 0.72,
  },
  {
    id: 'traffic-2',
    title: '限时福利 Banner（强利益点）',
    previewUrl: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=900&auto=format&fit=crop',
    clickRate: 0.171,
    useRate: 0.63,
  },
  {
    id: 'traffic-3',
    title: '渠道投放 Banner（品牌信任）',
    previewUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=900&auto=format&fit=crop',
    clickRate: 0.158,
    useRate: 0.58,
  },
  {
    id: 'traffic-4',
    title: '高对比促销 Banner（强 CTA）',
    previewUrl: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?q=80&w=900&auto=format&fit=crop',
    clickRate: 0.149,
    useRate: 0.52,
  },
  {
    id: 'traffic-5',
    title: '信息流三卖点 Banner（结构化）',
    previewUrl: 'https://images.unsplash.com/photo-1557682260-96773eb01377?q=80&w=900&auto=format&fit=crop',
    clickRate: 0.142,
    useRate: 0.47,
  },
  {
    id: 'traffic-6',
    title: '简洁留白 Banner（高端质感）',
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=900&auto=format&fit=crop',
    clickRate: 0.136,
    useRate: 0.44,
  },
  {
    id: 'traffic-7',
    title: '节日氛围 Banner（强场景）',
    previewUrl: 'https://images.unsplash.com/photo-1548625361-9f9392e2133f?q=80&w=900&auto=format&fit=crop',
    clickRate: 0.128,
    useRate: 0.41,
  },
  {
    id: 'traffic-8',
    title: '低门槛活动 Banner（参与感）',
    previewUrl: 'https://images.unsplash.com/photo-1613426742510-4497e8838507?q=80&w=900&auto=format&fit=crop',
    clickRate: 0.121,
    useRate: 0.36,
  },
  {
    id: 'traffic-9',
    title: '高识别 IP Banner（资产复用）',
    previewUrl: 'https://images.unsplash.com/photo-1611003446057-08c35359146c?q=80&w=900&auto=format&fit=crop',
    clickRate: 0.113,
    useRate: 0.33,
  },
  {
    id: 'traffic-10',
    title: '产品导向 Banner（信息完整）',
    previewUrl: 'https://images.unsplash.com/photo-1643940889271-70337c76742b?q=80&w=900&auto=format&fit=crop',
    clickRate: 0.102,
    useRate: 0.29,
  },
];

const TEAM_TEMPLATE_FAVORITES_KEY = 'trae_deepcanvas_team_template_favorites_v1';
const PUBLIC_TEMPLATE_FAVORITES_KEY = 'trae_deepcanvas_public_template_favorites_v1';

type TrafficTemplateCardProps = {
  template: TrafficTeamTemplate;
  isFavorite: boolean;
  onToggleFavorite: (templateId: string) => void;
  onDoSame: (template: TrafficTeamTemplate) => void;
};

const TrafficTemplateCard = ({ template, isFavorite, onToggleFavorite, onDoSame }: TrafficTemplateCardProps) => {
  const clickRateText = `${(template.clickRate * 100).toFixed(1)}%`;
  const useRateText = `${(template.useRate * 100).toFixed(0)}%`;

  return (
    <div className="w-full group cursor-pointer">
      <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5">
        <div className="relative aspect-[16/9] bg-gray-100">
          <img src={template.previewUrl} alt={template.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDoSame(template);
            }}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="做同款"
          >
            <div className="px-4 py-2 rounded-full bg-white text-gray-900 text-sm font-semibold shadow-lg">
              做同款
            </div>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(template.id);
            }}
            className={clsx(
              'absolute top-3 right-3 w-10 h-10 rounded-full backdrop-blur border shadow-sm flex items-center justify-center transition-colors',
              isFavorite ? 'bg-black/85 border-black/10 text-white' : 'bg-white/85 border-black/10 text-gray-700 hover:bg-white'
            )}
            title={isFavorite ? '取消收藏' : '收藏模板'}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="text-sm font-semibold text-gray-900 line-clamp-2">{template.title}</div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="px-2 py-1 rounded-full bg-gray-50 border border-black/5">点击率 {clickRateText}</span>
            <span className="px-2 py-1 rounded-full bg-gray-50 border border-black/5">使用率 {useRateText}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

type TeamTemplateCardProps = {
  title: string;
  previewUrl?: string;
  teamName: string;
  onDoSame: (payload: { title: string; previewUrl?: string }) => void;
};

const TeamTemplateCard = ({ title, previewUrl, teamName, onDoSame }: TeamTemplateCardProps) => {
  return (
    <div className="flex-shrink-0 w-full group cursor-pointer flex flex-col gap-2">
      <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-100 border border-gray-100 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
        {previewUrl ? (
          <img src={previewUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="px-4 text-center">
              <div className="text-sm font-semibold text-gray-700 line-clamp-2">{title}</div>
              <div className="mt-2 text-xs text-gray-500">暂无预览</div>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDoSame({ title, previewUrl });
          }}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="做同款"
        >
          <div className="px-4 py-2 rounded-full bg-white text-gray-900 text-sm font-semibold shadow-lg">
            做同款
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2 px-1">
        <span className="text-xs text-gray-500 truncate flex-1">{title}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-black/5">
          {teamName}
        </span>
      </div>
    </div>
  );
};

type TemplatesScope = 'public' | 'team';

type FakeTemplateResult = {
  id: string;
  title: string;
  previewUrl: string;
  authorName: string;
  elements: string[];
  width: number;
  height: number;
};

function buildMockSvgDataUrl(seed: string, title: string) {
  const safeTitle = title.replace(/[<>&"]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1600" viewBox="0 0 900 1600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#8F7AFB" stop-opacity="0.92"/>
      <stop offset="1" stop-color="#111827" stop-opacity="0.90"/>
    </linearGradient>
    <filter id="n" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" seed="${seed}"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.12 0"/>
    </filter>
  </defs>
  <rect width="900" height="1600" fill="url(#g)"/>
  <rect width="900" height="1600" filter="url(#n)" opacity="0.6"/>
  <rect x="48" y="64" width="804" height="120" rx="32" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.22)"/>
  <text x="84" y="140" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI" font-size="44" font-weight="800" fill="white">${safeTitle}</text>
  <text x="84" y="220" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI" font-size="28" font-weight="600" fill="rgba(255,255,255,0.78)">可复用模板 · Fake Search Result</text>
  <rect x="48" y="280" width="804" height="1240" rx="48" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.18)"/>
  <text x="84" y="360" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI" font-size="30" font-weight="700" fill="rgba(255,255,255,0.92)">预览图</text>
  <text x="84" y="410" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI" font-size="22" font-weight="600" fill="rgba(255,255,255,0.7)">seed: ${seed}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildFakeTemplateResults(query: string, count: number): FakeTemplateResult[] {
  const sizes = [
    { width: 1080, height: 1920 },
    { width: 1920, height: 1080 },
    { width: 1080, height: 1080 },
    { width: 1242, height: 2208 },
    { width: 1200, height: 628 },
  ];
  const resolvedQuery = query.trim();
  const matchedSection =
    sections.find((s) => s.title === resolvedQuery) ||
    sections.find((s) => s.title.includes(resolvedQuery)) ||
    sections.find((s) => resolvedQuery.includes(s.title));

  if (matchedSection) {
    const baseElements = ['元素：海报'];
    return Array.from({ length: count }).map((_, i) => {
      const baseItem = matchedSection.items[i % matchedSection.items.length];
      const size = sizes[i % sizes.length];
      const title = `${matchedSection.title} · ${baseItem.title}`;
      return {
        id: `search-${matchedSection.id}-${i + 1}`,
        title,
        previewUrl: baseItem.imageUrl,
        authorName: baseItem.author.name,
        elements: baseElements,
        width: size.width,
        height: size.height,
      };
    });
  }

  const baseElements = ['元素：模板'];
  const authors = ['社区作者A', '社区作者B', '社区作者C', '社区作者D', '社区作者E', '社区作者F', '社区作者G'];
  return Array.from({ length: count }).map((_, i) => {
    const seed = `${resolvedQuery || '模板'}-${i + 1}`;
    const title = `${resolvedQuery || '通用'} 模板 ${i + 1}`;
    const size = sizes[i % sizes.length];
    return {
      id: `fake-${seed}`,
      title,
      previewUrl: buildMockSvgDataUrl(seed, title),
      authorName: authors[i % authors.length],
      elements: baseElements,
      width: size.width,
      height: size.height,
    };
  });
}

export default function Templates({ scope: scopeOverride }: { scope?: TemplatesScope }) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { teams, projects } = useProject();
  const { createProject, saveProject } = useProject();
  const [trafficRankTab, setTrafficRankTab] = useState<'click' | 'use'>('click');
  const [searchQuery, setSearchQuery] = useState('');
  const [sceneDraftById, setSceneDraftById] = useState<Record<string, string>>({});
  const [elementDraftById, setElementDraftById] = useState<Record<string, string>>({});
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [teamTemplateFavorites, setTeamTemplateFavorites] = useState<Set<string>>(() => {
    const raw = localStorage.getItem(TEAM_TEMPLATE_FAVORITES_KEY);
    if (!raw) return new Set();
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return new Set();
      return new Set(parsed.filter((id: any) => typeof id === 'string'));
    } catch {
      return new Set();
    }
  });
  const [publicTemplateFavorites, setPublicTemplateFavorites] = useState<Set<string>>(() => {
    const raw = localStorage.getItem(PUBLIC_TEMPLATE_FAVORITES_KEY);
    if (!raw) return new Set();
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return new Set();
      return new Set(parsed.filter((id: any) => typeof id === 'string'));
    } catch {
      return new Set();
    }
  });
  const [activeTemplateDetail, setActiveTemplateDetail] = useState<PublicTemplateDetail | null>(null);

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const teamId = searchParams.get('teamId') || 'team-1';
  const scope: TemplatesScope = scopeOverride ?? (location.pathname === '/team-templates' ? 'team' : 'public');

  useEffect(() => {
    if (scopeOverride) return;
    const params = new URLSearchParams(location.search);
    const legacyScope = params.get('scope');
    if (location.pathname === '/templates' && legacyScope === 'team') {
      params.delete('scope');
      if (!params.get('teamId')) params.set('teamId', 'team-1');
      navigate({ pathname: '/team-templates', search: params.toString() }, { replace: true });
      return;
    }
    if (location.pathname === '/team-templates' && legacyScope === 'public') {
      params.delete('scope');
      navigate({ pathname: '/templates', search: params.toString() }, { replace: true });
    }
  }, [location.pathname, location.search, navigate, scopeOverride]);

  const projectById = useMemo(() => {
    return new Map(projects.map(project => [project.id, project]));
  }, [projects]);

  const teamOptions = useMemo(() => {
    const priorityById = new Map<string, number>([
      ['team-1', 0],
      ['team-2', 1],
      ['team-3', 2],
    ]);
    const sorted = [...teams].sort((a, b) => {
      const pa = priorityById.get(a.id) ?? 999;
      const pb = priorityById.get(b.id) ?? 999;
      if (pa !== pb) return pa - pb;
      return b.createdAt - a.createdAt;
    });
    return sorted.map(t => ({ id: t.id, name: t.name }));
  }, [teams]);

  const resolvedTeamId = useMemo(() => {
    if (teamOptions.length === 0) return teamId;
    return teamOptions.some(option => option.id === teamId) ? teamId : teamOptions[0].id;
  }, [teamId, teamOptions]);

  const trafficTeamId = useMemo(() => {
    return teams.find(t => t.name === '流量素材投放banner制作')?.id || null;
  }, [teams]);

  const isTrafficTeamSelected = scope === 'team' && Boolean(trafficTeamId) && resolvedTeamId === trafficTeamId;

  const trafficTemplatesSorted = useMemo(() => {
    const key = trafficRankTab === 'click' ? 'clickRate' : 'useRate';
    return [...TRAFFIC_TEAM_TEMPLATES].sort((a, b) => b[key] - a[key]);
  }, [trafficRankTab]);

  const toggleTeamTemplateFavorite = (templateId: string) => {
    setTeamTemplateFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(templateId)) next.delete(templateId);
      else next.add(templateId);
      localStorage.setItem(TEAM_TEMPLATE_FAVORITES_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const updateSearchParam = (key: string, value?: string) => {
    const nextParams = new URLSearchParams(location.search);
    if (!value) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    navigate({ pathname: location.pathname, search: nextParams.toString() }, { replace: false });
  };

  const resetToTemplateHome = () => {
    setSearchQuery('');
    setEditingElementId(null);
    requestAnimationFrame(() => {
      scrollAreaRef.current?.scrollTo({ top: 0 });
    });
  };

  const teamSections = useMemo(() => {
    const selectedTeams = teams.filter(t => t.id === resolvedTeamId);
    return selectedTeams
      .map(team => {
        const items = team.projectIds
          .map(projectId => projectById.get(projectId))
          .filter((project): project is NonNullable<typeof project> => Boolean(project))
          .sort((a, b) => b.lastModified - a.lastModified)
          .map(project => ({
            id: `${team.id}::${project.id}`,
            title: project.name,
            previewUrl: project.thumbnail,
            teamName: team.name,
          }));
        return {
          id: team.id,
          title: team.name,
          subtitle: '团队内共享的可复用设计',
          items,
        };
      })
      .filter(section => section.items.length > 0);
  }, [projectById, resolvedTeamId, teams]);

  const trimmedQuery = searchQuery.trim();

  const lastTrimmedQueryRef = useRef<string>('');
  useEffect(() => {
    if (lastTrimmedQueryRef.current === trimmedQuery) return;
    lastTrimmedQueryRef.current = trimmedQuery;
    setElementDraftById({});
    setEditingElementId(null);
  }, [trimmedQuery]);

  useEffect(() => {
    if (!trimmedQuery) return;
    requestAnimationFrame(() => {
      scrollAreaRef.current?.scrollTo({ top: 0 });
    });
  }, [trimmedQuery]);

  const fakeSearchResults = useMemo(() => {
    if (!trimmedQuery) return [];
    const isCategory = sections.some((s) => s.title === trimmedQuery);
    return buildFakeTemplateResults(trimmedQuery, isCategory ? 60 : 36);
  }, [trimmedQuery]);

  const enterSearchWithCategory = (categoryName: string) => {
    setSearchQuery(categoryName);
    requestAnimationFrame(() => {
      scrollAreaRef.current?.scrollTo({ top: 0 });
    });
  };

  const openInNewTab = (path: string) => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const url = `${window.location.origin}${import.meta.env.BASE_URL}#${normalized}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const doSameFromPreview = (title: string, previewUrl: string, width: number, height: number) => {
    const id = crypto.randomUUID();
    const name = title.trim() ? `${title}（同款）` : '同款设计';
    const popup = window.open('about:blank', '_blank', 'noopener,noreferrer');
    createProject(width, height, name, {
      id,
      elements: makeTemplateElements(previewUrl, width, height),
      thumbnail: previewUrl,
      sourceType: 'manual',
    });
    requestAnimationFrame(() => {
      saveProject();
      if (popup) popup.location.href = `${window.location.origin}${import.meta.env.BASE_URL}#/editor?projectId=${encodeURIComponent(id)}`;
      else openInNewTab(`/editor?projectId=${encodeURIComponent(id)}`);
    });
  };

  const togglePublicTemplateFavorite = (templateId: string) => {
    setPublicTemplateFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(templateId)) next.delete(templateId);
      else next.add(templateId);
      localStorage.setItem(PUBLIC_TEMPLATE_FAVORITES_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const openTemplateInPublicCanvas = (detail: PublicTemplateDetail) => {
    const params = new URLSearchParams();
    params.set('src', detail.previewUrl);
    params.set('name', detail.title);
    params.set('id', detail.id);
    params.set('q', detail.title);
    openInNewTab(`/public-canvas?${params.toString()}`);
  };

  const shareTemplate = async (detail: PublicTemplateDetail) => {
    const record = createP2PShareRecord({
      kind: 'public_template',
      payload: {
        title: detail.title,
        previewImageUrl: detail.previewUrl,
        width: detail.width,
        height: detail.height,
        elements: makeTemplateElements(detail.previewUrl, detail.width, detail.height),
        sourceLabel: '公共模板',
      },
    });
    try {
      await navigator.clipboard.writeText(record.code);
      toast.show('口令已复制到剪切板');
    } catch {
      toast.show('口令已复制到剪切板');
    }
  };

  const closeTemplateDetail = () => setActiveTemplateDetail(null);

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Content Scroll Area */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-[1320px] mx-auto w-full px-8 py-6 space-y-10 pb-20">

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative group max-w-2xl flex-1 min-w-[280px]">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  placeholder={scope === 'public' ? '搜索公共模板…' : '搜索团队模板…'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-12 bg-gray-50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-black/10 rounded-xl outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  aria-label="以图搜图"
                >
                  <Camera size={20} />
                </button>
              </div>
              {scope === 'team' && (
                <select
                  value={resolvedTeamId}
                  onChange={(e) => updateSearchParam('teamId', e.target.value)}
                  className="h-12 px-4 bg-gray-50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-black/10 rounded-xl outline-none transition-all text-sm text-gray-700"
                  aria-label="选择团队"
                >
                  {teamOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex items-center gap-2">
              {trimmedQuery && (
                <button
                  type="button"
                  onClick={resetToTemplateHome}
                  className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors px-2 py-2"
                >
                  清空搜索
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}${import.meta.env.BASE_URL}#/editor`;
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
              >
                <Plus size={20} />
                创建新设计
              </button>
            </div>
          </div>

          {trimmedQuery ? (
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-gray-900">搜索结果</h2>
                  <p className="text-xs text-gray-500">关键词：{trimmedQuery} · {fakeSearchResults.length} 条</p>
                </div>
              </div>

              <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
                {fakeSearchResults.map((item) => {
                  const detail: PublicTemplateDetail = {
                    id: item.id,
                    title: item.title,
                    previewUrl: item.previewUrl,
                    authorName: item.authorName,
                    width: item.width,
                    height: item.height,
                    scene: resolveSceneLabelFromTemplateId(item.id),
                    elements: item.elements,
                  };

                  return (
                    <div
                      key={item.id}
                      className="mb-4 break-inside-avoid group cursor-pointer flex flex-col gap-2"
                      onClick={() => setActiveTemplateDetail(detail)}
                    >
                      <div
                        className="relative rounded-xl overflow-hidden bg-gray-100 border border-gray-100 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1"
                        style={{ aspectRatio: `${detail.width} / ${detail.height}` }}
                      >
                        <img src={item.previewUrl} alt={item.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openTemplateInPublicCanvas(detail);
                            }}
                            className="pointer-events-auto px-4 py-2 rounded-full bg-white text-gray-900 text-sm font-semibold shadow-lg"
                            aria-label="使用该模板"
                          >
                            使用该模板
                          </button>
                        </div>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await shareTemplate(detail);
                          }}
                          className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/85 backdrop-blur border border-black/10 shadow-sm flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
                          title="分享口令"
                        >
                          <Share2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 px-1">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                          {item.authorName.trim().slice(0, 1)}
                        </div>
                        <span className="text-xs text-gray-500 truncate flex-1">{item.authorName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : scope === 'public' ? (
            <>
              {sections.map((section) => (
                <section key={section.id} className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                      <p className="text-xs text-gray-500">{section.subtitle}</p>
                    </div>
                    <button
                      onClick={() => enterSearchWithCategory(section.title)}
                      className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                    >
                      更多
                      <ChevronRight
                        size={14}
                        className="transition-transform duration-300"
                      />
                    </button>
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
                    {section.items.slice(0, 12).map((item) => (
                      <TemplateCard
                        key={item.id}
                        item={item}
                        onUseTemplate={openTemplateInPublicCanvas}
                        onOpenDetail={(detail) => setActiveTemplateDetail(detail)}
                        className="w-[160px] sm:w-[180px]"
                      />
                    ))}
                  </div>
                </section>
              ))}
            </>
          ) : (
            <div className="space-y-10">
              {isTrafficTeamSelected ? (
                <section className="space-y-4">
                  <div className="flex items-end justify-between gap-4 flex-wrap">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-gray-900">流量素材投放模板库</h2>
                      <p className="text-xs text-gray-500">10 个高复用横版模板，支持按点击率/使用率排序</p>
                    </div>
                    <div className="inline-flex items-center rounded-full bg-gray-100 p-1 border border-black/5">
                      <button
                        type="button"
                        onClick={() => setTrafficRankTab('click')}
                        className={clsx(
                          'h-9 px-4 rounded-full text-sm font-medium transition-all',
                          trafficRankTab === 'click' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        )}
                      >
                        点击率
                      </button>
                      <button
                        type="button"
                        onClick={() => setTrafficRankTab('use')}
                        className={clsx(
                          'h-9 px-4 rounded-full text-sm font-medium transition-all',
                          trafficRankTab === 'use' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                        )}
                      >
                        使用率
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {trafficTemplatesSorted.map(template => (
                      <TrafficTemplateCard
                        key={template.id}
                        template={template}
                        isFavorite={teamTemplateFavorites.has(template.id)}
                        onToggleFavorite={toggleTeamTemplateFavorite}
                        onDoSame={(t) => doSameFromPreview(t.title, t.previewUrl, 1920, 1080)}
                      />
                    ))}
                  </div>
                </section>
              ) : teamSections.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/40 p-10 text-center">
                  <div className="text-sm font-semibold text-gray-800">暂无团队模版</div>
                  <div className="mt-2 text-xs text-gray-500">
                    可在“项目”中将设计分享至团队后，在这里统一复用与沉淀
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/projects')}
                    className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    去项目空间
                    <ChevronRight size={16} />
                  </button>
                </div>
              ) : (
                teamSections.map(section => (
                  <section key={section.id} className="space-y-4">
                    <div className="flex items-end justify-between">
                      <div className="space-y-1">
                        <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                        <p className="text-xs text-gray-500">{section.subtitle}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 transition-all duration-300">
                      {section.items.map(item => (
                        <TeamTemplateCard
                          key={item.id}
                          title={item.title}
                          previewUrl={item.previewUrl}
                          teamName={item.teamName}
                          onDoSame={(payload) => {
                            const url = payload.previewUrl || buildMockSvgDataUrl(payload.title, payload.title);
                            doSameFromPreview(payload.title, url, 1080, 1920);
                          }}
                        />
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {activeTemplateDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/30" onClick={closeTemplateDetail} />
          <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-black/10 overflow-hidden">
            <button
              type="button"
              onClick={closeTemplateDetail}
              className="absolute top-4 right-4 w-10 h-10 rounded-2xl hover:bg-black/5 text-gray-500 flex items-center justify-center transition-colors"
              aria-label="关闭"
            >
              <X size={18} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="p-6 bg-black/[0.02] border-r border-black/5">
                <div className="aspect-[9/16] rounded-2xl bg-white border border-black/10 overflow-hidden flex items-center justify-center">
                  <img
                    src={activeTemplateDetail.previewUrl}
                    alt={activeTemplateDetail.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4 pr-10">
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500">{activeTemplateDetail.authorName}</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900 truncate">{activeTemplateDetail.title}</div>
                    <div className="mt-2 text-xs text-gray-500">
                      {activeTemplateDetail.width}×{activeTemplateDetail.height} px
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => shareTemplate(activeTemplateDetail)}
                      className="w-10 h-10 rounded-2xl border border-black/10 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center transition-colors"
                      title="分享"
                      aria-label="分享"
                    >
                      <Share2 size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePublicTemplateFavorite(activeTemplateDetail.id)}
                      className={clsx(
                        "w-10 h-10 rounded-2xl border flex items-center justify-center transition-colors",
                        publicTemplateFavorites.has(activeTemplateDetail.id)
                          ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-800"
                          : "bg-white text-gray-700 border-black/10 hover:bg-gray-50"
                      )}
                      title="收藏"
                      aria-label="收藏"
                    >
                      <Heart size={18} fill={publicTemplateFavorites.has(activeTemplateDetail.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-gray-900">场景</div>
                    <select
                      value={sceneDraftById[activeTemplateDetail.id] ?? activeTemplateDetail.scene}
                      onChange={(e) => setSceneDraftById((prev) => ({ ...prev, [activeTemplateDetail.id]: e.target.value }))}
                      className="w-full h-11 px-4 rounded-2xl bg-gray-50 border border-black/10 outline-none focus:border-black/20 text-sm text-gray-700"
                      aria-label="选择场景"
                    >
                      {SCENE_OPTIONS.map((scene) => (
                        <option key={scene} value={scene}>
                          {scene}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-gray-900">元素信息</div>
                    <button
                      type="button"
                      onClick={() => setEditingElementId((prev) => (prev === activeTemplateDetail.id ? null : activeTemplateDetail.id))}
                      className="p-2 -m-2 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                      aria-label="编辑元素信息"
                      title="编辑元素信息"
                    >
                      <PencilLine size={16} />
                    </button>
                  </div>

                  {(() => {
                    const fallback = activeTemplateDetail.elements.join('，');
                    const draft = elementDraftById[activeTemplateDetail.id] ?? fallback;
                    const isEditing = editingElementId === activeTemplateDetail.id;
                    const chips = draft
                      .split(/[,，、\n]/g)
                      .map((x) => x.trim())
                      .filter(Boolean)
                      .slice(0, 12);

                    return isEditing ? (
                      <input
                        value={draft}
                        onChange={(e) => setElementDraftById((prev) => ({ ...prev, [activeTemplateDetail.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setEditingElementId(null);
                        }}
                        onBlur={() => setEditingElementId(null)}
                        className="w-full h-11 px-4 rounded-2xl bg-gray-50 border border-black/10 outline-none focus:border-black/20 text-sm"
                        placeholder="元素：小狗（用逗号分隔）"
                        autoFocus
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {chips.map((c) => (
                          <span
                            key={`${activeTemplateDetail.id}-${c}`}
                            className="inline-flex items-center h-6 px-2 rounded-full bg-gray-50 border border-black/5 text-[11px] font-semibold text-gray-700"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      openTemplateInPublicCanvas(activeTemplateDetail);
                      closeTemplateDetail();
                    }}
                    className="flex-1 justify-center px-4 py-3 rounded-2xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                  >
                    使用该模板
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      doSameFromPreview(activeTemplateDetail.title, activeTemplateDetail.previewUrl, activeTemplateDetail.width, activeTemplateDetail.height);
                      closeTemplateDetail();
                    }}
                    className="flex-1 justify-center px-4 py-3 rounded-2xl bg-white text-gray-900 border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    应用到创建设计画布
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

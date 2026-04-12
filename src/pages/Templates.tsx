import { useMemo, useState } from 'react';
import { Search, Camera, ChevronRight, Play, Heart, ChevronDown, Plus, Share2 } from 'lucide-react';
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
      id: 'new-arrivals',
      title: '新品推荐',
      subtitle: '模板上新，爆款来袭',
    },
    {
      id: 'cny-2026',
      title: '抢占春节流量C位',
      subtitle: '2026马年爆款营销案例持续更新',
    },
    {
      id: 'daily-hot',
      title: '每日热门',
      subtitle: '今日最受欢迎的设计模板',
    },
    {
      id: 'marketing-banner',
      title: '营销Banner',
      subtitle: '高点击率电商营销Banner',
    },
    {
      id: 'social-media',
      title: '社媒配图',
      subtitle: '朋友圈、小红书吸粉神器',
    },
    {
      id: 'poster-design',
      title: '海报设计',
      subtitle: '活动宣传、节日祝福海报',
    }
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

  return categories.map((cat, catIndex) => ({
    ...cat,
    items: Array.from({ length: 12 }).map((_, i) => ({
      id: `${cat.id}-${i}`,
      title: `CNY Template ${i}`,
      imageUrl: cnyImages[(catIndex * 8 + i) % cnyImages.length],
      type: i % 3 === 0 ? 'video' : 'image',
      author: authors[i % authors.length],
      stats: {
        views: Math.floor(Math.random() * 10000),
      },
    })),
  }));
};

const sections = generateMockData();

const TemplateCard = ({ item }: { item: Template }) => {
  const toast = useToast();
  return (
    <div className="flex-shrink-0 w-full group cursor-pointer flex flex-col gap-2">
      {/* Card Image Container */}
      <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-100 border border-gray-100 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-full object-cover"
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        
        {item.type === 'video' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white">
              <Play size={20} fill="currentColor" />
            </div>
          </div>
        )}

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

        {/* Hover Actions - Optional */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <button className="p-1.5 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-700">
             <Heart size={14} />
           </button>
        </div>
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

type TrafficTemplateCardProps = {
  template: TrafficTeamTemplate;
  isFavorite: boolean;
  onToggleFavorite: (templateId: string) => void;
};

const TrafficTemplateCard = ({ template, isFavorite, onToggleFavorite }: TrafficTemplateCardProps) => {
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
};

const TeamTemplateCard = ({ title, previewUrl, teamName }: TeamTemplateCardProps) => {
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

export default function Templates() {
  const navigate = useNavigate();
  const location = useLocation();
  const { teams, projects } = useProject();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [visibleSectionsCount, setVisibleSectionsCount] = useState(3);
  const [trafficRankTab, setTrafficRankTab] = useState<'click' | 'use'>('click');
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

  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const scope = searchParams.get('scope') === 'team' ? 'team' : 'public';
  const teamId = searchParams.get('teamId') || 'team-1';

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

  const handleScopeChange = (nextScope: 'public' | 'team') => {
    const nextParams = new URLSearchParams(location.search);
    nextParams.set('scope', nextScope);
    if (nextScope === 'public') {
      nextParams.delete('teamId');
    } else if (!nextParams.get('teamId')) {
      nextParams.set('teamId', 'team-1');
    }
    navigate({ pathname: location.pathname, search: nextParams.toString() }, { replace: false });
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleLoadMore = () => {
    setVisibleSectionsCount(prev => Math.min(prev + 3, sections.length));
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

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full px-8 py-6 space-y-10 pb-20">
          
          {/* Standard Header */}
          <header className="mb-8 flex items-start justify-between gap-4">
            <div className="space-y-3">
              <div className="text-xl text-gray-500 font-medium">
                {scope === 'public' ? (
                  <>
                    模版社区 <span className="mx-2">|</span> 探索高质量设计模版，激发无限创意
                  </>
                ) : (
                  <>
                    团队模版 <span className="mx-2">|</span> 在团队内复用设计资产
                  </>
                )}
              </div>
              <div className="inline-flex items-center rounded-full bg-gray-100 p-1 border border-black/5">
                <button
                  type="button"
                  onClick={() => handleScopeChange('public')}
                  className={clsx(
                    'h-9 px-4 rounded-full text-sm font-medium transition-all',
                    scope === 'public' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  公共模板
                </button>
                <button
                  type="button"
                  onClick={() => handleScopeChange('team')}
                  className={clsx(
                    'h-9 px-4 rounded-full text-sm font-medium transition-all',
                    scope === 'team' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  我的团队模版
                </button>
              </div>
            </div>
            <button onClick={() => navigate('/editor')} className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300">
              <Plus size={20} />
              创建新设计
            </button>
          </header>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative group max-w-2xl flex-1 min-w-[280px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder={scope === 'public' ? '搜索模版、风格或场景...' : '搜索团队模版...'}
                className="w-full h-12 pl-12 pr-12 bg-gray-50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-black/10 rounded-xl outline-none transition-all text-sm"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">
                <Camera size={20} />
              </button>
            </div>
            {scope === 'team' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">团队</span>
                <select
                  value={resolvedTeamId}
                  onChange={(e) => updateSearchParam('teamId', e.target.value)}
                  className="h-10 px-4 bg-gray-50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-black/10 rounded-full outline-none transition-all text-sm text-gray-700"
                >
                  {teamOptions.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {scope === 'public' ? (
            <>
              {sections.slice(0, visibleSectionsCount).map((section) => (
                <section key={section.id} className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                      <p className="text-xs text-gray-500">{section.subtitle}</p>
                    </div>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors"
                    >
                      {expandedSections[section.id] ? '收起' : '更多'}
                      <ChevronRight
                        size={14}
                        className={clsx('transition-transform duration-300', expandedSections[section.id] && 'rotate-90')}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 transition-all duration-300">
                    {(expandedSections[section.id] ? section.items : section.items.slice(0, 6)).map((item) => (
                      <TemplateCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              ))}

              {visibleSectionsCount < sections.length && (
                <div className="flex justify-center pt-8">
                  <button
                    onClick={handleLoadMore}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full font-medium transition-colors"
                  >
                    展开更多
                    <ChevronDown size={18} />
                  </button>
                </div>
              )}
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
    </div>
  );
}

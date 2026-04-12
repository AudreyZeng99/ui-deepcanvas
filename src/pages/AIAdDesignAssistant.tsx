import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, ClipboardCheck, Download, FolderOpen, Heart, Image, Package, Plus, Search, X } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';

type AssistantSection = 'materials' | 'projects' | 'review' | 'inventory';

type MaterialType = 'image' | 'layer';

type AssistantProject = {
  internalId: string;
  projectId: string;
  name: string;
  campaign: string;
  thumbnailUrl: string;
  createdAt: number;
};

type MaterialItem = {
  id: string;
  name: string;
  thumbnailUrl: string;
  updatedAt: string;
  popularity: number;
  usageFrequency: number;
  size: string;
  color: string;
  theme: string;
  isFavorite: boolean;
  tags: string[];
  isTemplate: boolean;
  materialType: MaterialType;
};

const seedMaterials: MaterialItem[] = [
  {
    id: 'MAT-100012',
    name: '金融开屏·高转化红金 CTA',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=900&auto=format&fit=crop',
    updatedAt: '2026-03-28 18:24',
    popularity: 92,
    usageFrequency: 38,
    size: '1080×1920',
    color: '红/金',
    theme: '拉新',
    isFavorite: true,
    tags: ['开屏', '红金', '强CTA', '高转化'],
    isTemplate: true,
    materialType: 'image',
  },
  {
    id: 'MAT-100013',
    name: '信息流三卖点·结构化横版',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557682260-96773eb01377?q=80&w=900&auto=format&fit=crop',
    updatedAt: '2026-03-30 09:10',
    popularity: 85,
    usageFrequency: 29,
    size: '1200×628',
    color: '蓝/白',
    theme: '信息流',
    isFavorite: false,
    tags: ['横版', '结构化', '三卖点', '信息流'],
    isTemplate: true,
    materialType: 'layer',
  },
  {
    id: 'MAT-100014',
    name: '信用卡分期·留白高级质感',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=900&auto=format&fit=crop',
    updatedAt: '2026-04-02 16:42',
    popularity: 77,
    usageFrequency: 17,
    size: '1080×1080',
    color: '黑/银',
    theme: '转化',
    isFavorite: false,
    tags: ['留白', '高级', '金融', '方正排版'],
    isTemplate: false,
    materialType: 'image',
  },
  {
    id: 'MAT-100015',
    name: '理财活动·蓝紫渐变轻科技',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=900&auto=format&fit=crop',
    updatedAt: '2026-04-05 11:06',
    popularity: 69,
    usageFrequency: 11,
    size: '1920×1080',
    color: '蓝/紫',
    theme: '活动',
    isFavorite: true,
    tags: ['渐变', '科技感', '活动', '横幅'],
    isTemplate: false,
    materialType: 'image',
  },
  {
    id: 'MAT-100016',
    name: '品牌信任·渠道投放模块化组件',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?q=80&w=900&auto=format&fit=crop',
    updatedAt: '2026-04-07 20:14',
    popularity: 88,
    usageFrequency: 34,
    size: '960×540',
    color: '青/白',
    theme: '品牌',
    isFavorite: false,
    tags: ['渠道', '信任', '模块化', '组件'],
    isTemplate: true,
    materialType: 'layer',
  },
  {
    id: 'MAT-100017',
    name: '卡券弹窗·轻量动效占位',
    thumbnailUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=900&auto=format&fit=crop',
    updatedAt: '2026-04-08 09:34',
    popularity: 61,
    usageFrequency: 8,
    size: '750×1334',
    color: '橙/白',
    theme: '运营',
    isFavorite: false,
    tags: ['弹窗', '卡券', '轻量', '运营'],
    isTemplate: false,
    materialType: 'layer',
  },
];

const ASSISTANT_PROJECTS_STORAGE_KEY = 'trae_deepcanvas_ai_ad_assistant_projects_v1';

const seedProjectThumbnails = [
  'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1557682260-96773eb01377?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?q=80&w=900&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=900&auto=format&fit=crop',
];

const sectionItems: { key: AssistantSection; label: string }[] = [
  { key: 'materials', label: '素材库' },
  { key: 'projects', label: '项目' },
  { key: 'review', label: '审核库' },
  { key: 'inventory', label: '物料库' },
];

const makeThumbnailByKey = (key: string) => {
  let acc = 0;
  for (let i = 0; i < key.length; i += 1) {
    acc = (acc + key.charCodeAt(i) * (i + 1)) % 99991;
  }
  const index = acc % seedProjectThumbnails.length;
  return seedProjectThumbnails[index];
};

const loadAssistantProjects = (): AssistantProject[] => {
  const raw = localStorage.getItem(ASSISTANT_PROJECTS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item: any) => {
        if (!item || typeof item !== 'object') return null;
        const internalId = typeof item.internalId === 'string' ? item.internalId : '';
        const projectId = typeof item.projectId === 'string' ? item.projectId : '';
        const name = typeof item.name === 'string' ? item.name : '';
        const campaign = typeof item.campaign === 'string' ? item.campaign : '';
        const thumbnailUrl = typeof item.thumbnailUrl === 'string' ? item.thumbnailUrl : '';
        const createdAt = typeof item.createdAt === 'number' ? item.createdAt : 0;
        if (!internalId || !projectId || !name) return null;
        return {
          internalId,
          projectId,
          name,
          campaign,
          thumbnailUrl: thumbnailUrl || makeThumbnailByKey(projectId),
          createdAt,
        } satisfies AssistantProject;
      })
      .filter(Boolean) as AssistantProject[];
  } catch {
    return [];
  }
};

export default function AIAdDesignAssistant() {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeSection, setActiveSection] = useState<AssistantSection>('materials');
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const set = new Set<string>();
    seedMaterials.forEach((item) => {
      if (item.isFavorite) set.add(item.id);
    });
    return set;
  });
  const [assistantProjects, setAssistantProjects] = useState<AssistantProject[]>(() => loadAssistantProjects());
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [createForm, setCreateForm] = useState(() => ({ name: '', projectId: '', campaign: '' }));
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    if (assistantProjects.length > 0) return;
    const demo: AssistantProject = {
      internalId: 'demo-project-1',
      projectId: 'PROJ-1',
      name: '项目1',
      campaign: '活动1',
      thumbnailUrl: seedProjectThumbnails[1],
      createdAt: Date.now(),
    };
    setAssistantProjects([demo]);
  }, [assistantProjects.length]);

  const materials = useMemo(() => {
    const q = query.trim().toLowerCase();
    const withFavorites = seedMaterials.map((item) => ({
      ...item,
      isFavorite: favorites.has(item.id),
    }));
    if (!q) return withFavorites;
    return withFavorites.filter((item) => {
      const haystack = [
        item.id,
        item.name,
        item.size,
        item.color,
        item.theme,
        item.materialType,
        item.isTemplate ? 'template' : 'not-template',
        ...item.tags,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [favorites, query]);

  const reviewItems = useMemo(() => {
    return [
      {
        internalId: 'review-1',
        assetId: 'AUD-0001',
        projectName: '项目1',
        inInventory: true,
        thumbnailUrl: seedProjectThumbnails[0],
        stages: ['待审核', '审核中', '审核通过'] as [string, string, string],
        status: ['done', 'done', 'pending'] as const,
      },
      {
        internalId: 'review-2',
        assetId: 'AUD-0002',
        projectName: '项目1',
        inInventory: false,
        thumbnailUrl: seedProjectThumbnails[1],
        stages: ['待审核', '审核中', '审核失败'] as [string, string, string],
        status: ['done', 'done', 'failed'] as const,
      },
      {
        internalId: 'review-3',
        assetId: 'AUD-0003',
        projectName: '项目1',
        inInventory: true,
        thumbnailUrl: seedProjectThumbnails[2],
        stages: ['审核成功', '已投放', '已淘汰'] as [string, string, string],
        status: ['done', 'done', 'failed'] as const,
      },
      {
        internalId: 'review-4',
        assetId: 'AUD-0004',
        projectName: '项目1',
        inInventory: true,
        thumbnailUrl: seedProjectThumbnails[3],
        stages: ['审核成功', '已投放', '投放中'] as [string, string, string],
        status: ['done', 'done', 'done'] as const,
      },
    ];
  }, []);

  useEffect(() => {
    localStorage.setItem(ASSISTANT_PROJECTS_STORAGE_KEY, JSON.stringify(assistantProjects));
  }, [assistantProjects]);

  const toggleExpanded = (materialId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(materialId)) next.delete(materialId);
      else next.add(materialId);
      return next;
    });
  };

  const toggleFavorite = (materialId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(materialId)) next.delete(materialId);
      else next.add(materialId);
      return next;
    });
  };

  const openCreateProject = () => {
    setCreateError(null);
    setCreateForm({ name: '', projectId: '', campaign: '' });
    setIsCreateProjectOpen(true);
  };

  const closeCreateProject = () => {
    setIsCreateProjectOpen(false);
    setCreateError(null);
  };

  const submitCreateProject = () => {
    const name = createForm.name.trim();
    const projectId = createForm.projectId.trim();
    const campaign = createForm.campaign.trim();
    if (!name || !projectId || !campaign) {
      setCreateError('请填写：项目名称、项目ID、关联活动');
      return;
    }
    if (assistantProjects.some((p) => p.projectId.toLowerCase() === projectId.toLowerCase())) {
      setCreateError('项目ID 已存在，请换一个');
      return;
    }

    const internalId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`;
    const createdAt = Date.now();
    const next: AssistantProject = {
      internalId,
      projectId,
      name,
      campaign,
      thumbnailUrl: makeThumbnailByKey(projectId),
      createdAt,
    };
    setAssistantProjects((prev) => [next, ...prev]);
    closeCreateProject();
  };

  const navItems: {
    key: AssistantSection;
    label: string;
    icon: React.ElementType;
    count: string;
  }[] = [
    { key: 'materials', label: '素材库', icon: Image, count: String(materials.length) },
    { key: 'projects', label: '项目', icon: FolderOpen, count: String(assistantProjects.length) },
    { key: 'review', label: '审核库', icon: ClipboardCheck, count: String(reviewItems.length) },
    { key: 'inventory', label: '物料库', icon: Package, count: '—' },
  ];

  return (
    <div className="min-h-screen bg-[#F3F6F4]">
      <aside className="fixed left-0 top-0 h-screen flex flex-col py-6 bg-white/80 backdrop-blur border-r border-gray-100/80 z-50 w-20 items-center">
        <div className="mb-8 flex items-center justify-center">
          <button type="button" onClick={() => navigate('/')} className="group" aria-label="返回首页">
            <div className="w-10 h-10 bg-[rgba(74,222,128,0.7)] rounded-xl flex items-center justify-center text-gray-900 font-bold text-xl shrink-0 transition-transform duration-150 group-hover:scale-[1.02]">
              A
            </div>
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-3 overflow-y-auto w-full no-scrollbar px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeSection;
            return (
              <div key={item.key} className="inline-block w-full">
                <button
                  type="button"
                  onClick={() => setActiveSection(item.key)}
                  className={clsx(
                    'p-2.5 rounded-xl transition-colors duration-150 group relative flex flex-col items-center justify-center w-full gap-1 border',
                    isActive
                      ? 'bg-gray-100/80 border-gray-200 text-gray-900'
                      : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-100 hover:text-gray-900'
                  )}
                  title={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={22} className="shrink-0" />
                  <span className="text-[10px] font-semibold leading-none">{item.label}</span>
                  <span
                    className={clsx(
                      'absolute -right-1.5 -top-1.5 min-w-5 h-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center border',
                      isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-500'
                    )}
                  >
                    {item.count}
                  </span>
                </button>
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="pl-24 pr-8 py-8">
        <div className="max-w-[1600px] mx-auto">
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div>
                <div className="text-xl font-semibold text-gray-900">{sectionItems.find((item) => item.key === activeSection)?.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">AI广告设计助手</div>
              </div>
            </div>
          </header>

          <main className="min-w-0">
            <div className="pt-2">
              {activeSection === 'materials' ? (
                <div className="space-y-6">
                  <div className="w-full sm:w-[520px]">
                    <div className="flex items-center gap-2 bg-white/70 backdrop-blur border border-black/5 rounded-2xl px-3 py-2.5">
                      <Search size={16} className="text-gray-400" />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="搜索：素材ID / 名称 / 标签 / 主题 / 尺寸…"
                        className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {materials.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/40 py-16 text-center">
                      <div className="text-sm font-semibold text-gray-900">未找到匹配素材</div>
                      <div className="text-xs text-gray-500 mt-1">尝试更换关键词或清空搜索</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                      {materials.map((material) => {
                        const isExpanded = expandedIds.has(material.id);
                        return (
                          <div
                            key={material.id}
                            className="group rounded-3xl border border-black/5 bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                          >
                            <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                              <img
                                src={material.thumbnailUrl}
                                alt={material.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                              />
                              <button
                                type="button"
                                onClick={() => toggleFavorite(material.id)}
                                className={clsx(
                                  'absolute top-3 right-3 w-9 h-9 rounded-full border backdrop-blur-md flex items-center justify-center transition-all',
                                  material.isFavorite
                                    ? 'bg-white/90 border-black/10 text-rose-600'
                                    : 'bg-white/70 border-white/40 text-gray-600 hover:bg-white/90'
                                )}
                                aria-label="Toggle favorite"
                              >
                                <Heart size={16} fill={material.isFavorite ? 'currentColor' : 'none'} />
                              </button>
                            </div>

                            <div className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-gray-900 truncate">{material.name}</div>
                                  <div className="text-[11px] text-gray-500 mt-1">{material.id}</div>
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="px-2 py-1 rounded-full bg-gray-50 border border-black/5 text-xs text-gray-700">{material.size}</span>
                                <span className="px-2 py-1 rounded-full bg-gray-50 border border-black/5 text-xs text-gray-700">{material.theme}</span>
                                <span className="px-2 py-1 rounded-full bg-gray-50 border border-black/5 text-xs text-gray-700">{material.materialType}</span>
                                <span className="px-2 py-1 rounded-full bg-gray-50 border border-black/5 text-xs text-gray-700">{material.isTemplate ? '模板' : '非模板'}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleExpanded(material.id)}
                                className="mt-4 w-full flex items-center justify-between px-3 py-2.5 rounded-2xl bg-gray-50/60 border border-black/5 hover:bg-gray-50 transition-colors"
                              >
                                <span className="text-xs font-semibold text-gray-700">标签信息</span>
                                <ChevronDown
                                  size={16}
                                  className={clsx('text-gray-500 transition-transform', isExpanded ? 'rotate-180' : 'rotate-0')}
                                />
                              </button>

                              {isExpanded && (
                                <div className="mt-3 rounded-2xl bg-gray-50/60 border border-black/5 p-3 animate-in fade-in duration-300">
                                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                                    <Meta label="素材ID" value={material.id} />
                                    <Meta label="素材名称" value={material.name} />
                                    <Meta label="最新更新时间" value={material.updatedAt} />
                                    <Meta label="热度" value={String(material.popularity)} />
                                    <Meta label="使用频率" value={String(material.usageFrequency)} />
                                    <Meta label="尺寸" value={material.size} />
                                    <Meta label="颜色" value={material.color} />
                                    <Meta label="主题" value={material.theme} />
                                    <Meta label="是否被收藏" value={material.isFavorite ? '是' : '否'} />
                                    <Meta label="素材标签信息" value={material.tags.join('、')} />
                                    <Meta label="素材是否为模板" value={material.isTemplate ? '是' : '否'} />
                                    <Meta label="素材是否为image or layer" value={material.materialType} />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : activeSection === 'projects' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    <button
                      type="button"
                      onClick={openCreateProject}
                      className="group rounded-3xl border border-dashed border-black/10 bg-white overflow-hidden text-left transition-all duration-300 hover:border-black/20 hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-black/[0.02] to-black/[0.06]">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-black/10 shadow-sm flex items-center justify-center text-gray-700 transition-transform duration-300 group-hover:scale-105">
                            <Plus size={22} />
                          </div>
                          <div className="text-sm font-semibold text-gray-900">新建项目</div>
                          <div className="text-xs text-gray-500">输入项目ID并关联活动</div>
                        </div>
                      </div>
                    </button>

                    {assistantProjects.map((project) => (
                      <button
                        key={project.internalId}
                        type="button"
                        onClick={() => navigate(`/ai-ad-design-assistant/projects/${project.internalId}`)}
                        className="group rounded-3xl border border-black/5 bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 text-left"
                      >
                        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                          <img
                            src={project.thumbnailUrl}
                            alt={project.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="p-4 space-y-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">{project.name}</div>
                            <div className="text-[11px] text-gray-500 mt-1 truncate">ID: {project.projectId}</div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 rounded-full bg-gray-50 border border-black/5 text-xs text-gray-700 truncate">
                              关联活动：{project.campaign}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {isCreateProjectOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                      <button
                        type="button"
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeCreateProject}
                        aria-label="Close"
                      />
                      <div className="relative w-full max-w-[520px] bg-white rounded-3xl border border-black/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                          <div>
                            <div className="text-lg font-bold text-gray-900">新建项目</div>
                            <div className="text-xs text-gray-500 mt-1">请填写项目基础信息</div>
                          </div>
                          <button
                            type="button"
                            onClick={closeCreateProject}
                            className="w-10 h-10 rounded-full border border-black/10 bg-white hover:bg-gray-50 transition-colors flex items-center justify-center text-gray-700"
                            aria-label="Close"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <div className="p-6 space-y-4">
                          <Field
                            label="项目名称"
                            value={createForm.name}
                            placeholder="例如：4月开屏拉新"
                            onChange={(value) => setCreateForm((prev) => ({ ...prev, name: value }))}
                          />
                          <Field
                            label="项目ID"
                            value={createForm.projectId}
                            placeholder="例如：PROJ-202604-001"
                            onChange={(value) => setCreateForm((prev) => ({ ...prev, projectId: value }))}
                          />
                          <Field
                            label="关联活动"
                            value={createForm.campaign}
                            placeholder="例如：春季权益加码"
                            onChange={(value) => setCreateForm((prev) => ({ ...prev, campaign: value }))}
                          />

                          {createError && <div className="text-xs font-semibold text-rose-600">{createError}</div>}
                        </div>

                        <div className="px-6 pb-6 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={closeCreateProject}
                            className="h-10 px-4 rounded-2xl border border-black/10 bg-white hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700"
                          >
                            取消
                          </button>
                          <button
                            type="button"
                            onClick={submitCreateProject}
                            className="h-10 px-4 rounded-2xl bg-gray-900 hover:bg-black transition-colors text-sm font-semibold text-white"
                          >
                            创建
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeSection === 'review' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {reviewItems.map((item) => (
                      <div
                        key={item.internalId}
                        className="group rounded-3xl border border-black/5 bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                      >
                        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                          <img
                            src={item.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                          <span
                            className={clsx(
                              'absolute left-3 top-3 px-2 py-1 rounded-full border text-[11px] font-semibold bg-white/90 backdrop-blur',
                              item.inInventory ? 'border-emerald-200 text-emerald-700' : 'border-gray-200 text-gray-700'
                            )}
                          >
                            {item.inInventory ? '已入物料库' : '未入物料库'}
                          </span>
                        </div>

                        <div className="p-4 space-y-3">
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-900 truncate">素材编号：{item.assetId}</div>
                            <div className="text-[11px] text-gray-500 mt-1 truncate">所属项目：{item.projectName}</div>
                          </div>

                          <StatusTrack stages={item.stages} status={item.status} compact />

                          <button
                            type="button"
                            onClick={() => toast.show('导出系统功能开发中')}
                            className="w-full h-9 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-xs font-semibold text-gray-700 flex items-center justify-center gap-2"
                          >
                            <Download size={16} />
                            导出系统
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptySection title={sectionItems.find((item) => item.key === activeSection)?.label || ''} />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</div>
      <div className="text-xs font-semibold text-gray-900 mt-1 truncate">{value}</div>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-gray-900">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full h-11 px-4 rounded-2xl bg-gray-50/70 border border-black/5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:border-black/10 transition-colors"
      />
    </label>
  );
}

function EmptySection({ title }: { title: string }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center">
      <div className="text-sm font-semibold text-gray-900">{title}</div>
      <div className="text-xs text-gray-500 mt-1">该模块页面结构已就绪，内容填充中</div>
    </div>
  );
}

function StatusTrack({
  stages,
  status,
  compact,
}: {
  stages: [string, string, string];
  status: readonly ['done' | 'pending' | 'failed', 'done' | 'pending' | 'failed', 'done' | 'pending' | 'failed'];
  compact?: boolean;
}) {
  const getNodeStyle = (state: 'done' | 'pending' | 'failed') => {
    if (state === 'done') return { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-white' };
    if (state === 'failed') return { bg: 'bg-rose-500', border: 'border-rose-500', text: 'text-white' };
    return { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-400' };
  };

  const segment12 = status[1] === 'failed' ? 'bg-rose-500' : status[0] === 'done' && status[1] === 'done' ? 'bg-emerald-500' : 'bg-gray-200';
  const segment23 = status[2] === 'failed' ? 'bg-rose-500' : status[1] === 'done' && status[2] === 'done' ? 'bg-emerald-500' : 'bg-gray-200';

  const wrapperClass = compact ? 'rounded-2xl bg-gray-50/60 border border-black/5 px-2 py-2' : 'rounded-2xl bg-gray-50/70 border border-black/5 px-3 py-3';
  const lineTopClass = compact ? 'top-2.5' : 'top-3';
  const nodeClass = compact ? 'w-5 h-5' : 'w-6 h-6';
  const labelClass = compact ? 'text-[10px] leading-4' : 'text-[11px] leading-4';
  const iconSize = compact ? 12 : 14;
  const pendingDotClass = compact ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const itemGap = compact ? 'gap-1.5' : 'gap-2';

  return (
    <div className={wrapperClass}>
      <div className="relative">
        <div className={clsx('absolute h-[2px] bg-gray-200', lineTopClass)} style={{ left: '16.6667%', right: '16.6667%' }} />
        <div className={clsx('absolute h-[2px]', lineTopClass, segment12)} style={{ left: '16.6667%', width: '33.3333%' }} />
        <div className={clsx('absolute h-[2px]', lineTopClass, segment23)} style={{ left: '50%', width: '33.3333%' }} />

        <div className="grid grid-cols-3">
          {[0, 1, 2].map((idx) => {
            const st = status[idx];
            const style = getNodeStyle(st);
            return (
              <div key={stages[idx]} className={clsx('flex flex-col items-center', itemGap)}>
                <div className={clsx(nodeClass, 'rounded-full border flex items-center justify-center', style.bg, style.border, style.text)}>
                  {st === 'done' ? (
                    <Check size={iconSize} />
                  ) : st === 'failed' ? (
                    <X size={iconSize} />
                  ) : (
                    <div className={clsx(pendingDotClass, 'rounded-full bg-gray-300')} />
                  )}
                </div>
                <div className={clsx(labelClass, 'text-gray-600 text-center')}>{stages[idx]}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

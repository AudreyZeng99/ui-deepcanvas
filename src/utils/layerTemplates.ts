export type LibraryScope = 'public' | 'team';

export type ToneColor = 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'purple';

export type ImageSize = 'large_banner' | 'small_banner' | 'hero_banner';

export type ActivityType = '拉新活动' | '节日营销' | '权益推广' | '品牌宣传';

export type BenefitType = '红包福利' | '积分权益' | '礼品权益' | '会员权益';

export type LayerTemplate = {
  id: string;
  name: string;
  scope: LibraryScope;
  projectId: string;
  projectName: string;
  previewUrl: string;
  createdAt: number;
  hasXiaofulu: boolean;
  hasJiaojiao: boolean;
  color: ToneColor;
  imageSize: ImageSize;
  activityType: ActivityType;
  benefitType: BenefitType;
  usageCount: number;
  isFavorite: boolean;
};

export const LAYER_TEMPLATES_STORAGE_KEY = 'deepcanvas_layer_templates_v1';
const MIN_TEMPLATE_COUNT_PER_SIZE = 3;

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function buildSeedTemplates(now: number): LayerTemplate[] {
  return [
    {
      id: 'lt-001',
      name: '主KV-利益点叠层（红金）',
      scope: 'team',
      projectId: 'p-shenxiang',
      projectName: '深享福利周周有礼',
      previewUrl: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?q=80&w=1200&auto=format&fit=crop',
      createdAt: now - 1000 * 60 * 60 * 12,
      hasXiaofulu: true,
      hasJiaojiao: false,
      color: 'red',
      imageSize: 'large_banner',
      activityType: '权益推广',
      benefitType: '红包福利',
      usageCount: 48,
      isFavorite: true,
    },
    {
      id: 'lt-002',
      name: '信息流横幅-强CTA（蓝）',
      scope: 'public',
      projectId: 'p-shenxiang',
      projectName: '深享福利周周有礼',
      previewUrl: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1200&auto=format&fit=crop',
      createdAt: now - 1000 * 60 * 60 * 22,
      hasXiaofulu: false,
      hasJiaojiao: true,
      color: 'blue',
      imageSize: 'small_banner',
      activityType: '拉新活动',
      benefitType: '积分权益',
      usageCount: 72,
      isFavorite: false,
    },
    {
      id: 'lt-003',
      name: '首屏主视觉-节日权益（紫）',
      scope: 'team',
      projectId: 'p-login',
      projectName: '登陆有礼',
      previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      createdAt: now - 1000 * 60 * 60 * 36,
      hasXiaofulu: false,
      hasJiaojiao: false,
      color: 'purple',
      imageSize: 'hero_banner',
      activityType: '节日营销',
      benefitType: '礼品权益',
      usageCount: 21,
      isFavorite: true,
    },
    {
      id: 'lt-004',
      name: '大促活动横幅-流程引导（绿）',
      scope: 'public',
      projectId: 'p-jianbu',
      projectName: '分行健步走',
      previewUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop',
      createdAt: now - 1000 * 60 * 60 * 44,
      hasXiaofulu: true,
      hasJiaojiao: true,
      color: 'green',
      imageSize: 'large_banner',
      activityType: '品牌宣传',
      benefitType: '会员权益',
      usageCount: 35,
      isFavorite: false,
    },
    {
      id: 'lt-005',
      name: '福利弹窗-权益领取（橙）',
      scope: 'public',
      projectId: 'p-shenxiang',
      projectName: '深享福利周周有礼',
      previewUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
      createdAt: now - 1000 * 60 * 60 * 10,
      hasXiaofulu: true,
      hasJiaojiao: false,
      color: 'orange',
      imageSize: 'small_banner',
      activityType: '权益推广',
      benefitType: '红包福利',
      usageCount: 28,
      isFavorite: false,
    },
    {
      id: 'lt-006',
      name: '首页首图-新人礼引导（蓝紫）',
      scope: 'team',
      projectId: 'p-login',
      projectName: '登陆有礼',
      previewUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop',
      createdAt: now - 1000 * 60 * 60 * 16,
      hasXiaofulu: false,
      hasJiaojiao: true,
      color: 'blue',
      imageSize: 'hero_banner',
      activityType: '拉新活动',
      benefitType: '积分权益',
      usageCount: 64,
      isFavorite: true,
    },
    {
      id: 'lt-007',
      name: '首页通栏大banner-活动总览（黄）',
      scope: 'team',
      projectId: 'p-jianbu',
      projectName: '分行健步走',
      previewUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=1200&auto=format&fit=crop',
      createdAt: now - 1000 * 60 * 60 * 30,
      hasXiaofulu: false,
      hasJiaojiao: true,
      color: 'yellow',
      imageSize: 'large_banner',
      activityType: '品牌宣传',
      benefitType: '会员权益',
      usageCount: 19,
      isFavorite: false,
    },
    {
      id: 'lt-008',
      name: '小banner-业务提醒组件（青）',
      scope: 'public',
      projectId: 'p-login',
      projectName: '登陆有礼',
      previewUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200&auto=format&fit=crop',
      createdAt: now - 1000 * 60 * 60 * 18,
      hasXiaofulu: false,
      hasJiaojiao: false,
      color: 'cyan',
      imageSize: 'small_banner',
      activityType: '节日营销',
      benefitType: '礼品权益',
      usageCount: 17,
      isFavorite: false,
    },
    {
      id: 'lt-009',
      name: '首图banner-权益集合页（红）',
      scope: 'public',
      projectId: 'p-shenxiang',
      projectName: '深享福利周周有礼',
      previewUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop',
      createdAt: now - 1000 * 60 * 60 * 8,
      hasXiaofulu: true,
      hasJiaojiao: true,
      color: 'red',
      imageSize: 'hero_banner',
      activityType: '权益推广',
      benefitType: '会员权益',
      usageCount: 41,
      isFavorite: true,
    },
  ];
}

function seedTemplatesIfMissing() {
  const existing = safeParseJson<LayerTemplate[] | null>(localStorage.getItem(LAYER_TEMPLATES_STORAGE_KEY), null);
  if (Array.isArray(existing) && existing.length > 0) return;
  const now = Date.now();
  const samples = buildSeedTemplates(now);
  localStorage.setItem(LAYER_TEMPLATES_STORAGE_KEY, JSON.stringify(samples));
}

function ensureTemplateCoverage(templates: LayerTemplate[]) {
  const counts = templates.reduce<Record<ImageSize, number>>(
    (acc, item) => {
      acc[item.imageSize] += 1;
      return acc;
    },
    {
      large_banner: 0,
      small_banner: 0,
      hero_banner: 0,
    }
  );

  const existingIds = new Set(templates.map((item) => item.id));
  const fallbackSamples = buildSeedTemplates(Date.now());
  const additions: LayerTemplate[] = [];

  (['large_banner', 'small_banner', 'hero_banner'] as ImageSize[]).forEach((size) => {
    if (counts[size] >= MIN_TEMPLATE_COUNT_PER_SIZE) return;
    const candidates = fallbackSamples.filter((item) => item.imageSize === size && !existingIds.has(item.id));
    const needed = MIN_TEMPLATE_COUNT_PER_SIZE - counts[size];
    candidates.slice(0, needed).forEach((item) => {
      additions.push(item);
      existingIds.add(item.id);
    });
  });

  if (additions.length === 0) return templates;
  const merged = [...templates, ...additions].sort((a, b) => b.createdAt - a.createdAt);
  localStorage.setItem(LAYER_TEMPLATES_STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

export function readLayerTemplates(): LayerTemplate[] {
  if (typeof window === 'undefined') return [];
  seedTemplatesIfMissing();
  const parsed = safeParseJson<LayerTemplate[]>(localStorage.getItem(LAYER_TEMPLATES_STORAGE_KEY), []);
  if (!Array.isArray(parsed)) return [];
  const normalized = parsed
    .filter((t) => t && typeof t.id === 'string' && typeof t.name === 'string' && typeof t.previewUrl === 'string')
    .map((t): LayerTemplate => ({
      id: t.id,
      name: t.name,
      scope: t.scope === 'team' ? 'team' : 'public',
      projectId: typeof t.projectId === 'string' ? t.projectId : 'p-shenxiang',
      projectName: typeof t.projectName === 'string' ? t.projectName : '未命名项目',
      previewUrl: t.previewUrl,
      createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now(),
      hasXiaofulu: !!t.hasXiaofulu,
      hasJiaojiao: !!t.hasJiaojiao,
      color: (t.color as ToneColor) || 'red',
      imageSize:
        t.imageSize === 'large_banner' || t.imageSize === 'small_banner' || t.imageSize === 'hero_banner'
          ? t.imageSize
          : t.imageSize === 'landscape'
            ? 'large_banner'
            : t.imageSize === 'square'
              ? 'small_banner'
              : 'hero_banner',
      activityType: (t.activityType as ActivityType) || '权益推广',
      benefitType: (t.benefitType as BenefitType) || '红包福利',
      usageCount: typeof t.usageCount === 'number' ? t.usageCount : 0,
      isFavorite: !!t.isFavorite,
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
  return ensureTemplateCoverage(normalized);
}

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { Search, Plus, Star } from 'lucide-react';
import { useToast } from '../components/ToastProvider';
import {
  LAYER_TEMPLATES_STORAGE_KEY,
  type LayerTemplate,
  type LibraryScope,
  type ToneColor,
  type ImageSize,
  type ActivityType,
  type BenefitType,
  readLayerTemplates,
} from '../utils/layerTemplates';

const PROJECTS: Array<{ id: string; name: string }> = [
  { id: 'p-shenxiang', name: '深享福利周周有礼' },
  { id: 'p-jianbu', name: '分行健步走' },
  { id: 'p-login', name: '登陆有礼' },
];

const IMAGE_SIZE_OPTIONS: Array<{ value: ImageSize; label: string }> = [
  { value: 'large_banner', label: '大banner' },
  { value: 'small_banner', label: '小banner' },
  { value: 'hero_banner', label: '首图banner' },
];

const ACTIVITY_TYPE_OPTIONS: ActivityType[] = ['拉新活动', '节日营销', '权益推广', '品牌宣传'];

const BENEFIT_TYPE_OPTIONS: BenefitType[] = ['红包福利', '积分权益', '礼品权益', '会员权益'];

const COLOR_OPTIONS: Array<{ id: ToneColor; label: string; className: string }> = [
  { id: 'red', label: '红', className: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'orange', label: '橙', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'yellow', label: '黄', className: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  { id: 'green', label: '绿', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'cyan', label: '青', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { id: 'blue', label: '蓝', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'purple', label: '紫', className: 'bg-purple-50 text-purple-700 border-purple-200' },
];

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function writeTemplates(next: LayerTemplate[]) {
  localStorage.setItem(LAYER_TEMPLATES_STORAGE_KEY, JSON.stringify(next));
}

type SortMode = 'latest' | 'hottest' | 'usage';

export default function LayerLibrary() {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const [imageSize, setImageSize] = useState<ImageSize | ''>('');
  const [color, setColor] = useState<ToneColor | null>(null);
  const [activityType, setActivityType] = useState<ActivityType | ''>('');
  const [benefitType, setBenefitType] = useState<BenefitType | ''>('');
  const [scope, setScope] = useState<LibraryScope | ''>('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  const templatesRef = useRef<LayerTemplate[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    templatesRef.current = readLayerTemplates();
    setTick((v) => v + 1);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, sortMode, imageSize, color, activityType, benefitType, scope, onlyFavorites]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = templatesRef.current
      .filter((t) => (scope ? t.scope === scope : true))
      .filter((t) => {
        if (!q) return true;
        return (
          t.name.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.projectName.toLowerCase().includes(q)
        );
      })
      .filter((t) => (imageSize ? t.imageSize === imageSize : true))
      .filter((t) => (color === null ? true : t.color === color))
      .filter((t) => (activityType ? t.activityType === activityType : true))
      .filter((t) => (benefitType ? t.benefitType === benefitType : true))
      .filter((t) => (onlyFavorites ? t.isFavorite : true));

    return [...list].sort((a, b) => {
      if (sortMode === 'usage') return b.usageCount - a.usageCount;
      if (sortMode === 'hottest') {
        const scoreA = a.usageCount + (a.isFavorite ? 30 : 0);
        const scoreB = b.usageCount + (b.isFavorite ? 30 : 0);
        return scoreB - scoreA;
      }
      return b.createdAt - a.createdAt;
    });
  }, [tick, scope, query, sortMode, imageSize, color, activityType, benefitType, onlyFavorites]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const createTemplate = () => {
    const name = window.prompt('请输入图层模板名称');
    if (!name || !name.trim()) return;
    const fallbackProject = PROJECTS[0];
    const next: LayerTemplate = {
      id: makeId('lt'),
      name: name.trim(),
      scope: scope || 'public',
      projectId: fallbackProject.id,
      projectName: fallbackProject.name,
      previewUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1200&auto=format&fit=crop',
      createdAt: Date.now(),
      hasXiaofulu: false,
      hasJiaojiao: false,
      color: 'red',
      imageSize: 'small_banner',
      activityType: '权益推广',
      benefitType: '红包福利',
      usageCount: 0,
      isFavorite: false,
    };
    const nextList = [next, ...templatesRef.current];
    writeTemplates(nextList);
    templatesRef.current = nextList;
    setTick((v) => v + 1);
    toast.show('已新建图层模板（模拟）');
  };

  const toggleFavorite = (templateId: string) => {
    const nextList = templatesRef.current.map((item) =>
      item.id === templateId
        ? {
            ...item,
            isFavorite: !item.isFavorite,
          }
        : item
    );
    writeTemplates(nextList);
    templatesRef.current = nextList;
    setTick((v) => v + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="w-full space-y-6 px-8 py-8">
        <div className="space-y-4 border-b border-black/5 pb-5">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索图层模板名称 / 项目 / ID"
              className="h-11 w-full border border-black/10 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-black/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium text-gray-700">排序筛选：</span>
              <ToolbarToggle label="最新" active={sortMode === 'latest'} onClick={() => setSortMode('latest')} />
              <ToolbarToggle label="最热" active={sortMode === 'hottest'} onClick={() => setSortMode('hottest')} />
              <ToolbarToggle label="使用频率" active={sortMode === 'usage'} onClick={() => setSortMode('usage')} />
            </div>

            <ToolbarSelect
              value={imageSize}
              onChange={(value) => setImageSize((value as ImageSize | '') || '')}
              placeholder="图片尺寸"
              options={IMAGE_SIZE_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
            />
            <ToolbarSelect
              value={color ?? ''}
              onChange={(value) => setColor(value ? (value as ToneColor) : null)}
              placeholder="颜色"
              options={COLOR_OPTIONS.map((item) => ({ value: item.id, label: item.label }))}
            />
            <ToolbarSelect
              value={activityType}
              onChange={(value) => setActivityType((value as ActivityType | '') || '')}
              placeholder="活动类型"
              options={ACTIVITY_TYPE_OPTIONS.map((item) => ({ value: item, label: item }))}
            />
            <ToolbarSelect
              value={benefitType}
              onChange={(value) => setBenefitType((value as BenefitType | '') || '')}
              placeholder="权益类型"
              options={BENEFIT_TYPE_OPTIONS.map((item) => ({ value: item, label: item }))}
            />
            <ToolbarSelect
              value={scope}
              onChange={(value) => setScope((value as LibraryScope | '') || '')}
              placeholder="模版权限"
              options={[
                { value: 'team', label: '团队' },
                { value: 'public', label: '个人' },
              ]}
            />

            <button
              type="button"
              onClick={() => setOnlyFavorites((prev) => !prev)}
              className={clsx(
                'ml-auto inline-flex h-10 items-center gap-2 rounded-[10px] border px-4 text-sm font-medium transition-colors',
                onlyFavorites
                  ? 'border-black bg-black text-white'
                  : 'border-black/10 bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              <Star size={15} className={onlyFavorites ? 'fill-current' : ''} />
              只看收藏
            </button>
            <button
              type="button"
              onClick={createTemplate}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-900"
            >
              <Plus size={16} />
              新建图层模板
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          <button
            type="button"
            onClick={createTemplate}
            className="border border-dashed border-gray-300 bg-white p-3 text-left transition hover:bg-gray-50"
          >
            <div className="flex flex-col gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-black text-white">
                <Plus size={16} />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">新建图层模板</div>
                <div className="mt-1 text-[11px] leading-5 text-gray-500">快速添加模板条目</div>
              </div>
            </div>
          </button>

          {paged.map((t) => (
            <div key={t.id} className="overflow-hidden border border-gray-200 bg-white transition hover:shadow-md">
              <div className={clsx('relative bg-gray-50', getTemplatePreviewAspectClass(t.imageSize))}>
                <img src={t.previewUrl} alt={t.name} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => toggleFavorite(t.id)}
                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-[8px] border border-white/60 bg-white/90 text-gray-600 backdrop-blur transition-colors hover:text-gray-900"
                  aria-label={t.isFavorite ? '取消收藏' : '收藏模板'}
                >
                  <Star size={13} className={t.isFavorite ? 'fill-current text-amber-400' : ''} />
                </button>
              </div>
              <div className="space-y-2 p-3">
                <div className="text-xs font-semibold text-gray-900 line-clamp-2">{t.name}</div>
                <div className="text-[11px] text-gray-500 line-clamp-1">{t.projectName}</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                    <Chip>{IMAGE_SIZE_OPTIONS.find((item) => item.value === t.imageSize)?.label || '—'}</Chip>
                    <Chip>{COLOR_OPTIONS.find((c) => c.id === t.color)?.label || '—'}</Chip>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>{t.scope === 'team' ? '团队' : '个人'}</span>
                  <span>{t.usageCount} 次</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            共 {filtered.length} 个 · 第 {pageSafe} / {totalPages} 页
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageSafe <= 1}
              className="h-9 px-4 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition text-sm font-semibold text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={pageSafe >= totalPages}
              className="h-9 px-4 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition text-sm font-semibold text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-0.5 rounded-full bg-gray-100 border border-black/5 text-[10px] font-semibold text-gray-700">{children}</span>;
}

function getTemplatePreviewAspectClass(imageSize: ImageSize) {
  if (imageSize === 'large_banner') return 'aspect-[16/9]';
  if (imageSize === 'hero_banner') return 'aspect-[3/4]';
  return 'aspect-[4/3]';
}

function ToolbarToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex h-8 items-center rounded-[999px] border px-3 text-xs font-semibold transition-colors',
        active ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-gray-700 hover:bg-gray-50'
      )}
    >
      {label}
    </button>
  );
}

function ToolbarSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 min-w-[112px] rounded-[10px] border border-black/10 bg-white px-3 text-sm text-gray-700 outline-none transition-colors focus:border-black/30"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

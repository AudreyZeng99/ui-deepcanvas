import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { Search, Plus } from 'lucide-react';
import { useToast } from '../components/ToastProvider';

type LibraryScope = 'public' | 'team';

type ToneColor = 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'purple';

type LayerTemplate = {
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
};

const STORAGE_KEY = 'deepcanvas_layer_templates_v1';

const PROJECTS: Array<{ id: string; name: string }> = [
  { id: 'p-shenxiang', name: '深享福利周周有礼' },
  { id: 'p-jianbu', name: '分行健步走' },
  { id: 'p-login', name: '登陆有礼' },
];

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

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function seedTemplatesIfMissing() {
  const existing = safeParseJson<LayerTemplate[] | null>(localStorage.getItem(STORAGE_KEY), null);
  if (Array.isArray(existing) && existing.length > 0) return;
  const now = Date.now();
  const samples: LayerTemplate[] = [
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
    },
    {
      id: 'lt-003',
      name: '弹屏-留白结构（紫）',
      scope: 'team',
      projectId: 'p-login',
      projectName: '登陆有礼',
      previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      createdAt: now - 1000 * 60 * 60 * 36,
      hasXiaofulu: false,
      hasJiaojiao: false,
      color: 'purple',
    },
    {
      id: 'lt-004',
      name: '长图海报-活动流程（绿）',
      scope: 'public',
      projectId: 'p-jianbu',
      projectName: '分行健步走',
      previewUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1200&auto=format&fit=crop',
      createdAt: now - 1000 * 60 * 60 * 44,
      hasXiaofulu: true,
      hasJiaojiao: true,
      color: 'green',
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
}

function readTemplates(): LayerTemplate[] {
  seedTemplatesIfMissing();
  const parsed = safeParseJson<LayerTemplate[]>(localStorage.getItem(STORAGE_KEY), []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((t) => t && typeof t.id === 'string' && typeof t.name === 'string' && typeof t.previewUrl === 'string')
    .map((t) => ({
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
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

function writeTemplates(next: LayerTemplate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function LayerLibrary() {
  const toast = useToast();
  const [scope, setScope] = useState<LibraryScope>('public');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => PROJECTS[0].id);
  const [query, setQuery] = useState('');
  const [hasXiaofulu, setHasXiaofulu] = useState<boolean | null>(null);
  const [hasJiaojiao, setHasJiaojiao] = useState<boolean | null>(null);
  const [color, setColor] = useState<ToneColor | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  const templatesRef = useRef<LayerTemplate[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    templatesRef.current = readTemplates();
    setTick((v) => v + 1);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [scope, selectedProjectId, query, hasXiaofulu, hasJiaojiao, color]);

  const project = useMemo(() => PROJECTS.find((p) => p.id === selectedProjectId) || PROJECTS[0], [selectedProjectId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return templatesRef.current
      .filter((t) => t.scope === scope)
      .filter((t) => t.projectId === selectedProjectId)
      .filter((t) => {
        if (!q) return true;
        return t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      })
      .filter((t) => (hasXiaofulu === null ? true : t.hasXiaofulu === hasXiaofulu))
      .filter((t) => (hasJiaojiao === null ? true : t.hasJiaojiao === hasJiaojiao))
      .filter((t) => (color === null ? true : t.color === color));
  }, [tick, scope, selectedProjectId, query, hasXiaofulu, hasJiaojiao, color]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const createTemplate = () => {
    const name = window.prompt('请输入图层模板名称');
    if (!name || !name.trim()) return;
    const next: LayerTemplate = {
      id: makeId('lt'),
      name: name.trim(),
      scope,
      projectId: project.id,
      projectName: project.name,
      previewUrl: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?q=80&w=1200&auto=format&fit=crop',
      createdAt: Date.now(),
      hasXiaofulu: false,
      hasJiaojiao: false,
      color: 'red',
    };
    const nextList = [next, ...templatesRef.current];
    writeTemplates(nextList);
    templatesRef.current = nextList;
    setTick((v) => v + 1);
    toast.show('已新建图层模板（模拟）');
  };

  const scopeLabel = scope === 'public' ? '公共图层库' : '深圳分行图层库';

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="w-full px-8 py-8 space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xl font-bold text-gray-900">图层库</div>
            <div className="text-sm text-gray-500 mt-1">按项目管理图层模板 · {scopeLabel}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-full bg-gray-100 p-1 border border-black/5">
              <button
                type="button"
                onClick={() => setScope('public')}
                className={clsx(
                  'h-9 px-4 rounded-full text-sm font-semibold transition-all',
                  scope === 'public' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                )}
              >
                公共图层库
              </button>
              <button
                type="button"
                onClick={() => setScope('team')}
                className={clsx(
                  'h-9 px-4 rounded-full text-sm font-semibold transition-all',
                  scope === 'team' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                )}
              >
                团队图层库
              </button>
            </div>
            <button
              type="button"
              onClick={createTemplate}
              className="h-10 px-4 rounded-full bg-black text-white hover:bg-gray-900 transition-colors text-sm font-semibold flex items-center gap-2"
            >
              <Plus size={16} />
              新建图层模板
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">项目</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5"
              >
                {PROJECTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[240px] relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索图层模板（名称 / ID）"
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <FilterToggle
                label="含小福鹿"
                value={hasXiaofulu}
                onChange={setHasXiaofulu}
              />
              <FilterToggle
                label="含娇娇"
                value={hasJiaojiao}
                onChange={setHasJiaojiao}
              />

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">颜色</span>
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setColor(null)}
                    className={clsx(
                      'h-8 px-3 rounded-full border text-xs font-semibold transition',
                      color === null ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    )}
                  >
                    全部
                  </button>
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setColor((prev) => (prev === c.id ? null : c.id))}
                      className={clsx(
                        'h-8 px-3 rounded-full border text-xs font-semibold transition',
                        color === c.id ? 'bg-black text-white border-black' : clsx('border', c.className, 'hover:opacity-90')
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={createTemplate}
            className="rounded-2xl border border-dashed border-gray-300 bg-white hover:bg-gray-50 transition p-5 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center">
                <Plus size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">新建图层模板</div>
                <div className="text-xs text-gray-500 mt-1">项目：{project.name}</div>
              </div>
            </div>
          </button>

          {paged.map((t) => (
            <div key={t.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition">
              <div className="aspect-[16/10] bg-gray-50">
                <img src={t.previewUrl} alt={t.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="text-sm font-semibold text-gray-900 line-clamp-1">{t.name}</div>
                <div className="text-xs text-gray-500 mt-1">ID：{t.id}</div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {t.hasXiaofulu && <Chip>小福鹿</Chip>}
                    {t.hasJiaojiao && <Chip>娇娇</Chip>}
                    <Chip>{COLOR_OPTIONS.find((c) => c.id === t.color)?.label || '—'}</Chip>
                  </div>
                  <div className="text-xs text-gray-400">{formatTime(t.createdAt)}</div>
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

function FilterToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (next: boolean | null) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onChange(value === null ? true : value === true ? false : null);
      }}
      className={clsx(
        'h-8 px-3 rounded-full border text-xs font-semibold transition',
        value === null
          ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          : value
            ? 'bg-black text-white border-black'
            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
      )}
    >
      {label}
      {value === null ? '' : value ? '：是' : '：否'}
    </button>
  );
}


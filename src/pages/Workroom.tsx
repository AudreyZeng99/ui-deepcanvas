import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, type NavigateFunction } from 'react-router-dom';
import clsx from 'clsx';
import { ArrowLeft, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../components/ToastProvider';

type WorkroomRole = 'ops' | 'business' | 'experience';
type BusinessOrg = 'shenzhen' | 'other';

type WorkroomIdentity = {
  role: WorkroomRole;
  businessOrg?: BusinessOrg;
};

type LibraryKind = 'banking' | 'shenzhen' | 'project';

type LayerAsset = {
  id: string;
  name: string;
  url: string;
  createdAt: number;
  spec: string;
  source: 'ops_publish' | 'seed';
  projectId?: string;
  meta?: Record<string, any>;
};

type LayerLibrary = {
  id: string;
  name: string;
  kind: LibraryKind;
  description?: string;
};

type AssetHistoryEvent = {
  id: string;
  at: number;
  byRole: WorkroomRole;
  type: 'open_canvas' | 'save_version';
  note?: string;
};

type WorkroomProject = {
  id: string;
  teamId: string;
  name: string;
  specs: string[];
};

const IDENTITY_KEY = 'deepcanvas_workroom_identity_v1';
const LIBRARIES_KEY = 'deepcanvas_workroom_libraries_v1';
const ASSETS_KEY = 'deepcanvas_workroom_assets_v1';
const HISTORY_KEY = 'deepcanvas_workroom_asset_history_v1';
const PROJECTS_KEY = 'deepcanvas_workroom_projects_v1';
const BUSINESS_PROJECTS_KEY = 'deepcanvas_workroom_business_projects_v1';

type BusinessProjectSpec = 'banner' | 'poster' | 'splash';

type BusinessProject = {
  id: string;
  name: string;
  createdAt: number;
};

const BUSINESS_SPECS: Array<{ id: BusinessProjectSpec; label: string; dimension: string }> = [
  { id: 'banner', label: '横幅banner', dimension: '1920x480' },
  { id: 'poster', label: '长图海报', dimension: '1080x1920' },
  { id: 'splash', label: '首页弹屏', dimension: '1080x1920' },
];

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readIdentity(): WorkroomIdentity | null {
  const parsed = safeParseJson<WorkroomIdentity | null>(localStorage.getItem(IDENTITY_KEY), null);
  if (!parsed || typeof parsed !== 'object') return null;
  if (parsed.role !== 'ops' && parsed.role !== 'business' && parsed.role !== 'experience') return null;
  if (parsed.role === 'business') {
    const org = parsed.businessOrg;
    if (org !== 'shenzhen' && org !== 'other') return { role: 'business', businessOrg: 'other' };
  }
  return parsed;
}

function writeIdentity(identity: WorkroomIdentity) {
  localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
}

function seedLibrariesIfMissing() {
  const existing = safeParseJson<Record<string, LayerLibrary> | null>(localStorage.getItem(LIBRARIES_KEY), null);
  if (existing && typeof existing === 'object' && Object.keys(existing).length > 0) return;
  const seed: Record<string, LayerLibrary> = {
    banking: {
      id: 'banking',
      name: '手机银行图层库',
      kind: 'banking',
      description: '业务人员可用；运维可删除；不提供新增入口（由运维发布）。',
    },
    shenzhen: {
      id: 'shenzhen',
      name: '深圳分行图层库',
      kind: 'shenzhen',
      description: '仅深圳分行业务人员可用；运维可维护。',
    },
  };
  localStorage.setItem(LIBRARIES_KEY, JSON.stringify(seed));
}

function readLibraries(): Record<string, LayerLibrary> {
  seedLibrariesIfMissing();
  const parsed = safeParseJson<Record<string, LayerLibrary>>(localStorage.getItem(LIBRARIES_KEY), {});
  const safe: Record<string, LayerLibrary> = {};
  Object.values(parsed || {}).forEach((lib) => {
    if (!lib || typeof lib !== 'object') return;
    if (typeof lib.id !== 'string' || typeof lib.name !== 'string') return;
    if (lib.kind !== 'banking' && lib.kind !== 'shenzhen' && lib.kind !== 'project') return;
    safe[lib.id] = {
      id: lib.id,
      name: lib.name,
      kind: lib.kind,
      description: typeof lib.description === 'string' ? lib.description : undefined,
    };
  });
  return safe;
}

function readAssets(): LayerAsset[] {
  const parsed = safeParseJson<LayerAsset[]>(localStorage.getItem(ASSETS_KEY), []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((a) => a && typeof a.id === 'string' && typeof a.url === 'string' && typeof a.name === 'string')
    .map((a) => ({
      id: a.id,
      name: a.name,
      url: a.url,
      createdAt: typeof a.createdAt === 'number' ? a.createdAt : Date.now(),
      spec: typeof a.spec === 'string' ? a.spec : '1080x1920',
      source: a.source === 'seed' ? 'seed' : 'ops_publish',
      projectId: typeof a.projectId === 'string' ? a.projectId : undefined,
      meta: a.meta && typeof a.meta === 'object' ? a.meta : undefined,
    }))
    .sort((x, y) => y.createdAt - x.createdAt);
}

function writeAssets(next: LayerAsset[]) {
  localStorage.setItem(ASSETS_KEY, JSON.stringify(next));
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function seedBusinessProjectsIfMissing() {
  const existing = safeParseJson<BusinessProject[] | null>(localStorage.getItem(BUSINESS_PROJECTS_KEY), null);
  if (Array.isArray(existing) && existing.length > 0) return;
  const now = Date.now();
  const seed: BusinessProject[] = [
    { id: 'bp-shenxiang-fuli', name: '深享福利周周有礼', createdAt: now - 1000 * 60 * 60 * 24 * 7 },
    { id: 'bp-fenhang-jianbu', name: '分行健步走', createdAt: now - 1000 * 60 * 60 * 24 * 5 },
    { id: 'bp-denglu-youli', name: '登陆有礼', createdAt: now - 1000 * 60 * 60 * 24 * 3 },
  ];
  localStorage.setItem(BUSINESS_PROJECTS_KEY, JSON.stringify(seed));
}

function readBusinessProjects(): BusinessProject[] {
  seedBusinessProjectsIfMissing();
  const parsed = safeParseJson<BusinessProject[]>(localStorage.getItem(BUSINESS_PROJECTS_KEY), []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((p) => p && typeof p.id === 'string' && typeof p.name === 'string')
    .map((p) => ({
      id: p.id,
      name: p.name,
      createdAt: typeof p.createdAt === 'number' ? p.createdAt : Date.now(),
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

function writeBusinessProjects(next: BusinessProject[]) {
  localStorage.setItem(BUSINESS_PROJECTS_KEY, JSON.stringify(next));
}

function readHistoryMap(): Record<string, AssetHistoryEvent[]> {
  const parsed = safeParseJson<Record<string, AssetHistoryEvent[]>>(localStorage.getItem(HISTORY_KEY), {});
  const safe: Record<string, AssetHistoryEvent[]> = {};
  Object.entries(parsed || {}).forEach(([assetId, events]) => {
    if (!Array.isArray(events)) return;
    safe[assetId] = events
      .filter((e) => e && typeof e.id === 'string' && typeof e.at === 'number' && typeof e.byRole === 'string' && typeof e.type === 'string')
      .map((e) => ({
        id: e.id,
        at: e.at,
        byRole: (e.byRole as WorkroomRole) || 'business',
        type: e.type as AssetHistoryEvent['type'],
        note: typeof e.note === 'string' ? e.note : undefined,
      }))
      .sort((a, b) => b.at - a.at);
  });
  return safe;
}

function writeHistoryMap(next: Record<string, AssetHistoryEvent[]>) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

function canAccessLibrary(identity: WorkroomIdentity, library: LayerLibrary) {
  if (identity.role === 'ops') return true;
  if (identity.role === 'experience') return false;
  if (library.kind === 'banking') return true;
  if (library.kind === 'shenzhen') return identity.businessOrg === 'shenzhen';
  if (library.kind === 'project') return true;
  return false;
}

function isOps(identity: WorkroomIdentity | null): identity is WorkroomIdentity & { role: 'ops' } {
  return !!identity && identity.role === 'ops';
}

function isBusiness(identity: WorkroomIdentity | null): identity is WorkroomIdentity & { role: 'business' } {
  return !!identity && identity.role === 'business';
}

function getRoleLabel(identity: WorkroomIdentity | null) {
  if (!identity) return '未选择角色';
  if (identity.role === 'ops') return '运维';
  if (identity.role === 'experience') return '体验';
  if (identity.businessOrg === 'shenzhen') return '业务（深圳分行）';
  return '业务';
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function goBackOrHome(navigate: NavigateFunction) {
  if (typeof window !== 'undefined' && window.history.length > 1) {
    navigate(-1);
    return;
  }
  navigate('/workroom/home');
}

function WorkroomTopbar({ identity, onClearRole }: { identity: WorkroomIdentity | null; onClearRole: () => void }) {
  return (
    <div className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
      <div className="w-full px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-semibold">W</div>
          <div className="flex flex-col">
            <div className="text-sm font-semibold text-gray-900">工作间</div>
            <div className="text-xs text-gray-500">当前角色：{getRoleLabel(identity)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/workroom/select-role"
            className="px-3 py-2 rounded-lg text-sm bg-gray-100 text-gray-900 hover:bg-gray-200 transition"
          >
            切换角色
          </Link>
          <button
            onClick={onClearRole}
            className="px-3 py-2 rounded-lg text-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
          >
            清除角色
          </button>
          <Link to="/projects" className="px-3 py-2 rounded-lg text-sm bg-black text-white hover:bg-gray-900 transition">
            返回设计平台
          </Link>
        </div>
      </div>
    </div>
  );
}

function WorkroomShell({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<WorkroomIdentity | null>(() => readIdentity());
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setIdentity(readIdentity());
  }, [location.pathname]);

  useEffect(() => {
    seedLibrariesIfMissing();
  }, []);

  const clearRole = () => {
    localStorage.removeItem(IDENTITY_KEY);
    setIdentity(null);
    navigate('/workroom/select-role');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <WorkroomTopbar identity={identity} onClearRole={clearRole} />
      <div className="w-full px-8 py-6">{children}</div>
    </div>
  );
}

function RequireIdentity({ children }: { children: ReactNode }) {
  const identity = readIdentity();
  if (!identity) return <Navigate to="/workroom/select-role" replace />;
  return <>{children}</>;
}

function RoleSelect() {
  const navigate = useNavigate();
  const [role, setRole] = useState<WorkroomRole>('business');
  const [businessOrg, setBusinessOrg] = useState<BusinessOrg>('other');

  const save = () => {
    const identity: WorkroomIdentity =
      role === 'business' ? { role, businessOrg } : { role };
    writeIdentity(identity);
    navigate('/workroom/home', { replace: true });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="text-lg font-semibold">选择你的角色</div>
      <div className="text-sm text-gray-500 mt-1">不同角色会看到不同的工作流与权限。</div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        {([
          { key: 'ops' as const, title: '运维', desc: '原料上传/拆分确认/发布至图层库；可删除图层库资产。' },
          { key: 'business' as const, title: '业务', desc: '按团队-项目-规格使用图层库资产进入画布并记录历史。' },
          { key: 'experience' as const, title: '体验', desc: '体验流程（本次先串联框架与权限）。' },
        ]).map((item) => (
          <button
            key={item.key}
            onClick={() => setRole(item.key)}
            className={clsx(
              'text-left rounded-2xl border p-4 transition',
              role === item.key ? 'border-black bg-black text-white' : 'border-gray-200 bg-white hover:bg-gray-50'
            )}
          >
            <div className="font-semibold">{item.title}</div>
            <div className={clsx('text-sm mt-1', role === item.key ? 'text-white/80' : 'text-gray-500')}>{item.desc}</div>
          </button>
        ))}
      </div>

      {role === 'business' && (
        <div className="mt-5 p-4 rounded-2xl border border-gray-200 bg-gray-50">
          <div className="text-sm font-semibold text-gray-900">业务归属</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {([
              { key: 'shenzhen' as const, label: '深圳分行' },
              { key: 'other' as const, label: '非深圳' },
            ]).map((o) => (
              <button
                key={o.key}
                onClick={() => setBusinessOrg(o.key)}
                className={clsx(
                  'px-3 py-2 rounded-lg text-sm border transition',
                  businessOrg === o.key ? 'border-black bg-black text-white' : 'border-gray-200 bg-white hover:bg-gray-50'
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-2">用于控制「深圳分行图层库」的访问权限。</div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-end gap-2">
        <Link to="/projects" className="px-4 py-2 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 transition">
          返回
        </Link>
        <button onClick={save} className="px-4 py-2 rounded-lg text-sm bg-black text-white hover:bg-gray-900 transition">
          进入工作间
        </button>
      </div>
    </div>
  );
}

function WorkroomHome() {
  const identity = readIdentity();
  const libraries = useMemo(() => Object.values(readLibraries()), []);
  const canSee = useMemo(() => {
    if (!identity) return [];
    return libraries.filter((l) => canAccessLibrary(identity, l));
  }, [identity, libraries]);

  if (!identity) return <Navigate to="/workroom/select-role" replace />;

  if (identity.role === 'ops') {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="text-lg font-semibold">运维工作流</div>
          <div className="text-sm text-gray-500 mt-1">从原料上传到图层库发布。</div>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link
              to="/workroom/material-workshop"
              className="rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition p-4"
            >
              <div className="font-semibold">原料操作车间</div>
              <div className="text-sm text-gray-500 mt-1">上传 → 填写标注字段 → 模拟拆分确认 → 发布到图层库。</div>
            </Link>
            <Link
              to="/workroom/libraries/banking"
              className="rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition p-4"
            >
              <div className="font-semibold">查看手机银行图层库</div>
              <div className="text-sm text-gray-500 mt-1">支持删除资产（运维专属）。</div>
            </Link>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-900">可维护的图层库</div>
          <div className="mt-3 space-y-2">
            {canSee.map((lib) => (
              <Link
                key={lib.id}
                to={`/workroom/libraries/${encodeURIComponent(lib.id)}`}
                className="block rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition px-3 py-3"
              >
                <div className="text-sm font-semibold">{lib.name}</div>
                <div className="text-xs text-gray-500 mt-1">{lib.description || '—'}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (identity.role === 'business') {
    return <BusinessEntry />;
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="text-lg font-semibold">体验角色工作流</div>
      <div className="text-sm text-gray-500 mt-2">本次先把角色与权限框架串联完成；体验专属流程可在下一步补齐。</div>
      <div className="mt-5">
        <Link to="/workroom/libraries/banking" className="px-4 py-2 rounded-lg text-sm bg-black text-white hover:bg-gray-900 transition">
          查看手机银行图层库（只读）
        </Link>
      </div>
    </div>
  );
}

function seedProjectsFromTeams(teams: { id: string; name: string }[]) {
  const existing = safeParseJson<WorkroomProject[] | null>(localStorage.getItem(PROJECTS_KEY), null);
  if (Array.isArray(existing) && existing.length > 0) return;
  const specsPool = ['1080x1920', '1920x1080', '1242x2208', '750x1334'];
  const projects: WorkroomProject[] = teams.flatMap((t, idx) => {
    const a: WorkroomProject = {
      id: `wrp-${t.id}-a`,
      teamId: t.id,
      name: `${t.name}｜项目A`,
      specs: specsPool.slice(0, 3),
    };
    const b: WorkroomProject = {
      id: `wrp-${t.id}-b`,
      teamId: t.id,
      name: `${t.name}｜项目B`,
      specs: specsPool.slice(1, 4),
    };
    return idx % 2 === 0 ? [a, b] : [b, a];
  });
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

function readProjects(): WorkroomProject[] {
  const parsed = safeParseJson<WorkroomProject[]>(localStorage.getItem(PROJECTS_KEY), []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((p) => p && typeof p.id === 'string' && typeof p.teamId === 'string' && typeof p.name === 'string')
    .map((p) => ({
      id: p.id,
      teamId: p.teamId,
      name: p.name,
      specs: Array.isArray(p.specs) ? p.specs.filter((s) => typeof s === 'string' && s.trim()) : ['1080x1920'],
    }));
}

function BusinessEntry() {
  const identity = readIdentity();
  const libs = useMemo(() => Object.values(readLibraries()), []);

  const toast = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<BusinessProject[]>(() => readBusinessProjects());
  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(() => new Set(projects.slice(0, 1).map((p) => p.id)));

  const accessibleLibraries = useMemo(() => {
    if (!identity) return [];
    return libs.filter((l) => canAccessLibrary(identity, l));
  }, [identity, libs]);

  if (!identity || identity.role !== 'business') return null;

  const allAssets = readAssets();

  const assetsByProjectAndSpec = (projectId: string, specId: BusinessProjectSpec) => {
    return allAssets.filter((a) => a.meta?.businessProjectId === projectId && a.meta?.businessSpecId === specId);
  };

  const toggleExpanded = (projectId: string) => {
    setExpandedProjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const createProject = () => {
    const name = window.prompt('请输入项目名称');
    if (!name || !name.trim()) return;
    const next: BusinessProject = { id: makeId('bp'), name: name.trim(), createdAt: Date.now() };
    const nextList = [next, ...projects];
    writeBusinessProjects(nextList);
    setProjects(nextList);
    setExpandedProjectIds((prev) => new Set([next.id, ...prev]));
    toast.show('已新建项目');
  };

  const createSpecItem = (project: BusinessProject, spec: { id: BusinessProjectSpec; label: string; dimension: string }) => {
    const now = Date.now();
    const urlPool: Record<BusinessProjectSpec, string> = {
      banner: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1400&auto=format&fit=crop',
      poster: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      splash: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1200&auto=format&fit=crop',
    };
    const nextAssets = readAssets();
    const asset: LayerAsset = {
      id: makeId('asset'),
      name: `${project.name}｜${spec.label}`,
      url: urlPool[spec.id],
      createdAt: now,
      spec: spec.dimension,
      source: 'seed',
      meta: {
        businessProjectId: project.id,
        businessSpecId: spec.id,
        businessSpecLabel: spec.label,
        status: '进行中',
      },
    };
    writeAssets([asset, ...nextAssets]);
    toast.show('已新增一张规格图片（模拟）');
    navigate(`/workroom/canvas/${encodeURIComponent(asset.id)}`);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 space-y-3">
        <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-gray-900">项目</div>
            <div className="text-xs px-2.5 py-1 rounded-full bg-gray-100 border border-black/5 text-gray-700 font-semibold">
              {identity.businessOrg === 'shenzhen' ? '深圳分行' : '机构'}
            </div>
          </div>
          <button
            type="button"
            onClick={createProject}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-black text-white text-sm font-semibold hover:bg-gray-900 transition"
          >
            <Plus size={16} />
            新建项目
          </button>
        </div>

        <div className="space-y-2">
          {projects.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-sm text-gray-500">暂无项目</div>
          ) : (
            projects.map((p) => {
              const expanded = expandedProjectIds.has(p.id);
              return (
                <div key={p.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(p.id)}
                    className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 border border-black/5 flex items-center justify-center text-gray-700">
                        {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">{p.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          项目ID：{p.id}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">{formatTime(p.createdAt)}</div>
                  </button>

                  {expanded && (
                    <div className="px-4 pb-4">
                      <div className="space-y-4">
                        {BUSINESS_SPECS.map((spec) => {
                          const items = assetsByProjectAndSpec(p.id, spec.id);
                          return (
                            <div key={spec.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                              <div className="px-4 py-3 flex items-center justify-between gap-3 bg-gray-50/60 border-b border-gray-200">
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-gray-900">{spec.label}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">{spec.dimension}</div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => createSpecItem(p, spec)}
                                  className="h-9 px-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition text-sm font-semibold text-gray-800"
                                >
                                  新建图片
                                </button>
                              </div>

                              <div className="p-4">
                                {items.length === 0 ? (
                                  <div className="text-sm text-gray-500">暂无图片，点击右上角新建。</div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {items.map((a) => (
                                      <button
                                        key={a.id}
                                        type="button"
                                        onClick={() => navigate(`/workroom/canvas/${encodeURIComponent(a.id)}`)}
                                        className="text-left rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition overflow-hidden"
                                      >
                                        <div className="aspect-[16/10] bg-gray-50">
                                          <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-3">
                                          <div className="text-sm font-semibold text-gray-900 line-clamp-1">{a.name}</div>
                                          <div className="text-xs text-gray-500 mt-1 flex items-center justify-between gap-2">
                                            <span>{a.meta?.status || '进行中'}</span>
                                            <span>{formatTime(a.createdAt)}</span>
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-semibold text-gray-900">共享图层库</div>
        <div className="mt-3 space-y-2">
          {accessibleLibraries.map((lib) => (
            <Link
              key={lib.id}
              to={`/workroom/libraries/${encodeURIComponent(lib.id)}`}
              className="block rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition px-3 py-3"
            >
              <div className="text-sm font-semibold">{lib.name}</div>
              <div className="text-xs text-gray-500 mt-1">{lib.description || '—'}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function MaterialWorkshop() {
  const toast = useToast();
  const identity = readIdentity();
  const navigate = useNavigate();
  const { teams } = useProject();

  const [files, setFiles] = useState<File[]>([]);
  const [tone, setTone] = useState<'warm' | 'cold' | 'neutral'>('neutral');
  const [hasXiaofulu, setHasXiaofulu] = useState(false);
  const [hasJiaojiao, setHasJiaojiao] = useState(false);
  const [remark, setRemark] = useState('');
  const [isSplitConfirmed, setIsSplitConfirmed] = useState(false);
  const [targetLibraryId, setTargetLibraryId] = useState('banking');
  const [targetSpec, setTargetSpec] = useState('1080x1920');
  const [targetProjectId, setTargetProjectId] = useState<string>(() => {
    const firstTeam = teams[0]?.id;
    return firstTeam ? `wrp-${firstTeam}-a` : '';
  });

  useEffect(() => {
    seedProjectsFromTeams(teams.map((t) => ({ id: t.id, name: t.name })));
  }, [teams]);

  useEffect(() => {
    if (!targetProjectId && teams[0]?.id) setTargetProjectId(`wrp-${teams[0].id}-a`);
  }, [targetProjectId, teams]);

  const [projects, setProjects] = useState<WorkroomProject[]>(() => readProjects());
  const libraryOptions = useMemo(() => Object.values(readLibraries()), []);
  const projectOptions = useMemo(() => projects, [projects]);

  useEffect(() => {
    setProjects(readProjects());
  }, [teams]);

  if (!identity) return <Navigate to="/workroom/select-role" replace />;
  if (!isOps(identity)) return <Navigate to="/workroom/home" replace />;

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files || []);
    setFiles(picked);
    setIsSplitConfirmed(false);
    e.target.value = '';
  };

  const canPublish = files.length > 0 && isSplitConfirmed;

  const publish = () => {
    if (!canPublish) {
      toast.show('请先上传原料并确认拆分无误。');
      return;
    }
    const libId = targetLibraryId === 'project' ? `project:${targetProjectId}` : targetLibraryId;
    const libs = readLibraries();
    if (targetLibraryId === 'project') {
      const project = projectOptions.find((p) => p.id === targetProjectId);
      if (!project) {
        toast.show('请选择有效项目。');
        return;
      }
      if (!libs[libId]) {
        libs[libId] = {
          id: libId,
          name: `${project.name}｜图层库`,
          kind: 'project',
          description: '项目图层库（运维发布，业务使用）。',
        };
        localStorage.setItem(LIBRARIES_KEY, JSON.stringify(libs));
      }
    }

    const now = Date.now();
    const nextAssets = readAssets();
    const created: LayerAsset[] = files.map((f) => {
      const url = URL.createObjectURL(f);
      return {
        id: `asset-${now}-${Math.random().toString(16).slice(2)}`,
        name: f.name || '原料图片',
        url,
        createdAt: now,
        spec: targetSpec,
        source: 'ops_publish',
        projectId: targetLibraryId === 'project' ? targetProjectId : undefined,
        meta: {
          tone,
          hasXiaofulu,
          hasJiaojiao,
          remark: remark.trim() || undefined,
          publishedTo: libId,
          layersCount: 6,
        },
      };
    });
    writeAssets([...created, ...nextAssets]);

    toast.show(`已发布 ${created.length} 个资产至图层库`);
    setFiles([]);
    setIsSplitConfirmed(false);
    setRemark('');
    navigate(`/workroom/libraries/${encodeURIComponent(libId)}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goBackOrHome(navigate)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 transition"
        >
          <ArrowLeft size={16} />
          返回上一页
        </button>
        <Link to="/workroom/home" className="px-3 py-2 rounded-lg text-sm bg-black text-white hover:bg-gray-900 transition">
          回到工作间
        </Link>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="text-lg font-semibold">原料操作车间</div>
        <div className="text-sm text-gray-500 mt-1">上传原料 → 填写标注字段 → 模拟拆分确认 → 发布到指定图层库。</div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="text-sm font-semibold">1) 上传原料</div>
            <div className="mt-3 flex items-center gap-3">
              <input type="file" accept="image/*" multiple onChange={onPickFiles} />
              <div className="text-xs text-gray-500">已选择 {files.length} 个文件</div>
            </div>
            {files.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto space-y-2">
                {files.map((f) => (
                  <div key={f.name + f.size} className="text-sm text-gray-700 border border-gray-100 rounded-lg px-3 py-2">
                    {f.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="text-sm font-semibold">2) 标注字段（示例）</div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={hasXiaofulu} onChange={(e) => setHasXiaofulu(e.target.checked)} />
                是否含小福鹿
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={hasJiaojiao} onChange={(e) => setHasJiaojiao(e.target.checked)} />
                是否含娇娇
              </label>
              <label className="text-sm text-gray-700">
                图片色调
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value as any)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 bg-white"
                >
                  <option value="neutral">中性</option>
                  <option value="warm">暖色</option>
                  <option value="cold">冷色</option>
                </select>
              </label>
              <label className="text-sm text-gray-700">
                备注
                <input
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 bg-white"
                  placeholder="可输入活动/渠道/版式等"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-200 p-4">
          <div className="text-sm font-semibold">3) 拆分确认（MVP：用按钮模拟）</div>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                if (files.length === 0) {
                  toast.show('请先上传图片。');
                  return;
                }
                setIsSplitConfirmed(true);
                toast.show('已确认拆分无误（模拟）');
              }}
              className={clsx(
                'px-3 py-2 rounded-lg text-sm transition',
                isSplitConfirmed ? 'bg-black text-white' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              )}
            >
              {isSplitConfirmed ? '已确认拆分无误' : '模拟拆分并确认无误'}
            </button>
            <button
              onClick={() => setIsSplitConfirmed(false)}
              className="px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 transition"
            >
              重置确认
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-200 p-4">
          <div className="text-sm font-semibold">4) 发布至指定图层库</div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="text-sm text-gray-700">
              目标类型
              <select
                value={targetLibraryId}
                onChange={(e) => setTargetLibraryId(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 bg-white"
              >
                <option value="banking">手机银行图层库</option>
                <option value="shenzhen">深圳分行图层库</option>
                <option value="project">项目图层库</option>
              </select>
            </label>

            <label className={clsx('text-sm text-gray-700', targetLibraryId === 'project' ? '' : 'opacity-60')}>
              项目
              <select
                disabled={targetLibraryId !== 'project'}
                value={targetProjectId}
                onChange={(e) => setTargetProjectId(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 bg-white disabled:bg-gray-100"
              >
                {projectOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm text-gray-700">
              规格
              <select
                value={targetSpec}
                onChange={(e) => setTargetSpec(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 bg-white"
              >
                {['1080x1920', '1920x1080', '1242x2208', '750x1334'].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <Link to="/workroom/home" className="px-4 py-2 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 transition">
              返回
            </Link>
            <button
              onClick={publish}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm transition',
                canPublish ? 'bg-black text-white hover:bg-gray-900' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              )}
            >
              发布至指定图层库
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">发布后，业务侧将以“只读可用”的方式进入画布；删除权限仅运维可见。</div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="text-sm font-semibold text-gray-900">图层库快捷入口</div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          {libraryOptions.map((lib) => (
            <Link
              key={lib.id}
              to={`/workroom/libraries/${encodeURIComponent(lib.id)}`}
              className="rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition p-4"
            >
              <div className="font-semibold">{lib.name}</div>
              <div className="text-sm text-gray-500 mt-1">{lib.description || '—'}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function LibraryPage() {
  const toast = useToast();
  const identity = readIdentity();
  const navigate = useNavigate();
  const { libraryId } = useParams();

  const libraries = useMemo(() => readLibraries(), []);
  const assets = useMemo(() => readAssets(), []);

  const lib = libraryId ? libraries[libraryId] : null;
  const filteredAssets = useMemo(() => {
    if (!lib) return [];
    if (lib.kind === 'project') {
      const pid = lib.id.startsWith('project:') ? lib.id.slice('project:'.length) : '';
      return assets.filter((a) => a.projectId === pid);
    }
    return assets.filter((a) => (a.meta?.publishedTo as any) === lib.id);
  }, [assets, lib]);

  if (!identity) return <Navigate to="/workroom/select-role" replace />;
  if (!lib) return <Navigate to="/workroom/home" replace />;
  if (!canAccessLibrary(identity, lib)) return <Navigate to="/workroom/home" replace />;

  const canDelete = identity.role === 'ops';

  const deleteAsset = (assetId: string) => {
    if (!canDelete) return;
    const next = readAssets().filter((a) => a.id !== assetId);
    writeAssets(next);
    toast.show('已删除');
    navigate(`/workroom/libraries/${encodeURIComponent(lib.id)}`, { replace: true });
  };

  const openCanvas = (asset: LayerAsset) => {
    if (!isBusiness(identity)) {
      toast.show('仅业务角色可进入图片微调画布。');
      return;
    }
    navigate(`/workroom/canvas/${encodeURIComponent(asset.id)}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goBackOrHome(navigate)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 transition"
        >
          <ArrowLeft size={16} />
          返回上一页
        </button>
        <Link to="/workroom/home" className="px-3 py-2 rounded-lg text-sm bg-black text-white hover:bg-gray-900 transition">
          回到工作间
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">{lib.name}</div>
            <div className="text-sm text-gray-500 mt-1">{lib.description || '—'}</div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredAssets.length === 0 ? (
            <div className="text-sm text-gray-500">暂无资产。可切换到运维角色在原料操作车间发布。</div>
          ) : (
            filteredAssets.map((a) => (
              <div key={a.id} className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
                <div className="aspect-[4/3] bg-gray-50">
                  <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-gray-900 line-clamp-1">{a.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    规格：{a.spec} · {formatTime(a.createdAt)}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => openCanvas(a)}
                      className={clsx(
                        'px-3 py-2 rounded-lg text-sm transition',
                        isBusiness(identity) ? 'bg-black text-white hover:bg-gray-900' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      )}
                    >
                      打开画布
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => deleteAsset(a.id)}
                        className="px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 transition"
                      >
                        删除
                      </button>
                    )}
                  </div>
                  {a.meta && (
                    <div className="mt-2 text-xs text-gray-500">
                      标注：色调 {a.meta.tone || '—'} · 小福鹿 {a.meta.hasXiaofulu ? '是' : '否'} · 娇娇 {a.meta.hasJiaojiao ? '是' : '否'}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectPage() {
  const identity = readIdentity();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const projects = useMemo(() => readProjects(), []);
  const project = projects.find((p) => p.id === projectId);

  if (!identity) return <Navigate to="/workroom/select-role" replace />;
  if (!isBusiness(identity)) return <Navigate to="/workroom/home" replace />;
  if (!project) return <Navigate to="/workroom/home" replace />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goBackOrHome(navigate)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 transition"
        >
          <ArrowLeft size={16} />
          返回上一页
        </button>
        <Link to="/workroom/home" className="px-3 py-2 rounded-lg text-sm bg-black text-white hover:bg-gray-900 transition">
          回到工作间
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">{project.name}</div>
            <div className="text-sm text-gray-500 mt-1">选择图片规格进入该规格下的图层资产。</div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {project.specs.map((s) => (
            <Link
              key={s}
              to={`/workroom/projects/${encodeURIComponent(project.id)}/spec/${encodeURIComponent(s)}`}
              className="rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition p-4"
            >
              <div className="font-semibold">{s}</div>
              <div className="text-sm text-gray-500 mt-1">查看该规格的资产 → 进入画布。</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectSpecAssets() {
  const toast = useToast();
  const identity = readIdentity();
  const navigate = useNavigate();
  const { projectId, specKey } = useParams();
  const assets = useMemo(() => readAssets(), []);
  const projects = useMemo(() => readProjects(), []);
  const project = projects.find((p) => p.id === projectId);

  if (!identity) return <Navigate to="/workroom/select-role" replace />;
  if (!isBusiness(identity)) return <Navigate to="/workroom/home" replace />;
  if (!project || !specKey) return <Navigate to="/workroom/home" replace />;

  const filtered = assets.filter((a) => a.projectId === project.id && a.spec === specKey);

  const openCanvas = (assetId: string) => {
    navigate(`/workroom/canvas/${encodeURIComponent(assetId)}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goBackOrHome(navigate)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 transition"
        >
          <ArrowLeft size={16} />
          返回上一页
        </button>
        <Link to="/workroom/home" className="px-3 py-2 rounded-lg text-sm bg-black text-white hover:bg-gray-900 transition">
          回到工作间
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold">{project.name}</div>
            <div className="text-sm text-gray-500 mt-1">规格：{specKey}</div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/workroom/projects/${encodeURIComponent(project.id)}`}
              className="px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 transition"
            >
              返回规格
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.length === 0 ? (
            <div className="text-sm text-gray-500">
              暂无资产。可切换到运维角色，将拆分结果发布到「项目图层库」并选择该规格。
            </div>
          ) : (
            filtered.map((a) => (
              <div key={a.id} className="rounded-2xl border border-gray-200 overflow-hidden bg-white">
                <div className="aspect-[4/3] bg-gray-50">
                  <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-gray-900 line-clamp-1">{a.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{formatTime(a.createdAt)}</div>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => openCanvas(a.id)} className="px-3 py-2 rounded-lg text-sm bg-black text-white hover:bg-gray-900 transition">
                      进入画布
                    </button>
                    <button
                      onClick={() => {
                        toast.show('本页为业务只读视图；删除由运维在图层库页执行。');
                      }}
                      className="px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 transition"
                    >
                      了解权限
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function WorkroomCanvas() {
  const toast = useToast();
  const identity = readIdentity();
  const navigate = useNavigate();
  const { assetId } = useParams();
  const assets = useMemo(() => readAssets(), []);
  const asset = assets.find((a) => a.id === assetId);
  const [history, setHistory] = useState<AssetHistoryEvent[]>(() => {
    if (!assetId) return [];
    const map = readHistoryMap();
    return map[assetId] || [];
  });

  useEffect(() => {
    if (!identity || identity.role !== 'business') return;
    if (!assetId) return;
    const map = readHistoryMap();
    const nextEvent: AssetHistoryEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      at: Date.now(),
      byRole: identity.role,
      type: 'open_canvas',
    };
    const next = { ...map, [assetId]: [nextEvent, ...(map[assetId] || [])] };
    writeHistoryMap(next);
    setHistory(next[assetId]);
  }, [assetId]);

  if (!identity) return <Navigate to="/workroom/select-role" replace />;
  if (!isBusiness(identity)) return <Navigate to="/workroom/home" replace />;
  if (!assetId || !asset) return <Navigate to="/workroom/home" replace />;

  const saveVersion = () => {
    const map = readHistoryMap();
    const nextEvent: AssetHistoryEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      at: Date.now(),
      byRole: identity.role,
      type: 'save_version',
      note: '保存一个编辑版本（模拟）',
    };
    const next = { ...map, [assetId]: [nextEvent, ...(map[assetId] || [])] };
    writeHistoryMap(next);
    setHistory(next[assetId]);
    toast.show('已记录一次保存历史（模拟）');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goBackOrHome(navigate)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border border-gray-200 bg-white hover:bg-gray-50 transition"
        >
          <ArrowLeft size={16} />
          返回上一页
        </button>
        <Link to="/workroom/home" className="px-3 py-2 rounded-lg text-sm bg-black text-white hover:bg-gray-900 transition">
          回到工作间
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">图片微调画布（MVP）</div>
              <div className="text-sm text-gray-500 mt-1">
                资产：{asset.name} · 规格：{asset.spec}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden">
            <div className="aspect-[16/10]">
              <img src={asset.url} alt={asset.name} className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button onClick={saveVersion} className="px-4 py-2 rounded-lg text-sm bg-black text-white hover:bg-gray-900 transition">
              保存版本
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2">此处先串联“进入画布 + 历史记录”的关键链路；后续可替换为真实画布编辑器。</div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-900">编辑历史</div>
          <div className="text-xs text-gray-500 mt-1">所有业务人员对同一资产的操作都在这里留痕（MVP）。</div>
          <div className="mt-4 space-y-2 max-h-[520px] overflow-y-auto">
            {history.length === 0 ? (
              <div className="text-sm text-gray-500">暂无记录</div>
            ) : (
              history.map((h) => (
                <div key={h.id} className="rounded-xl border border-gray-200 bg-white px-3 py-3">
                  <div className="text-sm font-semibold text-gray-900">
                    {h.type === 'open_canvas' ? '打开画布' : '保存版本'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{formatTime(h.at)} · {getRoleLabel({ role: h.byRole })}</div>
                  {h.note && <div className="text-xs text-gray-600 mt-1">{h.note}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Workroom() {
  return (
    <WorkroomShell>
      <Routes>
        <Route path="" element={<Navigate to="home" replace />} />
        <Route path="select-role" element={<RoleSelect />} />
        <Route
          path="home"
          element={
            <RequireIdentity>
              <WorkroomHome />
            </RequireIdentity>
          }
        />
        <Route
          path="material-workshop"
          element={
            <RequireIdentity>
              <MaterialWorkshop />
            </RequireIdentity>
          }
        />
        <Route
          path="libraries/:libraryId"
          element={
            <RequireIdentity>
              <LibraryPage />
            </RequireIdentity>
          }
        />
        <Route
          path="projects/:projectId"
          element={
            <RequireIdentity>
              <ProjectPage />
            </RequireIdentity>
          }
        />
        <Route
          path="projects/:projectId/spec/:specKey"
          element={
            <RequireIdentity>
              <ProjectSpecAssets />
            </RequireIdentity>
          }
        />
        <Route
          path="canvas/:assetId"
          element={
            <RequireIdentity>
              <WorkroomCanvas />
            </RequireIdentity>
          }
        />
        <Route path="*" element={<Navigate to="home" replace />} />
      </Routes>
    </WorkroomShell>
  );
}

import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Clock, Trash2, Folder, Share2, X, Image as ImageIcon, ArrowRight, PackagePlus } from 'lucide-react';
import { Project, useProject } from '../context/ProjectContext';
import clsx from 'clsx';
import { useTheme } from '../theme/ThemeContext';

type SpaceView = 'projects' | 'images' | 'p2p';

type SpaceMode = 'personal' | 'public';

type PublicProject = Pick<
  Project,
  'name' | 'width' | 'height' | 'thumbnail' | 'elements' | 'sourceType' | 'aiResizeBinding'
> & {
  id: string;
  publishedAt: number;
  authorName: string;
  sourceProjectId?: string;
};

type P2PShareRecord = {
  code: string;
  project: Project;
  createdAt: number;
};

const PUBLIC_PROJECTS_STORAGE_KEY = 'trae_deepcanvas_public_projects_v1';
const P2P_SHARE_STORAGE_KEY = 'trae_deepcanvas_p2p_share_codes_v1';

function getDefaultPublicProjects(): PublicProject[] {
  const now = Date.now();
  return [
    {
      id: 'public-1',
      name: '电商大促主视觉',
      width: 1920,
      height: 1080,
      thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
      elements: [],
      publishedAt: now - 1000 * 60 * 60 * 6,
      authorName: '社区作者A',
    },
    {
      id: 'public-2',
      name: '新品发布长图',
      width: 1080,
      height: 1920,
      thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80',
      elements: [],
      publishedAt: now - 1000 * 60 * 60 * 10,
      authorName: '社区作者B',
    },
    {
      id: 'public-3',
      name: '品牌KV留白版',
      width: 1920,
      height: 1080,
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80',
      elements: [],
      publishedAt: now - 1000 * 60 * 60 * 18,
      authorName: '社区作者C',
    },
    {
      id: 'public-4',
      name: '活动海报模板',
      width: 1242,
      height: 2208,
      thumbnail: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1200&q=80',
      elements: [],
      publishedAt: now - 1000 * 60 * 60 * 30,
      authorName: '社区作者D',
    },
  ];
}

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function generateShareCode(existingCodes: Set<string>) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let tries = 0;
  while (tries < 20) {
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    if (!existingCodes.has(code)) return code;
    tries += 1;
  }
  return `${Date.now().toString(36).slice(-8)}`.toUpperCase();
}

export default function Projects() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isGlass = theme.id.includes('glass');
  const {
    projects,
    personalImages,
    loadProject,
    deleteProject,
    createProject,
    saveProject,
  } = useProject();

  const space: SpaceMode = location.pathname.startsWith('/public') ? 'public' : 'personal';
  const [view, setView] = useState<SpaceView>('projects');
  const [shareProjectId, setShareProjectId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [publicProjects] = useState<PublicProject[]>(() => {
    const parsed = safeParseJson<PublicProject[]>(localStorage.getItem(PUBLIC_PROJECTS_STORAGE_KEY), []);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getDefaultPublicProjects();
  });
  const [importShareCode, setImportShareCode] = useState('');
  const [generatedShareCode, setGeneratedShareCode] = useState<string | null>(null);

  const visibleProjects = useMemo(() => {
    return space === 'public' ? publicProjects : projects;
  }, [space, publicProjects, projects]);

  const visibleImages = useMemo(() => {
    return personalImages;
  }, [personalImages]);

  const shareTargetProject = useMemo(() => {
    if (!shareProjectId) return null;
    return projects.find(p => p.id === shareProjectId) || null;
  }, [projects, shareProjectId]);

  const doToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  };

  const handleCreateNew = () => {
    if (space === 'public') return;
    if (projects.length >= 5) {
      alert('已达到个人文件数量上限 (5个)。请先删除部分旧文件。');
      return;
    }
    navigate('/editor');
  };

  const handleProjectClick = (id: string) => {
    loadProject(id);
    navigate('/editor');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确认删除该项目吗？')) {
      deleteProject(id);
    }
  };

  const openShareModal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setShareProjectId(id);
    setGeneratedShareCode(null);
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setShareProjectId(null);
    setGeneratedShareCode(null);
  };

  const handleGenerateP2PShareCode = async () => {
    if (!shareTargetProject) return;
    const recordMap = safeParseJson<Record<string, P2PShareRecord>>(localStorage.getItem(P2P_SHARE_STORAGE_KEY), {});
    const existingCodes = new Set(Object.keys(recordMap));
    const code = generateShareCode(existingCodes);
    recordMap[code] = {
      code,
      project: shareTargetProject,
      createdAt: Date.now(),
    };
    localStorage.setItem(P2P_SHARE_STORAGE_KEY, JSON.stringify(recordMap));
    setGeneratedShareCode(code);
    try {
      await navigator.clipboard.writeText(code);
      doToast('分享码已复制');
    } catch {
      doToast('分享码已生成');
    }
  };

  const handleImportSharedProject = () => {
    if (!importShareCode.trim()) return;
    if (projects.length >= 5) {
      doToast('已达到个人文件数量上限 (5个)');
      return;
    }
    const recordMap = safeParseJson<Record<string, P2PShareRecord>>(localStorage.getItem(P2P_SHARE_STORAGE_KEY), {});
    const code = importShareCode.trim().toUpperCase();
    const record = recordMap[code];
    if (!record) {
      doToast('分享码无效或已失效');
      return;
    }
    const source = record.project;
    const name = `${source.name}（分享）`;
    createProject(source.width, source.height, name, {
      elements: source.elements || [],
      thumbnail: source.thumbnail,
      sourceType: source.sourceType,
      aiResizeBinding: source.aiResizeBinding,
    });
    saveProject();
    setImportShareCode('');
    doToast('已导入到个人空间');
  };

  const handleForkPublicProject = (publicProject: PublicProject) => {
    if (projects.length >= 5) {
      doToast('已达到个人文件数量上限 (5个)');
      return;
    }
    const name = `${publicProject.name}（复用）`;
    createProject(publicProject.width, publicProject.height, name, {
      elements: publicProject.elements || [],
      thumbnail: publicProject.thumbnail,
      sourceType: publicProject.sourceType,
      aiResizeBinding: publicProject.aiResizeBinding,
    });
    saveProject();
    navigate('/editor');
  };

  const renderProjectsView = () => {
    if (visibleProjects.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Folder size={48} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold mb-2">{space === 'public' ? '公共空间暂无作品' : '还没有项目'}</h3>
          <p className="text-gray-500 max-w-sm mb-8">
            {space === 'public' ? '先在个人空间把项目发布到公共空间，这里会展示社区作品。' : '从新建项目开始，创建你的第一张画布。'}
          </p>
          {space !== 'public' && (
            <button onClick={handleCreateNew} className="text-accent-primary font-medium hover:underline">
              新建画布
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleProjects.map((project: any) => (
          <div
            key={project.id}
            onClick={() => {
              if (space === 'public') handleForkPublicProject(project as PublicProject);
              else handleProjectClick(project.id);
            }}
            className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center relative overflow-hidden">
              {project.thumbnail ? (
                <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <Folder size={32} className="text-gray-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
              {space !== 'public' ? (
                <div className="absolute left-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => openShareModal(e, project.id)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 backdrop-blur border border-gray-200 text-gray-900 text-xs font-bold shadow-sm hover:bg-white"
                    title="分享项目"
                  >
                    <Share2 size={14} />
                    分享
                  </button>
                </div>
              ) : (
                <div className="absolute left-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 backdrop-blur border border-gray-200 text-gray-900 text-xs font-bold shadow-sm">
                    <PackagePlus size={14} />
                    一键复用
                  </div>
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold truncate pr-4">{project.name}</h3>
                {space !== 'public' && (
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock size={12} />
                <span>{new Date(space === 'public' ? project.publishedAt : project.lastModified).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderImagesView = () => {
    if (visibleImages.length === 0) {
      return (
        <div className="py-16 text-center text-gray-500">
          这里会展示你在画布中制作过、编辑过的图片资产。
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">共 {visibleImages.length} 张</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {visibleImages.map((image) => (
            <div
              key={image.id}
              className="group text-left relative overflow-hidden rounded-2xl border border-black/5 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="aspect-square bg-gray-50">
                <img src={image.url} alt={image.projectName} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <div className="text-xs font-bold text-gray-900 truncate">{image.projectName}</div>
                <div className="text-[11px] text-gray-500 mt-1">{new Date(image.projectLastModified).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderP2PView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-3xl border border-black/5 bg-white overflow-hidden">
        <div className="p-6">
          <div className="text-sm font-black text-gray-900">点对点导入作品</div>
          <div className="text-xs text-gray-500 mt-2">
            输入分享码，导入后会以“（分享）”形式进入你的个人项目列表
          </div>
          <div className="mt-5 flex gap-2">
            <input
              value={importShareCode}
              onChange={(e) => setImportShareCode(e.target.value)}
              placeholder="输入分享码（8位）"
              className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:border-black outline-none bg-white"
            />
            <button
              onClick={handleImportSharedProject}
              disabled={!importShareCode.trim()}
              className={clsx(
                "px-4 py-3 rounded-2xl text-sm font-semibold inline-flex items-center gap-2 transition-all",
                importShareCode.trim()
                  ? "bg-black text-white hover:bg-gray-900"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              )}
            >
              导入
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-black/5 bg-gray-50/60 overflow-hidden">
        <div className="p-6">
          <div className="text-sm font-black text-gray-900">点对点分享作品</div>
          <div className="text-xs text-gray-500 mt-2 leading-relaxed">
            在“个人项目”里，将鼠标移动到项目卡片上，点击“分享”，生成 8 位分享码并复制给对方即可。
          </div>
          <button
            onClick={() => setView('projects')}
            className="mt-5 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors w-full"
          >
            回到个人项目
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">
        {space === 'personal' ? (
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="text-[12px] font-semibold tracking-wider text-gray-500 uppercase">个人空间</div>
              <div className="flex items-baseline gap-4">
                <div className="text-3xl font-black tracking-tight text-gray-900">Workspace</div>
                <div className="text-xs text-gray-400 font-medium">
                  项目 {visibleProjects.length} · 生图 {visibleImages.length}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('p2p')}
                className="px-4 py-2.5 rounded-2xl border border-black/10 bg-white text-gray-900 text-sm font-semibold hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
              >
                <Share2 size={16} />
                点对点
              </button>
              <button
                onClick={handleCreateNew}
                className={clsx(
                  "px-4 py-2.5 rounded-2xl text-white flex items-center gap-2 transition-all text-sm font-semibold",
                  projects.length >= 5
                    ? "bg-gray-400 cursor-not-allowed"
                    : (isGlass ? "bg-accent-primary/80 backdrop-blur-md hover:opacity-95" : "bg-accent-primary hover:opacity-90")
                )}
                disabled={projects.length >= 5}
              >
                <Plus size={18} />
                新建项目
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xl text-gray-500 font-medium">
                公共空间 <span className="mx-2">|</span> 社区作品浏览与复用
              </div>
              <div className="text-xs text-gray-400 mt-2">
                作品 {visibleProjects.length}
              </div>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              返回个人空间
            </button>
          </div>
        )}

        {toast && (
          <div className="fixed top-6 right-6 z-50">
            <div className="bg-black text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-xl shadow-black/20">
              {toast}
            </div>
          </div>
        )}

        {space === 'personal' && (
          <div className={clsx("inline-flex gap-1 p-1.5 rounded-3xl border border-black/5 bg-white/80 backdrop-blur-xl", isGlass && "bg-white/10")}>
            <button
              onClick={() => setView('projects')}
              className={clsx(
                "px-4 py-2.5 rounded-2xl text-sm font-semibold inline-flex items-center gap-2 transition-colors",
                view === 'projects' ? 'bg-black text-white' : 'text-gray-700 hover:bg-black/5'
              )}
            >
              <Folder size={15} />
              个人项目
            </button>
            <button
              onClick={() => setView('images')}
              className={clsx(
                "px-4 py-2.5 rounded-2xl text-sm font-semibold inline-flex items-center gap-2 transition-colors",
                view === 'images' ? 'bg-black text-white' : 'text-gray-700 hover:bg-black/5'
              )}
            >
              <ImageIcon size={15} />
              生图记录
            </button>
            <button
              onClick={() => setView('p2p')}
              className={clsx(
                "px-4 py-2.5 rounded-2xl text-sm font-semibold inline-flex items-center gap-2 transition-colors",
                view === 'p2p' ? 'bg-black text-white' : 'text-gray-700 hover:bg-black/5'
              )}
            >
              <Share2 size={15} />
              点对点
            </button>
          </div>
        )}

        <div className={clsx("rounded-3xl border border-black/5 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)]", isGlass ? "bg-white/10 backdrop-blur-xl" : "bg-white")}>
          {space === 'public' && renderProjectsView()}
          {space === 'personal' && view === 'projects' && renderProjectsView()}
          {space === 'personal' && view === 'images' && renderImagesView()}
          {space === 'personal' && view === 'p2p' && renderP2PView()}
        </div>
      </div>

      {isShareModalOpen && shareTargetProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeShareModal} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-black/20 border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500 font-medium">分享项目</div>
                <div className="text-xl font-black text-gray-900 mt-1 truncate">{shareTargetProject.name}</div>
              </div>
              <button onClick={closeShareModal} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors" title="关闭">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-3">
                <div className="text-sm font-bold text-gray-900">点对点分享</div>
                <div className="text-xs text-gray-500">
                  生成一个分享码发给对方，对方在个人空间输入即可导入
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleGenerateP2PShareCode}
                    className="px-4 py-2 rounded-2xl bg-black text-white font-semibold hover:bg-gray-800 transition-colors"
                  >
                    生成分享码
                  </button>
                  {generatedShareCode && (
                    <div className="flex-1 px-4 py-2 rounded-2xl border border-gray-200 bg-gray-50 text-sm font-black tracking-widest text-gray-900">
                      {generatedShareCode}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

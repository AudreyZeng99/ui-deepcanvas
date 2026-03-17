import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Clock, Trash2, Folder, Share2, X, CheckCircle2, Image as ImageIcon, Library, ArrowRight, PackagePlus } from 'lucide-react';
import { Project, useProject } from '../context/ProjectContext';
import clsx from 'clsx';
import { useTheme } from '../theme/ThemeContext';

type SpaceView = 'projects' | 'images' | 'materials';

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
  const {
    projects,
    personalImages,
    personalMaterials,
    loadProject,
    deleteProject,
    addImagesToPersonalLibrary,
    addUrlToPersonalLibrary,
    removePersonalMaterial,
    createProject,
    saveProject,
  } = useProject();

  const space: SpaceMode = location.pathname.startsWith('/public') ? 'public' : 'personal';
  const [view, setView] = useState<SpaceView>('projects');
  const [shareProjectId, setShareProjectId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  const [newMaterialUrl, setNewMaterialUrl] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [publicProjects, setPublicProjects] = useState<PublicProject[]>(() => {
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

  const visibleMaterials = useMemo(() => {
    return personalMaterials;
  }, [personalMaterials]);

  const shareTargetProject = useMemo(() => {
    if (!shareProjectId) return null;
    return projects.find(p => p.id === shareProjectId) || null;
  }, [projects, shareProjectId]);

  const selectedImages = useMemo(() => {
    if (selectedImageIds.size === 0) return [];
    const idSet = selectedImageIds;
    return visibleImages.filter(image => idSet.has(image.id));
  }, [selectedImageIds, visibleImages]);

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

  useEffect(() => {
    localStorage.setItem(PUBLIC_PROJECTS_STORAGE_KEY, JSON.stringify(publicProjects));
  }, [publicProjects]);

  const isPublishedToPublic = useMemo(() => {
    if (!shareTargetProject) return false;
    return publicProjects.some(p => p.sourceProjectId === shareTargetProject.id);
  }, [publicProjects, shareTargetProject]);

  const handlePublishToPublic = () => {
    if (!shareTargetProject) return;
    setPublicProjects(prev => {
      const existingIndex = prev.findIndex(p => p.sourceProjectId === shareTargetProject.id);
      const published: PublicProject = {
        id: existingIndex >= 0 ? prev[existingIndex].id : crypto.randomUUID(),
        name: shareTargetProject.name,
        width: shareTargetProject.width,
        height: shareTargetProject.height,
        thumbnail: shareTargetProject.thumbnail,
        elements: shareTargetProject.elements || [],
        sourceType: shareTargetProject.sourceType,
        aiResizeBinding: shareTargetProject.aiResizeBinding,
        publishedAt: Date.now(),
        authorName: '我',
        sourceProjectId: shareTargetProject.id,
      };
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = published;
        return next;
      }
      return [published, ...prev];
    });
    doToast('已发布到公共空间');
  };

  const handleUnpublishFromPublic = () => {
    if (!shareTargetProject) return;
    setPublicProjects(prev => prev.filter(p => p.sourceProjectId !== shareTargetProject.id));
    doToast('已从公共空间移除');
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

  const toggleImageSelection = (imageId: string) => {
    setSelectedImageIds(prev => {
      const next = new Set(prev);
      if (next.has(imageId)) next.delete(imageId);
      else next.add(imageId);
      return next;
    });
  };

  const toggleSelectAllImages = () => {
    if (selectedImageIds.size === visibleImages.length) {
      setSelectedImageIds(new Set());
      return;
    }
    setSelectedImageIds(new Set(visibleImages.map(image => image.id)));
  };

  const handleAddSelectedToLibrary = () => {
    if (selectedImages.length === 0) return;
    addImagesToPersonalLibrary(selectedImages);
    doToast(`已将 ${selectedImages.length} 张图片加入个人素材库`);
    setSelectedImageIds(new Set());
  };

  const handleAddMaterialByUrl = () => {
    if (!newMaterialUrl.trim()) return;
    addUrlToPersonalLibrary(newMaterialUrl);
    doToast('已添加到个人素材库');
    setNewMaterialUrl('');
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
          <div className="text-sm text-gray-500">共 {visibleImages.length} 张图片</div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAllImages}
              className="px-3 py-2 text-sm rounded-xl border border-gray-200 hover:bg-gray-50"
            >
              {selectedImageIds.size === visibleImages.length ? '取消全选' : '全选'}
            </button>
            <button
              disabled={selectedImageIds.size === 0}
              onClick={handleAddSelectedToLibrary}
              className="px-3 py-2 text-sm rounded-xl bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <PackagePlus size={14} />
              放入素材库 ({selectedImageIds.size})
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {visibleImages.map((image) => {
            const selected = selectedImageIds.has(image.id);
            return (
              <button
                key={image.id}
                onClick={() => toggleImageSelection(image.id)}
                className={clsx(
                  "group text-left relative overflow-hidden rounded-2xl border bg-white transition-all",
                  selected ? "border-black ring-2 ring-black/10" : "border-gray-100 hover:border-gray-300"
                )}
              >
                <div className="aspect-square bg-gray-50">
                  <img src={image.url} alt={image.projectName} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <div className="text-xs font-bold text-gray-900 truncate">{image.projectName}</div>
                  <div className="text-[11px] text-gray-500 mt-1">{new Date(image.projectLastModified).toLocaleString()}</div>
                </div>
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                  {selected && <CheckCircle2 size={13} className="text-black" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMaterialsView = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          value={newMaterialUrl}
          onChange={(e) => setNewMaterialUrl(e.target.value)}
          placeholder="粘贴图片链接后点击添加"
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-black outline-none"
        />
        <button
          onClick={handleAddMaterialByUrl}
          disabled={!newMaterialUrl.trim()}
          className="px-4 py-3 rounded-xl bg-black text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          增加素材
        </button>
      </div>
      {visibleMaterials.length === 0 ? (
        <div className="py-16 text-center text-gray-500">暂无素材，先从图片记录勾选后放入素材库。</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {visibleMaterials.map((material) => (
            <div key={material.id} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
              <div className="aspect-square bg-gray-50">
                <img src={material.url} alt={material.name || '素材'} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-gray-900 truncate">{material.name || '素材'}</div>
                  <div className="text-[11px] text-gray-500 mt-1">{new Date(material.createdAt).toLocaleDateString()}</div>
                </div>
                <button
                  onClick={() => {
                    removePersonalMaterial(material.id);
                  }}
                  className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50"
                  title="删除素材"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xl text-gray-500 font-medium">
              {space === 'public' ? (
                <>
                  公共空间 <span className="mx-2">|</span> 社区作品浏览与复用
                </>
              ) : (
                <>
                  个人空间 <span className="mx-2">|</span> 项目、图片记录、个人素材库一体管理
                </>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {space === 'public'
                ? `作品 ${visibleProjects.length}`
                : `项目 ${visibleProjects.length} · 图片 ${visibleImages.length} · 素材 ${visibleMaterials.length}`}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white border border-gray-100 rounded-2xl p-1 inline-flex gap-1">
              <button
                onClick={() => navigate('/projects')}
                className={clsx(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
                  space === 'personal' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                个人空间
              </button>
              <button
                onClick={() => navigate('/public')}
                className={clsx(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-colors",
                  space === 'public' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                公共空间
              </button>
            </div>
            <button
              onClick={handleCreateNew}
              className={clsx(
                "px-4 py-2 rounded-xl text-white flex items-center gap-2 transition-all",
                space === 'public'
                  ? "bg-gray-400 cursor-not-allowed"
                  : projects.length >= 5
                    ? "bg-gray-400 cursor-not-allowed"
                    : (theme.id.includes('glass') ? "bg-accent-primary/80 backdrop-blur-md" : "bg-accent-primary hover:opacity-90")
              )}
              disabled={space === 'public' || projects.length >= 5}
            >
              <Plus size={20} />
              新建项目
            </button>
          </div>
        </div>

        {toast && (
          <div className="fixed top-6 right-6 z-50">
            <div className="bg-black text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-xl shadow-black/20">
              {toast}
            </div>
          </div>
        )}

        {space === 'personal' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-900 inline-flex items-center gap-2">
                点对点导入作品
              </div>
              <div className="flex gap-2">
                <input
                  value={importShareCode}
                  onChange={(e) => setImportShareCode(e.target.value)}
                  placeholder="输入分享码（8位）"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:border-black outline-none"
                />
                <button
                  onClick={handleImportSharedProject}
                  disabled={!importShareCode.trim()}
                  className="px-3 py-2 rounded-xl border border-gray-300 text-sm disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  导入
                  <ArrowRight size={14} />
                </button>
              </div>
              <div className="text-xs text-gray-400">
                对方分享给你的项目，会以“（分享）”形式进入个人空间
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-900">公共空间说明</div>
              <div className="text-xs text-gray-500 leading-relaxed">
                在项目卡片里点击“分享”，即可发布到公共空间。公共空间的作品支持一键复用到你的个人空间。
              </div>
            </div>
          </div>
        )}

        {space === 'personal' && (
          <div className="bg-white border border-gray-100 rounded-2xl p-3 inline-flex gap-2">
            <button
              onClick={() => { setView('projects'); setSelectedImageIds(new Set()); }}
              className={clsx("px-4 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2", view === 'projects' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100')}
            >
              <Folder size={15} />
              项目
            </button>
            <button
              onClick={() => setView('images')}
              className={clsx("px-4 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2", view === 'images' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100')}
            >
              <ImageIcon size={15} />
              图片记录
            </button>
            <button
              onClick={() => setView('materials')}
              className={clsx("px-4 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2", view === 'materials' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100')}
            >
              <Library size={15} />
              素材库管理
            </button>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          {(space === 'public' || view === 'projects') && renderProjectsView()}
          {space === 'personal' && view === 'images' && renderImagesView()}
          {space === 'personal' && view === 'materials' && renderMaterialsView()}
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

              <div className="h-px bg-gray-100" />

              <div className="space-y-3">
                <div className="text-sm font-bold text-gray-900">发布到公共空间</div>
                <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-gray-200 bg-white">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900">{isPublishedToPublic ? '已发布' : '未发布'}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {isPublishedToPublic ? '公共空间可见，支持他人一键复用' : '发布后会出现在公共空间供他人复用'}
                    </div>
                  </div>
                  {isPublishedToPublic ? (
                    <button
                      onClick={handleUnpublishFromPublic}
                      className="px-4 py-2 rounded-2xl border border-gray-300 text-gray-900 font-semibold hover:bg-gray-50 transition-colors"
                    >
                      取消发布
                    </button>
                  ) : (
                    <button
                      onClick={handlePublishToPublic}
                      className="px-4 py-2 rounded-2xl bg-accent-primary text-white font-semibold hover:opacity-90 transition-opacity"
                    >
                      立即发布
                    </button>
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

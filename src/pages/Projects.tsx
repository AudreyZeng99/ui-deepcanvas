import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Clock, Trash2, Folder, Share2, X, ArrowRight, PackagePlus, Sparkles, Pencil, Download, Check } from 'lucide-react';
import { Project, SpaceImageRecord, useProject } from '../context/ProjectContext';
import clsx from 'clsx';
import CreateCanvasModal from '../components/CreateCanvasModal';
import { useToast } from '../components/ToastProvider';
import { createP2PShareRecord, makeTemplateElements, resolveP2PShareRecord, type P2PShareRecord } from '../utils/p2pShare';

type SpaceView = 'projects' | 'favorites' | 'gen-assets' | 'edit-assets' | 'export-assets' | 'p2p';

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

const PUBLIC_PROJECTS_STORAGE_KEY = 'trae_deepcanvas_public_projects_v1';
const PERSONAL_SPACE_TITLE_STORAGE_KEY = 'trae_deepcanvas_personal_space_title_v1';
const SPACE_ASSET_AUDIT_MAP_STORAGE_KEY = 'trae_deepcanvas_space_asset_audit_map_v1';

type AssetAuditRecord = {
  xiaobao: boolean;
  experience: boolean;
};

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

export default function Projects() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const {
    projects,
    personalImages,
    currentProject,
    isDirty,
    loadProject,
    deleteProject,
    createProject,
    updateProject,
    saveProject,
    saveCurrentProjectAsNew,
  } = useProject();

  const space: SpaceMode = location.pathname.startsWith('/public') ? 'public' : 'personal';
  const [view, setView] = useState<SpaceView>('projects');
  const [favoritesTab, setFavoritesTab] = useState<'inspiration' | 'prompts' | 'templates'>('inspiration');
  const [isHydrating, setIsHydrating] = useState(true);
  const [isCreateCanvasModalOpen, setIsCreateCanvasModalOpen] = useState(false);
  const [personalSpaceTitle, setPersonalSpaceTitle] = useState(() => {
    const stored = localStorage.getItem(PERSONAL_SPACE_TITLE_STORAGE_KEY);
    return stored?.trim() ? stored : '个人空间';
  });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(personalSpaceTitle);
  const [isTitleHover, setIsTitleHover] = useState(false);
  const [assetAuditMap, setAssetAuditMap] = useState<Record<string, AssetAuditRecord>>(() => {
    return safeParseJson<Record<string, AssetAuditRecord>>(localStorage.getItem(SPACE_ASSET_AUDIT_MAP_STORAGE_KEY), {});
  });
  const [isGenAssetsSelecting, setIsGenAssetsSelecting] = useState(false);
  const [selectedGenAssetIds, setSelectedGenAssetIds] = useState<Set<string>>(() => new Set());
  const [isEditAssetsSelecting, setIsEditAssetsSelecting] = useState(false);
  const [selectedEditAssetIds, setSelectedEditAssetIds] = useState<Set<string>>(() => new Set());
  const [isExportAssetsSelecting, setIsExportAssetsSelecting] = useState(false);
  const [selectedExportAssetIds, setSelectedExportAssetIds] = useState<Set<string>>(() => new Set());
  const [shareProjectId, setShareProjectId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [publicProjects] = useState<PublicProject[]>(() => {
    const parsed = safeParseJson<PublicProject[]>(localStorage.getItem(PUBLIC_PROJECTS_STORAGE_KEY), []);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getDefaultPublicProjects();
  });
  const [importShareCode, setImportShareCode] = useState('');
  const [generatedShareCode, setGeneratedShareCode] = useState<string | null>(null);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [redeemRecord, setRedeemRecord] = useState<P2PShareRecord | null>(null);
  const [isApplyTemplateModalOpen, setIsApplyTemplateModalOpen] = useState(false);
  const [pendingTemplateApply, setPendingTemplateApply] = useState<null | { width: number; height: number; elements: any[]; thumbnail?: string | null }>(null);
  const [isNavigateTTIModalOpen, setIsNavigateTTIModalOpen] = useState(false);
  const [pendingTTIPrompt, setPendingTTIPrompt] = useState<string | null>(null);

  const buildShareDisplay = (code: string) => `【文生图】挖到宝了！快复制完整口令¥${code}¥打开GUWP办公屏搜索文生图-个人空间查看！`;
  const visibleProjects = useMemo(() => {
    return space === 'public' ? publicProjects : projects;
  }, [space, publicProjects, projects]);

  const visibleImages = useMemo(() => {
    return personalImages;
  }, [personalImages]);

  const projectById = useMemo(() => {
    const map = new Map<string, Project>();
    projects.forEach((p) => map.set(p.id, p));
    return map;
  }, [projects]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsHydrating(false));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const moduleParam = params.get('module');
    const assetParam = params.get('asset');
    const favParam = params.get('fav');
    if (moduleParam === 'assets') {
      setView(assetParam === 'edit' ? 'edit-assets' : assetParam === 'export' ? 'export-assets' : 'gen-assets');
    } else if (moduleParam === 'favorites') {
      setView('favorites');
      if (favParam === 'prompts' || favParam === 'templates' || favParam === 'inspiration') {
        setFavoritesTab(favParam as any);
      }
    } else if (moduleParam === 'p2p') {
      setView('p2p');
    } else {
      setView('projects');
    }
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const currentModule = params.get('module');
    let nextModule = currentModule;
    let assetParam = params.get('asset');
    let favParam = params.get('fav');
    if (view === 'projects') {
      nextModule = 'projects';
      params.delete('asset');
      params.delete('fav');
    } else if (view === 'p2p') {
      nextModule = 'p2p';
      params.delete('asset');
      params.delete('fav');
    } else if (view === 'favorites') {
      nextModule = 'favorites';
      favParam = favoritesTab;
      params.set('fav', favParam);
      params.delete('asset');
    } else {
      nextModule = 'assets';
      assetParam = view === 'edit-assets' ? 'edit' : view === 'export-assets' ? 'export' : 'gen';
      params.set('asset', assetParam);
      params.delete('fav');
    }
    params.set('module', nextModule || 'projects');
    const nextSearch = params.toString();
    const currentSearch = location.search.replace(/^\?/, '');
    if (nextSearch !== currentSearch) {
      navigate({ pathname: location.pathname, search: nextSearch }, { replace: false });
    }
  }, [view, favoritesTab]);

  const generatedAssets = useMemo(() => {
    return visibleImages.filter((img) => projectById.get(img.projectId)?.sourceType === 'text-to-image');
  }, [visibleImages, projectById]);

  const editedAssets = useMemo(() => {
    return visibleImages.filter((img) => projectById.get(img.projectId)?.sourceType !== 'text-to-image');
  }, [visibleImages, projectById]);

  const exportedAssets = useMemo(() => {
    return visibleImages;
  }, [visibleImages]);

  const demoAuditedAssetIds = useMemo(() => {
    return new Set(['demo-gen-2', 'demo-gen-5', 'demo-edit-1', 'demo-edit-4', 'demo-exp-3', 'demo-exp-6']);
  }, []);

  const demoGeneratedAssets = useMemo<SpaceImageRecord[]>(() => {
    const now = Date.now();
    return [
      { id: 'demo-gen-1', url: 'https://picsum.photos/seed/deepcanvas-gen-1/900/1200', projectId: 'demo-gen', projectName: '生图示例 A', projectLastModified: now - 1000 * 60 * 12 },
      { id: 'demo-gen-2', url: 'https://picsum.photos/seed/deepcanvas-gen-2/900/700', projectId: 'demo-gen', projectName: '生图示例 B', projectLastModified: now - 1000 * 60 * 40 },
      { id: 'demo-gen-3', url: 'https://picsum.photos/seed/deepcanvas-gen-3/900/1400', projectId: 'demo-gen', projectName: '生图示例 C', projectLastModified: now - 1000 * 60 * 70 },
      { id: 'demo-gen-4', url: 'https://picsum.photos/seed/deepcanvas-gen-4/900/900', projectId: 'demo-gen', projectName: '生图示例 D', projectLastModified: now - 1000 * 60 * 95 },
      { id: 'demo-gen-5', url: 'https://picsum.photos/seed/deepcanvas-gen-5/900/1100', projectId: 'demo-gen', projectName: '生图示例 E', projectLastModified: now - 1000 * 60 * 160 },
      { id: 'demo-gen-6', url: 'https://picsum.photos/seed/deepcanvas-gen-6/900/760', projectId: 'demo-gen', projectName: '生图示例 F', projectLastModified: now - 1000 * 60 * 210 },
      { id: 'demo-gen-7', url: 'https://picsum.photos/seed/deepcanvas-gen-7/900/1320', projectId: 'demo-gen', projectName: '生图示例 G', projectLastModified: now - 1000 * 60 * 280 },
      { id: 'demo-gen-8', url: 'https://picsum.photos/seed/deepcanvas-gen-8/900/820', projectId: 'demo-gen', projectName: '生图示例 H', projectLastModified: now - 1000 * 60 * 360 },
    ];
  }, []);

  const demoEditedAssets = useMemo<SpaceImageRecord[]>(() => {
    const now = Date.now();
    return [
      { id: 'demo-edit-1', url: 'https://picsum.photos/seed/deepcanvas-edit-1/900/980', projectId: 'demo-edit', projectName: '编辑示例 A', projectLastModified: now - 1000 * 60 * 15 },
      { id: 'demo-edit-2', url: 'https://picsum.photos/seed/deepcanvas-edit-2/900/760', projectId: 'demo-edit', projectName: '编辑示例 B', projectLastModified: now - 1000 * 60 * 55 },
      { id: 'demo-edit-3', url: 'https://picsum.photos/seed/deepcanvas-edit-3/900/1280', projectId: 'demo-edit', projectName: '编辑示例 C', projectLastModified: now - 1000 * 60 * 120 },
      { id: 'demo-edit-4', url: 'https://picsum.photos/seed/deepcanvas-edit-4/900/700', projectId: 'demo-edit', projectName: '编辑示例 D', projectLastModified: now - 1000 * 60 * 200 },
      { id: 'demo-edit-5', url: 'https://picsum.photos/seed/deepcanvas-edit-5/900/1180', projectId: 'demo-edit', projectName: '编辑示例 E', projectLastModified: now - 1000 * 60 * 300 },
      { id: 'demo-edit-6', url: 'https://picsum.photos/seed/deepcanvas-edit-6/900/900', projectId: 'demo-edit', projectName: '编辑示例 F', projectLastModified: now - 1000 * 60 * 430 },
    ];
  }, []);

  const demoExportedAssets = useMemo<SpaceImageRecord[]>(() => {
    const now = Date.now();
    return [
      { id: 'demo-exp-1', url: 'https://picsum.photos/seed/deepcanvas-exp-1/900/760', projectId: 'demo-exp', projectName: '导出示例 A', projectLastModified: now - 1000 * 60 * 8 },
      { id: 'demo-exp-2', url: 'https://picsum.photos/seed/deepcanvas-exp-2/900/1340', projectId: 'demo-exp', projectName: '导出示例 B', projectLastModified: now - 1000 * 60 * 32 },
      { id: 'demo-exp-3', url: 'https://picsum.photos/seed/deepcanvas-exp-3/900/900', projectId: 'demo-exp', projectName: '导出示例 C', projectLastModified: now - 1000 * 60 * 88 },
      { id: 'demo-exp-4', url: 'https://picsum.photos/seed/deepcanvas-exp-4/900/1120', projectId: 'demo-exp', projectName: '导出示例 D', projectLastModified: now - 1000 * 60 * 140 },
      { id: 'demo-exp-5', url: 'https://picsum.photos/seed/deepcanvas-exp-5/900/740', projectId: 'demo-exp', projectName: '导出示例 E', projectLastModified: now - 1000 * 60 * 260 },
      { id: 'demo-exp-6', url: 'https://picsum.photos/seed/deepcanvas-exp-6/900/1250', projectId: 'demo-exp', projectName: '导出示例 F', projectLastModified: now - 1000 * 60 * 420 },
    ];
  }, []);

  const displayGeneratedAssets = useMemo(() => {
    return generatedAssets.length > 0 ? generatedAssets : demoGeneratedAssets;
  }, [generatedAssets, demoGeneratedAssets]);

  const displayEditedAssets = useMemo(() => {
    return editedAssets.length > 0 ? editedAssets : demoEditedAssets;
  }, [editedAssets, demoEditedAssets]);

  const displayExportedAssets = useMemo(() => {
    return exportedAssets.length > 0 ? exportedAssets : demoExportedAssets;
  }, [exportedAssets, demoExportedAssets]);

  const shareTargetProject = useMemo(() => {
    if (!shareProjectId) return null;
    return projects.find(p => p.id === shareProjectId) || null;
  }, [projects, shareProjectId]);

  const doToast = (message: string) => toast.show(message);

  useEffect(() => {
    if (view !== 'gen-assets') {
      setIsGenAssetsSelecting(false);
      setSelectedGenAssetIds(new Set());
    }
    if (view !== 'edit-assets') {
      setIsEditAssetsSelecting(false);
      setSelectedEditAssetIds(new Set());
    }
    if (view !== 'export-assets') {
      setIsExportAssetsSelecting(false);
      setSelectedExportAssetIds(new Set());
    }
  }, [view]);

  const persistPersonalSpaceTitle = (nextTitle: string) => {
    const normalized = nextTitle.trim() ? nextTitle.trim() : '个人空间';
    setPersonalSpaceTitle(normalized);
    setTitleDraft(normalized);
    localStorage.setItem(PERSONAL_SPACE_TITLE_STORAGE_KEY, normalized);
    doToast('标题已更新');
  };

  const persistAssetAuditMap = (nextMap: Record<string, AssetAuditRecord>) => {
    setAssetAuditMap(nextMap);
    localStorage.setItem(SPACE_ASSET_AUDIT_MAP_STORAGE_KEY, JSON.stringify(nextMap));
  };

  const getAuditedLabel = (assetId: string) => {
    const record = assetAuditMap[assetId];
    if (!record && demoAuditedAssetIds.has(assetId)) return '已审核';
    return record?.xiaobao && record?.experience ? '已审核' : '未审核';
  };

  const markAssetsAudited = (type: keyof AssetAuditRecord) => {
    const items =
      view === 'gen-assets'
        ? displayGeneratedAssets
        : view === 'edit-assets'
          ? displayEditedAssets
          : view === 'export-assets'
            ? displayExportedAssets
            : [];

    if (items.length === 0) {
      doToast('当前没有可审核的资产');
      return;
    }

    if (view !== 'gen-assets' && view !== 'edit-assets' && view !== 'export-assets') {
      doToast('请先进入资产页');
      return;
    }

    const nextMap: Record<string, AssetAuditRecord> = { ...assetAuditMap };
    items.forEach((item) => {
      const prev = nextMap[item.id] || { xiaobao: false, experience: false };
      nextMap[item.id] = { ...prev, [type]: true };
    });
    persistAssetAuditMap(nextMap);
    doToast(`已完成${type === 'xiaobao' ? '消保' : '体验'}审核`);
  };

  const toggleGenAssetsSelecting = () => {
    setIsGenAssetsSelecting((prev) => {
      const next = !prev;
      if (!next) setSelectedGenAssetIds(new Set());
      return next;
    });
  };

  const toggleGenAssetSelected = (assetId: string) => {
    setSelectedGenAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) next.delete(assetId);
      else next.add(assetId);
      return next;
    });
  };

  const toggleEditAssetsSelecting = () => {
    setIsEditAssetsSelecting((prev) => {
      const next = !prev;
      if (!next) setSelectedEditAssetIds(new Set());
      return next;
    });
  };

  const toggleEditAssetSelected = (assetId: string) => {
    setSelectedEditAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) next.delete(assetId);
      else next.add(assetId);
      return next;
    });
  };

  const toggleExportAssetsSelecting = () => {
    setIsExportAssetsSelecting((prev) => {
      const next = !prev;
      if (!next) setSelectedExportAssetIds(new Set());
      return next;
    });
  };

  const toggleExportAssetSelected = (assetId: string) => {
    setSelectedExportAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) next.delete(assetId);
      else next.add(assetId);
      return next;
    });
  };

  const sendSelectedAssetsToAudit = (type: keyof AssetAuditRecord) => {
    if (view !== 'gen-assets' && view !== 'edit-assets' && view !== 'export-assets') {
      doToast('请先进入资产页');
      return;
    }

    const selectedIds =
      view === 'gen-assets'
        ? selectedGenAssetIds
        : view === 'edit-assets'
          ? selectedEditAssetIds
          : selectedExportAssetIds;


    if (selectedIds.size === 0) {
      doToast('请先勾选资产');
      return;
    }

    const nextMap: Record<string, AssetAuditRecord> = { ...assetAuditMap };
    Array.from(selectedIds).forEach((assetId) => {
      const prev = nextMap[assetId] || { xiaobao: false, experience: false };
      nextMap[assetId] = { ...prev, [type]: true };
    });
    persistAssetAuditMap(nextMap);
    doToast(`已送 ${selectedIds.size} 张到${type === 'xiaobao' ? '消保' : '体验'}审核`);

    if (view === 'gen-assets') setSelectedGenAssetIds(new Set());
    if (view === 'edit-assets') setSelectedEditAssetIds(new Set());
    if (view === 'export-assets') setSelectedExportAssetIds(new Set());
  };

  const handleCreateNew = () => {
    if (space === 'public') return;
    if (projects.length >= 5) {
      doToast('已达到个人文件数量上限 (5个)。请先删除部分旧文件。');
      return;
    }
    setIsCreateCanvasModalOpen(true);
  };

  const handleProjectClick = (id: string) => {
    loadProject(id);
    navigate('/editor');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确认删除该设计吗？')) {
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

  const closeRedeemModal = () => {
    setIsRedeemModalOpen(false);
    setRedeemRecord(null);
  };

  const closeApplyTemplateModal = () => {
    setIsApplyTemplateModalOpen(false);
    setPendingTemplateApply(null);
  };

  const getRedeemPreviewUrl = (record: P2PShareRecord | null) => {
    if (!record) return null;
    if (record.kind === 'inspiration') return record.payload.imageUrl;
    if (record.kind === 'public_template') return record.payload.previewImageUrl;
    return record.payload.project.thumbnail || null;
  };

  const doApplyTemplateToCanvas = (next: { width: number; height: number; elements: any[]; thumbnail?: string | null }) => {
    const canvasHasContent = (currentProject?.elements?.length || 0) > 0;
    if (canvasHasContent) {
      const ok = window.confirm('当前创建设计画布非空，继续将覆盖现有内容吗？');
      if (!ok) return;
    }

    if (!currentProject) {
      createProject(next.width, next.height, 'Untitled Project', {
        elements: next.elements,
        thumbnail: next.thumbnail || undefined,
        sourceType: 'manual',
      });
      navigate('/editor');
      doToast('已应用到画布');
      return;
    }

    updateProject({
      width: next.width,
      height: next.height,
      elements: next.elements,
      thumbnail: next.thumbnail || undefined,
      sourceType: 'manual',
    });
    navigate('/editor');
    doToast('已应用到画布');
  };

  const applyTemplateToCanvas = (next: { width: number; height: number; elements: any[]; thumbnail?: string | null }) => {
    if (currentProject && isDirty) {
      setPendingTemplateApply(next);
      setIsApplyTemplateModalOpen(true);
      return;
    }
    doApplyTemplateToCanvas(next);
  };

  const handleSaveDirtyCanvasThenApply = () => {
    if (!pendingTemplateApply) return;
    const status = saveCurrentProjectAsNew();
    if (status === 'limit_reached') {
      doToast('已达到个人文件数量上限 (5个)，无法先保存当前画布。');
      return;
    }
    doToast('已保存到个人设计');
    closeApplyTemplateModal();
    doApplyTemplateToCanvas(pendingTemplateApply);
  };

  const handleDiscardDirtyCanvasThenApply = () => {
    if (!pendingTemplateApply) return;
    closeApplyTemplateModal();
    doApplyTemplateToCanvas(pendingTemplateApply);
  };

  const handleApplyRedeemedTemplate = () => {
    if (!redeemRecord) return;
    const previewUrl = getRedeemPreviewUrl(redeemRecord);
    if (redeemRecord.kind === 'personal_design') {
      const source = redeemRecord.payload.project;
      applyTemplateToCanvas({
        width: source.width,
        height: source.height,
        elements: Array.isArray(source.elements) ? source.elements : [],
        thumbnail: source.thumbnail || previewUrl,
      });
      closeRedeemModal();
      return;
    }

    if (redeemRecord.kind === 'public_template') {
      const elements = Array.isArray(redeemRecord.payload.elements)
        ? redeemRecord.payload.elements
        : makeTemplateElements(
            redeemRecord.payload.previewImageUrl,
            redeemRecord.payload.width || 1080,
            redeemRecord.payload.height || 1920
          );
      applyTemplateToCanvas({
        width: redeemRecord.payload.width || 1080,
        height: redeemRecord.payload.height || 1920,
        elements,
        thumbnail: redeemRecord.payload.previewImageUrl || previewUrl,
      });
      closeRedeemModal();
      return;
    }
  };

  const handleDoSameInspiration = () => {
    if (!redeemRecord || redeemRecord.kind !== 'inspiration') return;
    const existsInPersonalSpace = currentProject ? projects.some(p => p.id === currentProject.id) : false;
    if (currentProject && (isDirty || !existsInPersonalSpace)) {
      setPendingTTIPrompt(redeemRecord.payload.prompt);
      setIsNavigateTTIModalOpen(true);
      return;
    }
    navigate('/text-to-image', { state: { prompt: redeemRecord.payload.prompt } });
    closeRedeemModal();
  };

  const handleGenerateP2PShareCode = async () => {
    if (!shareTargetProject) return;
    const record = createP2PShareRecord({
      kind: 'personal_design',
      payload: { project: shareTargetProject },
    });
    setGeneratedShareCode(record.code);
    try {
      await navigator.clipboard.writeText(record.code);
      doToast('口令已复制到剪切板');
    } catch {
      doToast('口令已复制到剪切板');
    }
  };

  const handleImportSharedProject = () => {
    if (!importShareCode.trim()) return;
    const code = importShareCode.trim().toUpperCase();
    const record = resolveP2PShareRecord(code);
    if (!record) {
      doToast('口令无效或已失效');
      return;
    }
    setRedeemRecord(record);
    setIsRedeemModalOpen(true);
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
      if (space === 'public') {
        return (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h3 className="text-lg font-semibold text-gray-900">公共空间暂无作品</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-2">
              先在个人空间把设计发布到公共空间，这里会展示社区作品。
            </p>
          </div>
        );
      }
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {space !== 'public' && (
          <button
            onClick={handleCreateNew}
            disabled={projects.length >= 5}
            className={clsx(
              "group relative rounded-2xl border border-dashed border-black/10 bg-white overflow-hidden text-left transition-all duration-200 hover:border-black/20 hover:shadow-sm",
              projects.length >= 5 && "opacity-60 cursor-not-allowed hover:shadow-none hover:border-black/10"
            )}
          >
            <div className="aspect-[4/3] flex items-center justify-center bg-gradient-to-br from-black/[0.02] to-black/[0.06]">
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-black/10 shadow-sm flex items-center justify-center text-gray-700">
                  <Plus size={22} />
                </div>
                <div className="text-sm font-semibold text-gray-900">新建设计</div>
                <div className="text-xs text-gray-500">
                  {projects.length >= 5 ? '已达上限（5个）' : '创建一张新画布'}
                </div>
              </div>
            </div>
          </button>
        )}
        {visibleProjects.map((project: any) => (
          <div
            key={project.id}
            onClick={() => {
              if (space === 'public') handleForkPublicProject(project as PublicProject);
              else handleProjectClick(project.id);
            }}
            className="group relative rounded-2xl border border-black/5 bg-white overflow-hidden hover:border-black/10 hover:shadow-sm transition-all duration-200 cursor-pointer"
          >
            <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center relative overflow-hidden">
              {project.thumbnail ? (
                <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <Folder size={32} className="text-gray-300" />
                </div>
              )}
              {space !== 'public' ? (
                <button
                  onClick={(e) => openShareModal(e, project.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-9 h-9 rounded-full bg-white/85 backdrop-blur border border-black/10 shadow-sm flex items-center justify-center text-gray-700 hover:bg-white"
                  title="分享口令"
                >
                  <Share2 size={16} />
                </button>
              ) : (
                <div className="absolute left-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 border border-black/10 text-gray-900 text-xs font-semibold">
                    <PackagePlus size={14} />
                    一键复用
                  </div>
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-900 truncate">{project.name}</h3>
                {space !== 'public' && (
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    className="p-2 -m-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                <Clock size={12} />
                <span>{new Date(space === 'public' ? project.publishedAt : project.lastModified).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAssetsModule = () => {
    const setAssetView = (next: 'gen-assets' | 'edit-assets' | 'export-assets') => setView(next);
    const showSelection =
      view === 'gen-assets' ? isGenAssetsSelecting : view === 'edit-assets' ? isEditAssetsSelecting : isExportAssetsSelecting;
    const selectedIds =
      view === 'gen-assets'
        ? selectedGenAssetIds
        : view === 'edit-assets'
          ? selectedEditAssetIds
          : selectedExportAssetIds;
    const selectedCount = selectedIds.size;
    const toggleSelecting =
      view === 'gen-assets' ? toggleGenAssetsSelecting : view === 'edit-assets' ? toggleEditAssetsSelecting : toggleExportAssetsSelecting;

    return (
      <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <nav className="flex items-center gap-6">
              <button
                onClick={() => setAssetView('gen-assets')}
                className={clsx(
                  "h-10 px-0 text-sm font-semibold border-b-2 transition-colors",
                  view === 'gen-assets'
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                )}
                aria-selected={view === 'gen-assets'}
              >
                文生图历史
              </button>
              <button
                onClick={() => setAssetView('edit-assets')}
                className={clsx(
                  "h-10 px-0 text-sm font-semibold border-b-2 transition-colors",
                  view === 'edit-assets'
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                )}
                aria-selected={view === 'edit-assets'}
              >
                AI生成
              </button>
              <button
                onClick={() => setAssetView('export-assets')}
                className={clsx(
                  "h-10 px-0 text-sm font-semibold border-b-2 transition-colors",
                  view === 'export-assets'
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                )}
                aria-selected={view === 'export-assets'}
              >
                导出资产
              </button>
            </nav>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={toggleSelecting}
              className={clsx("btn-flat-neutral", showSelection && "bg-gray-50")}
            >
              {showSelection ? '取消' : '选择'}
            </button>
            <button
              onClick={() => (showSelection ? sendSelectedAssetsToAudit('xiaobao') : markAssetsAudited('xiaobao'))}
              disabled={showSelection && selectedCount === 0}
              className="btn-ion"
            >
              消保审核
            </button>
            <button
              onClick={() => (showSelection ? sendSelectedAssetsToAudit('experience') : markAssetsAudited('experience'))}
              disabled={showSelection && selectedCount === 0}
              className="btn-ion"
            >
              体验审核
            </button>
          </div>
        </div>

        <div>
          {view === 'gen-assets' && renderAssetMasonry('文生图历史', displayGeneratedAssets, '暂无文生图历史', false)}
          {view === 'edit-assets' && renderAssetMasonry('AI生成', displayEditedAssets, '暂无AI生成记录', false)}
          {view === 'export-assets' && renderAssetMasonry('导出资产', displayExportedAssets, '暂无导出资产', false)}
        </div>
      </div>
    );
  };

  const renderFavoritesModule = () => {
    return (
      <div className="space-y-5">
        <nav className="flex items-center gap-6">
          <button
            onClick={() => setFavoritesTab('inspiration')}
            className={clsx(
              "h-10 px-0 text-sm font-semibold border-b-2 transition-colors",
              favoritesTab === 'inspiration' ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-700"
            )}
            aria-selected={favoritesTab === 'inspiration'}
          >
            灵感
          </button>
          <button
            onClick={() => setFavoritesTab('prompts')}
            className={clsx(
              "h-10 px-0 text-sm font-semibold border-b-2 transition-colors",
              favoritesTab === 'prompts' ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-700"
            )}
            aria-selected={favoritesTab === 'prompts'}
          >
            提示词
          </button>
          <button
            onClick={() => setFavoritesTab('templates')}
            className={clsx(
              "h-10 px-0 text-sm font-semibold border-b-2 transition-colors",
              favoritesTab === 'templates' ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-700"
            )}
            aria-selected={favoritesTab === 'templates'}
          >
            公共模板
          </button>
        </nav>
        <div className="py-12 text-center text-gray-400">
          {favoritesTab === 'inspiration' && '暂无收藏的灵感'}
          {favoritesTab === 'prompts' && '暂无收藏的提示词'}
          {favoritesTab === 'templates' && '暂无收藏的公共模板'}
        </div>
      </div>
    );
  };
  const renderAssetMasonry = (title: string, items: typeof visibleImages, emptyText: string, withToolbar: boolean = true) => {
    if (items.length === 0) {
      return (
        <div className="py-16 text-center text-gray-500">
          {emptyText}
        </div>
      );
    }
    const selectionEnabled = view === 'gen-assets' || view === 'edit-assets' || view === 'export-assets';
    const showSelection =
      view === 'gen-assets' ? isGenAssetsSelecting : view === 'edit-assets' ? isEditAssetsSelecting : isExportAssetsSelecting;
    const selectedIds =
      view === 'gen-assets'
        ? selectedGenAssetIds
        : view === 'edit-assets'
          ? selectedEditAssetIds
          : selectedExportAssetIds;
    const selectedCount = selectedIds.size;
    const toggleSelecting =
      view === 'gen-assets' ? toggleGenAssetsSelecting : view === 'edit-assets' ? toggleEditAssetsSelecting : toggleExportAssetsSelecting;
    const toggleSelected =
      view === 'gen-assets' ? toggleGenAssetSelected : view === 'edit-assets' ? toggleEditAssetSelected : toggleExportAssetSelected;
    return (
      <div className="space-y-5">
        {withToolbar && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-sm font-black text-gray-900">{title}</div>
              <div className="text-xs text-gray-500">共 {items.length} 张</div>
            </div>
            <div className="flex items-center gap-2">
              {selectionEnabled && (
                <>
                  <button
                    onClick={toggleSelecting}
                    className={clsx("btn-ion", showSelection && "shadow-md")}
                  >
                    {showSelection ? '取消' : '选择'}
                  </button>
                  {showSelection && (
                    <button
                      onClick={() => sendSelectedAssetsToAudit('xiaobao')}
                      disabled={selectedCount === 0}
                      className="btn-ember"
                    >
                      送消保审核
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded-full text-[11px] font-black",
                          selectedCount === 0
                            ? "bg-black/5 text-black/40"
                            : "text-accent-promotion"
                        )}
                        style={
                          selectedCount === 0
                            ? undefined
                            : { backgroundColor: 'color-mix(in srgb, var(--accent-promotion) 12%, white)' }
                        }
                      >
                        {selectedCount}
                      </span>
                    </button>
                  )}
                  {showSelection && (
                    <button
                      onClick={() => sendSelectedAssetsToAudit('experience')}
                      disabled={selectedCount === 0}
                      className="btn-breeze"
                    >
                      送体验审核
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded-full text-[11px] font-black",
                          selectedCount === 0
                            ? "bg-black/5 text-black/40"
                            : "text-accent-minor"
                        )}
                        style={
                          selectedCount === 0
                            ? undefined
                            : { backgroundColor: 'color-mix(in srgb, var(--accent-minor) 12%, white)' }
                        }
                      >
                        {selectedCount}
                      </span>
                    </button>
                  )}
                </>
              )}
              <button
                onClick={() => markAssetsAudited('xiaobao')}
                disabled={showSelection}
                className="btn-ion"
              >
                消保审核
              </button>
              <button
                onClick={() => markAssetsAudited('experience')}
                disabled={showSelection}
                className="btn-ion"
              >
                体验审核
              </button>
            </div>
          </div>
        )}

        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
          {items.map((image) => (
            <div key={image.id} className="mb-4 break-inside-avoid">
              <div
                onClick={() => {
                  if (showSelection) toggleSelected(image.id);
                }}
                className={clsx(
                  "group overflow-hidden rounded-2xl border border-black/5 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all",
                  showSelection && "cursor-pointer select-none",
                  showSelection && selectedIds.has(image.id) && "ring-2 ring-gray-300 border-gray-200"
                )}
              >
                <div className="relative">
                  <img src={image.url} alt={image.projectName} className="w-full h-auto object-cover" />
                  <div
                    className={clsx(
                      "absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-black border shadow-md backdrop-blur",
                      getAuditedLabel(image.id) === '已审核'
                        ? "bg-emerald-500/92 text-white border-emerald-300/80 shadow-emerald-500/30"
                        : "bg-rose-500/92 text-white border-rose-300/80 shadow-rose-500/30"
                    )}
                  >
                    {getAuditedLabel(image.id)}
                  </div>
                  {showSelection && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelected(image.id);
                      }}
                      className={clsx(
                        "absolute top-3 right-3 w-7 h-7 rounded-full border flex items-center justify-center transition-colors",
                        selectedIds.has(image.id)
                          ? "bg-gray-800 border-gray-800 text-white"
                          : "bg-white/85 backdrop-blur border-black/10 text-transparent hover:border-black/20"
                      )}
                      aria-pressed={selectedIds.has(image.id)}
                      title={selectedIds.has(image.id) ? '取消勾选' : '勾选'}
                    >
                      <Check size={16} strokeWidth={3} />
                    </button>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-xs font-bold text-gray-900 truncate">{image.projectName}</div>
                  <div className="text-[11px] text-gray-500 mt-1">{new Date(image.projectLastModified).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderP2PView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-3xl border border-black/5 bg-white overflow-hidden">
        <div className="p-6">
          <div className="text-sm font-semibold text-gray-900">点对点导入作品</div>
          <div className="text-xs text-gray-500 mt-2">
            输入口令，先兑换查看预览，再选择“做同款”或“应用模板”
          </div>
          <div className="mt-5 flex gap-2">
            <input
              value={importShareCode}
              onChange={(e) => setImportShareCode(e.target.value)}
              placeholder="输入口令（8位或12位）"
              className="flex-1 px-4 py-3 rounded-2xl border border-black/10 focus:border-black/25 outline-none bg-white"
            />
            <button
              onClick={handleImportSharedProject}
              disabled={!importShareCode.trim()}
              className={clsx(
                "btn-breeze-orange px-4 py-3 rounded-2xl",
                !importShareCode.trim() && "opacity-50"
              )}
            >
              兑换
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-black/5 bg-white overflow-hidden">
        <div className="p-6">
          <div className="text-sm font-semibold text-gray-900">点对点分享作品</div>
          <div className="text-xs text-gray-500 mt-2 leading-relaxed">
            在“个人设计 / 公共模板 / 灵感”里点击右上角分享，生成口令复制给对方即可。
          </div>
          <button
            onClick={() => setView('projects')}
            className="mt-5 btn-secondary w-full justify-center px-4 py-3 rounded-2xl"
          >
            回到个人设计
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <CreateCanvasModal isOpen={isCreateCanvasModalOpen} onClose={() => setIsCreateCanvasModalOpen(false)} />
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-10 py-12 space-y-10">
        {space === 'personal' ? (
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="text-[11px] font-medium tracking-widest text-gray-400 uppercase">个人空间</div>
              <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
                <div
                  className="flex items-center gap-1.5"
                  onMouseEnter={() => setIsTitleHover(true)}
                  onMouseLeave={() => setIsTitleHover(false)}
                >
                  {isEditingTitle ? (
                    <input
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      onBlur={() => {
                        setIsEditingTitle(false);
                        persistPersonalSpaceTitle(titleDraft);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setIsEditingTitle(false);
                          persistPersonalSpaceTitle(titleDraft);
                        }
                        if (e.key === 'Escape') {
                          setIsEditingTitle(false);
                          setTitleDraft(personalSpaceTitle);
                        }
                      }}
                      className="text-2xl font-semibold tracking-tight text-gray-950 bg-transparent outline-none border-b border-black/10 focus:border-black/30 px-0.5"
                      autoFocus
                    />
                  ) : (
                    <div className="text-2xl font-semibold tracking-tight text-gray-950">{personalSpaceTitle}</div>
                  )}
                  {!isEditingTitle && isTitleHover && (
                    <button
                      onClick={() => {
                        setTitleDraft(personalSpaceTitle);
                        setIsEditingTitle(true);
                      }}
                      className="p-2 rounded-xl text-gray-300 hover:text-gray-700 hover:bg-black/5 transition-colors"
                      title="重命名"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-400 font-medium">
                  设计 {visibleProjects.length} · 生图 {displayGeneratedAssets.length} · 编辑 {displayEditedAssets.length} · 导出 {displayExportedAssets.length}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('p2p')}
                className={clsx(
                  "btn-breeze-orange-sm",
                  view === 'p2p' && "shadow-sm"
                )}
                aria-selected={view === 'p2p'}
              >
                <Share2 size={14} />
                兑换分享口令
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
              className="btn-secondary px-4 py-2 rounded-xl"
            >
              返回个人空间
            </button>
          </div>
        )}

        {space === 'personal' && (
          <div className="flex items-center justify-between gap-4 border-b border-black/5">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setView('projects')}
                className={clsx(
                  "inline-flex items-center gap-2 py-3 -mb-px text-sm font-semibold border-b-2 transition-colors",
                  view === 'projects'
                    ? "text-gray-700 border-gray-300"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                )}
                aria-selected={view === 'projects'}
              >
                <Folder size={16} className={clsx(view === 'projects' ? "opacity-80" : "opacity-50")} />
                个人设计
              </button>
              <button
                onClick={() => setView('gen-assets')}
                className={clsx(
                  "inline-flex items-center gap-2 py-3 -mb-px text-sm font-semibold border-b-2 transition-colors",
                  (view === 'gen-assets' || view === 'edit-assets' || view === 'export-assets')
                    ? "text-gray-700 border-gray-300"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                )}
                aria-selected={(view === 'gen-assets' || view === 'edit-assets' || view === 'export-assets')}
              >
                <Download size={16} className={clsx((view === 'gen-assets' || view === 'edit-assets' || view === 'export-assets') ? "opacity-80" : "opacity-50")} />
                历史资产
              </button>
              <button
                onClick={() => setView('favorites')}
                className={clsx(
                  "inline-flex items-center gap-2 py-3 -mb-px text-sm font-semibold border-b-2 transition-colors",
                  view === 'favorites'
                    ? "text-gray-700 border-gray-300"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                )}
                aria-selected={view === 'favorites'}
              >
                <Sparkles size={16} className={clsx(view === 'favorites' ? "opacity-80" : "opacity-50")} />
                我的收藏
              </button>
            </div>
            <div className="flex items-center gap-2"></div>
          </div>
        )}

        <div className="rounded-3xl border border-black/5 bg-white p-8">
          {isHydrating ? (
            <div className="animate-pulse space-y-6">
              <div className="h-7 w-48 rounded-xl bg-black/5" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="h-36 rounded-2xl bg-black/5" />
                <div className="h-36 rounded-2xl bg-black/5" />
                <div className="h-36 rounded-2xl bg-black/5" />
              </div>
            </div>
          ) : (
            <div>
              {space === 'public' && renderProjectsView()}
              {space === 'personal' && view === 'projects' && renderProjectsView()}
              {space === 'personal' && (view === 'gen-assets' || view === 'edit-assets' || view === 'export-assets') && renderAssetsModule()}
              {space === 'personal' && view === 'favorites' && renderFavoritesModule()}
              {space === 'personal' && view === 'p2p' && renderP2PView()}
            </div>
          )}
        </div>
      </div>

      {isShareModalOpen && shareTargetProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/25" onClick={closeShareModal} />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-black/10 overflow-hidden">
            <div className="p-6 border-b border-black/5 flex items-start justify-between">
              <div>
                <div className="text-xs text-gray-500 font-medium">分享设计</div>
                <div className="text-lg font-semibold text-gray-900 mt-1 truncate">{shareTargetProject.name}</div>
              </div>
              <button onClick={closeShareModal} className="p-2 rounded-xl hover:bg-black/5 text-gray-500 transition-colors" title="关闭">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-3">
                <div className="text-sm font-semibold text-gray-900">点对点分享</div>
                <div className="text-xs text-gray-500">
                  生成一个口令发给对方，对方在个人空间输入后即可兑换预览
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleGenerateP2PShareCode}
                    className="btn-ion"
                  >
                    生成口令
                  </button>
                  {generatedShareCode && (
                    <div className="flex-1 px-4 py-2 rounded-2xl border border-black/10 bg-white text-sm font-semibold tracking-normal text-gray-900">
                      {buildShareDisplay(generatedShareCode)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isNavigateTTIModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsNavigateTTIModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-black/10 overflow-hidden">
            <div className="p-6 border-b border-black/5 flex items-start justify-between">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-medium">未保存提示</div>
                <div className="text-lg font-semibold text-gray-900">当前画布有未保存修改</div>
              </div>
              <button onClick={() => setIsNavigateTTIModalOpen(false)} className="p-2 rounded-xl hover:bg-black/5 text-gray-500 transition-colors" title="关闭">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="text-sm text-gray-600 leading-relaxed">
                继续前往文生图将离开当前画布。你可以先把当前画布保存为一份个人设计（备份），再继续。
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    const status = saveCurrentProjectAsNew();
                    if (status === 'limit_reached') {
                      doToast('已达到个人文件数量上限 (5个)，无法先保存当前画布。');
                      return;
                    }
                    doToast('已保存到个人设计');
                    setIsNavigateTTIModalOpen(false);
                    if (pendingTTIPrompt) {
                      navigate('/text-to-image', { state: { prompt: pendingTTIPrompt } });
                      closeRedeemModal();
                    }
                  }}
                  className="btn-breeze-orange flex-1 justify-center px-4 py-3 rounded-2xl"
                >
                  保存到个人设计并继续
                </button>
                <button
                  onClick={() => {
                    setIsNavigateTTIModalOpen(false);
                    if (pendingTTIPrompt) {
                      navigate('/text-to-image', { state: { prompt: pendingTTIPrompt } });
                      closeRedeemModal();
                    }
                  }}
                  className="btn-secondary flex-1 justify-center px-4 py-3 rounded-2xl"
                >
                  直接覆盖
                </button>
              </div>
              <button
                onClick={() => setIsNavigateTTIModalOpen(false)}
                className="btn-flat-neutral w-full justify-center px-4 py-3 rounded-2xl"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
      {isRedeemModalOpen && redeemRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/30" onClick={closeRedeemModal} />
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-black/10 overflow-hidden">
            <div className="p-6 border-b border-black/5 flex items-start justify-between">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-medium">口令兑换</div>
                <div className="text-lg font-semibold text-gray-900">
                  {redeemRecord.kind === 'inspiration'
                    ? '收到一个灵感'
                    : redeemRecord.kind === 'public_template'
                      ? '收到一个公共模板'
                      : '收到一个个人设计'}
                </div>
              </div>
              <button onClick={closeRedeemModal} className="p-2 rounded-xl hover:bg-black/5 text-gray-500 transition-colors" title="关闭">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="p-6 bg-black/[0.02] border-r border-black/5">
                <div className="aspect-[4/3] rounded-2xl bg-white border border-black/10 overflow-hidden flex items-center justify-center">
                  {getRedeemPreviewUrl(redeemRecord) ? (
                    <img
                      src={getRedeemPreviewUrl(redeemRecord) as string}
                      alt="预览"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-xs text-gray-400">暂无预览</div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/5 text-gray-700">
                      {redeemRecord.kind === 'inspiration'
                        ? '灵感'
                        : redeemRecord.kind === 'public_template'
                          ? '公共模板'
                          : '个人设计'}
                    </span>
                    {redeemRecord.kind === 'personal_design' && (
                      <div className="text-xs text-gray-500 truncate">{redeemRecord.payload.project.name}</div>
                    )}
                    {redeemRecord.kind === 'public_template' && (
                      <div className="text-xs text-gray-500 truncate">{redeemRecord.payload.title}</div>
                    )}
                  </div>

                  {redeemRecord.kind === 'inspiration' && (
                    <div className="rounded-2xl border border-black/10 bg-white p-4">
                      <div className="text-xs text-gray-500 font-medium">提示词</div>
                      <div className="mt-2 text-sm text-gray-900 whitespace-pre-wrap break-words">
                        {redeemRecord.payload.prompt}
                      </div>
                    </div>
                  )}

                  {redeemRecord.kind !== 'inspiration' && (
                    <div className="text-xs text-gray-500">
                      画布尺寸 {redeemRecord.kind === 'personal_design' ? `${redeemRecord.payload.project.width}×${redeemRecord.payload.project.height}` : `${redeemRecord.payload.width || 1080}×${redeemRecord.payload.height || 1920}`}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {redeemRecord.kind === 'inspiration' ? (
                    <button onClick={handleDoSameInspiration} className="btn-breeze-orange flex-1 justify-center px-4 py-3 rounded-2xl">
                      做同款
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button onClick={handleApplyRedeemedTemplate} className="btn-breeze-orange flex-1 justify-center px-4 py-3 rounded-2xl">
                      应用模板
                      <ArrowRight size={16} />
                    </button>
                  )}
                  <button onClick={closeRedeemModal} className="btn-secondary justify-center px-4 py-3 rounded-2xl">
                    关闭
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isApplyTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/30" onClick={closeApplyTemplateModal} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl border border-black/10 overflow-hidden">
            <div className="p-6 border-b border-black/5 flex items-start justify-between">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-medium">未保存提示</div>
                <div className="text-lg font-semibold text-gray-900">当前画布有未保存修改</div>
              </div>
              <button onClick={closeApplyTemplateModal} className="p-2 rounded-xl hover:bg-black/5 text-gray-500 transition-colors" title="关闭">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="text-sm text-gray-600 leading-relaxed">
                继续应用将覆盖当前画布内容。你可以先把当前画布保存为一份个人设计（备份），再继续应用。
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleSaveDirtyCanvasThenApply}
                  className="btn-breeze-orange flex-1 justify-center px-4 py-3 rounded-2xl"
                >
                  保存到个人设计并继续
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={handleDiscardDirtyCanvasThenApply}
                  className="btn-secondary flex-1 justify-center px-4 py-3 rounded-2xl"
                >
                  直接覆盖
                </button>
              </div>
              <button
                onClick={closeApplyTemplateModal}
                className="btn-flat-neutral w-full justify-center px-4 py-3 rounded-2xl"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

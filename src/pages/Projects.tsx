import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Clock, Trash2, Folder, Share2, X, ArrowRight, PackagePlus, Sparkles, Pencil, Download, Check, Users, ChevronDown, Search } from 'lucide-react';
import { Project, SpaceImageRecord, useProject } from '../context/ProjectContext';
import clsx from 'clsx';
import CreateCanvasModal from '../components/CreateCanvasModal';
import { useToast } from '../components/ToastProvider';
import { createP2PShareRecord, makeTemplateElements, resolveP2PShareRecord, type P2PShareRecord } from '../utils/p2pShare';

type SpaceView = 'projects' | 'favorites' | 'gen-assets' | 'edit-assets' | 'export-assets' | 'p2p' | 'teams';

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
const TEAMS_STORAGE_KEY = 'trae_deepcanvas_teams_v1';
const CURRENT_OA_STORAGE_KEY = 'trae_deepcanvas_current_oa_v1';
const TEAM_MEMBERS_PAGE_SIZE = 10;

type AssetAuditRecord = {
  xiaobao: boolean;
  experience: boolean;
};

type TeamRecord = {
  id: string;
  name: string;
  admins: string[];
  members: string[];
  createdAt: number;
  updatedAt: number;
};

type OaDirectoryRecord = {
  name: string;
  oa: string;
};

const MOCK_OA_DIRECTORY: OaDirectoryRecord[] = [
  { name: '大壮', oa: 'dazhuang' },
  { name: '小壮', oa: 'xiaozhuang' },
  { name: '壮壮', oa: 'zz' },
  { name: '大壮', oa: 'da.z' },
  { name: '测试', oa: 'test'},
  { name: '小红', oa: 'littlered'},
  { name: '小红', oa: 'little.r'}
];

function normalizeDirectoryQuery(value: string) {
  return value.trim().toLowerCase();
}

function isSubsequence(needle: string, haystack: string) {
  if (!needle) return true;
  let i = 0;
  for (let j = 0; j < haystack.length && i < needle.length; j += 1) {
    if (haystack[j] === needle[i]) i += 1;
  }
  return i === needle.length;
}

function computeDirectoryScore(query: string, record: OaDirectoryRecord) {
  const q = normalizeDirectoryQuery(query);
  if (!q) return 0;
  const oa = record.oa.toLowerCase();
  const name = record.name.toLowerCase();
  if (q === oa || q === name) return 100;
  if (oa.startsWith(q) || name.startsWith(q)) return 85;
  if (oa.includes(q) || name.includes(q)) return 70;
  if (isSubsequence(q, oa)) return 45;
  return 0;
}

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

function normalizeOaName(value: string) {
  return value.trim();
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
  const [currentOaName, setCurrentOaName] = useState(() => {
    const stored = localStorage.getItem(CURRENT_OA_STORAGE_KEY);
    return stored?.trim() ? stored : 'zenghuayue';
  });
  const [teams, setTeams] = useState<TeamRecord[]>(() => {
    const parsed = safeParseJson<TeamRecord[]>(localStorage.getItem(TEAMS_STORAGE_KEY), []);
    return Array.isArray(parsed) ? parsed : [];
  });
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [teamNameDraft, setTeamNameDraft] = useState('');
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [armedDeleteTeamId, setArmedDeleteTeamId] = useState<string | null>(null);
  const [newTeamMemberInput, setNewTeamMemberInput] = useState('');
  const [newTeamMemberRole, setNewTeamMemberRole] = useState<'member' | 'admin'>('member');
  const [newTeamExtraMembers, setNewTeamExtraMembers] = useState<string[]>([]);
  const [newTeamExtraAdmins, setNewTeamExtraAdmins] = useState<string[]>([]);
  const [teamMembersPage, setTeamMembersPage] = useState(1);
  const [isTeamSwitcherOpen, setIsTeamSwitcherOpen] = useState(false);
  const [teamSwitcherQuery, setTeamSwitcherQuery] = useState('');
  const teamSwitcherRef = useRef<HTMLDivElement>(null);

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

  const selectedTeam = useMemo(() => {
    if (!selectedTeamId) return null;
    return teams.find((team) => team.id === selectedTeamId) ?? null;
  }, [teams, selectedTeamId]);

  const selectedTeamMemberCount = useMemo(() => {
    if (!selectedTeam) return 0;
    return new Set([...selectedTeam.admins, ...selectedTeam.members]).size;
  }, [selectedTeam]);

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
    } else if (moduleParam === 'teams') {
      setView('teams');
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
    } else if (view === 'teams') {
      nextModule = 'teams';
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

  useEffect(() => {
    localStorage.setItem(CURRENT_OA_STORAGE_KEY, currentOaName.trim() ? currentOaName.trim() : 'zenghuayue');
  }, [currentOaName]);

  useEffect(() => {
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    if (!isTeamSwitcherOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (teamSwitcherRef.current && !teamSwitcherRef.current.contains(event.target as Node)) {
        setIsTeamSwitcherOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTeamSwitcherOpen]);

  useEffect(() => {
    if (selectedTeamId) return;
    if (teams.length === 0) return;
    setSelectedTeamId(teams[0].id);
  }, [teams, selectedTeamId]);

  useEffect(() => {
    if (!selectedTeam) return;
    setTeamNameDraft(selectedTeam.name);
    setArmedDeleteTeamId(null);
    setIsCreateTeamOpen(false);
    setIsEditingTeamName(false);
  }, [selectedTeam]);

  useEffect(() => {
    setTeamMembersPage(1);
  }, [selectedTeamId]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(selectedTeamMemberCount / TEAM_MEMBERS_PAGE_SIZE));
    if (teamMembersPage <= totalPages) return;
    setTeamMembersPage(totalPages);
  }, [selectedTeamMemberCount, teamMembersPage]);

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

  const [userLookupInput, setUserLookupInput] = useState('');
  const [newUserRole, setNewUserRole] = useState<'member' | 'admin'>('member');
  const [isUserLookupOpen, setIsUserLookupOpen] = useState(false);
  const userLookupRef = useRef<HTMLDivElement>(null);
  const userLookupDropdownRef = useRef<HTMLDivElement>(null);
  const [userLookupAnchor, setUserLookupAnchor] = useState<null | { top: number; right: number }>(null);

  const updateUserLookupAnchor = () => {
    const rect = userLookupRef.current?.getBoundingClientRect();
    if (!rect) return;
    setUserLookupAnchor({ top: rect.top, right: rect.right });
  };

  useEffect(() => {
    if (!isUserLookupOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (userLookupRef.current && userLookupRef.current.contains(target)) return;
      if (userLookupDropdownRef.current && userLookupDropdownRef.current.contains(target)) return;
      {
        setIsUserLookupOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    updateUserLookupAnchor();
    function handleRelayout() {
      updateUserLookupAnchor();
    }
    window.addEventListener('resize', handleRelayout);
    window.addEventListener('scroll', handleRelayout, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleRelayout);
      window.removeEventListener('scroll', handleRelayout, true);
    };
  }, [isUserLookupOpen]);

  const renderTeamsModule = () => {
    const normalizedOa = normalizeOaName(currentOaName);
    const visibleTeams = normalizedOa
      ? teams.filter((team) => team.admins.includes(normalizedOa) || team.members.includes(normalizedOa))
      : teams;
    const normalizedQuery = teamSwitcherQuery.trim().toLowerCase();
    const switcherTeams = normalizedQuery
      ? visibleTeams.filter((team) => team.name.toLowerCase().includes(normalizedQuery) || team.id.toLowerCase().includes(normalizedQuery))
      : visibleTeams;
    const managedTeams = normalizedOa ? switcherTeams.filter((team) => team.admins.includes(normalizedOa)) : switcherTeams;
    const joinedTeams = normalizedOa
      ? switcherTeams.filter((team) => !team.admins.includes(normalizedOa) && team.members.includes(normalizedOa))
      : [];
    const activeTeam = selectedTeam && (teams.find((t) => t.id === selectedTeam.id) ?? null);
    const canManage = !!(normalizedOa && activeTeam && activeTeam.admins.includes(normalizedOa));
    const teamToDelete = armedDeleteTeamId ? teams.find((team) => team.id === armedDeleteTeamId) ?? null : null;

    const commitTeamUpdate = (teamId: string, updater: (prev: TeamRecord) => TeamRecord) => {
      setTeams((prev) =>
        prev.map((team) => {
          if (team.id !== teamId) return team;
          const next = updater(team);
          return { ...next, updatedAt: Date.now() };
        })
      );
    };

    const createTeam = () => {
      const name = newTeamName.trim();
      if (!name) {
        toast.show('请输入团队名称');
        return;
      }
      const oa = normalizeOaName(currentOaName);
      if (!oa) {
        toast.show('请先填写当前 OA');
        return;
      }
      const now = Date.now();
      const id = `team-${now}`;

      const baseAdmins = [oa];
      const baseMembers = [oa];

      const extraMemberSet = new Set(newTeamExtraMembers);
      const extraAdminSet = new Set(newTeamExtraAdmins);

      const members = Array.from(new Set([...baseMembers, ...extraMemberSet]));
      const admins = Array.from(new Set([...baseAdmins, ...extraAdminSet]));

      const next: TeamRecord = {
        id,
        name,
        admins,
        members,
        createdAt: now,
        updatedAt: now,
      };

      setTeams((prev) => [next, ...prev]);
      setSelectedTeamId(id);
      setNewTeamName('');
      setNewTeamExtraMembers([]);
      setNewTeamExtraAdmins([]);
      setNewTeamMemberInput('');
      setNewTeamMemberRole('member');
      setIsCreateTeamOpen(false);
      toast.show('已创建团队');
    };

    const renameTeam = (teamId: string) => {
      const name = teamNameDraft.trim();
      if (!name) {
        toast.show('团队名称不能为空');
        return;
      }
      commitTeamUpdate(teamId, (prev) => ({ ...prev, name }));
      toast.show('已更新团队名称');
    };

    const deleteTeam = (teamId: string) => {
      setTeams((prevTeams) => {
        const nextTeams = prevTeams.filter((team) => team.id !== teamId);
        setSelectedTeamId((prevSelected) => {
          if (prevSelected !== teamId) return prevSelected;
          return nextTeams.length > 0 ? nextTeams[0].id : null;
        });
        return nextTeams;
      });
      toast.show('已删除团队');
    };

    const changeUserRole = (teamId: string, oa: string, newRole: 'admin' | 'member') => {
      commitTeamUpdate(teamId, (prev) => {
        let nextAdmins = [...prev.admins];
        const nextMembers = [...prev.members];

        if (newRole === 'admin') {
          if (!nextAdmins.includes(oa)) nextAdmins.push(oa);
          if (!nextMembers.includes(oa)) nextMembers.push(oa);
        } else {
          if (nextAdmins.includes(oa)) {
            nextAdmins = nextAdmins.filter((a) => a !== oa);
          }
          if (!nextMembers.includes(oa)) nextMembers.push(oa);
        }

        if (nextAdmins.length === 0) {
          toast.show('团队至少需要一名管理员');
          return prev;
        }
        return { ...prev, admins: nextAdmins, members: nextMembers };
      });
    };

    const removeUser = (teamId: string, oa: string) => {
      commitTeamUpdate(teamId, (prev) => {
        const nextAdmins = prev.admins.filter((a) => a !== oa);
        const nextMembers = prev.members.filter((m) => m !== oa);
        if (prev.admins.includes(oa) && nextAdmins.length === 0) {
          toast.show('无法移除最后一名管理员');
          return prev;
        }
        return { ...prev, admins: nextAdmins, members: nextMembers };
      });
    };

    const resolveDirectoryRecord = (input: string) => {
      const raw = input.trim();
      if (!raw) return null;
      const normalized = normalizeDirectoryQuery(raw);
      const byOa = MOCK_OA_DIRECTORY.find((record) => record.oa.toLowerCase() === normalized);
      if (byOa) return byOa;
      const byName = MOCK_OA_DIRECTORY.find((record) => record.name === raw);
      if (byName) return byName;
      return null;
    };

    const addNewTeamMember = () => {
      const record = resolveDirectoryRecord(newTeamMemberInput);
      if (!record) {
        toast.show('添加失败，用户不存在');
        return;
      }
      const oa = record.oa;
      setNewTeamExtraMembers((prev) => (prev.includes(oa) ? prev : [...prev, oa]));
      if (newTeamMemberRole === 'admin') {
        setNewTeamExtraAdmins((prev) => (prev.includes(oa) ? prev : [...prev, oa]));
      }
      setNewTeamMemberInput('');
      setNewTeamMemberRole('member');
    };

    const addUser = (teamId: string) => {
      const record = resolveDirectoryRecord(userLookupInput);
      if (!record) {
        toast.show('添加失败，用户不存在');
        return;
      }
      const oa = record.oa;
      commitTeamUpdate(teamId, (prev) => {
        const nextMembers = prev.members.includes(oa) ? prev.members : [...prev.members, oa];
        const nextAdmins = prev.admins.includes(oa) ? prev.admins : (newUserRole === 'admin' ? [...prev.admins, oa] : prev.admins);
        return { ...prev, members: nextMembers, admins: nextAdmins };
      });
      setUserLookupInput('');
      setNewUserRole('member');
    };

    const allUsers = activeTeam ? Array.from(new Set([...activeTeam.admins, ...activeTeam.members])) : [];
    const directoryByOa = new Map(MOCK_OA_DIRECTORY.map((record) => [record.oa, record.name]));
    const directoryCandidates = (() => {
      const scored = MOCK_OA_DIRECTORY.map((record) => ({
        ...record,
        score: computeDirectoryScore(userLookupInput, record),
      }));
      if (!userLookupInput.trim()) {
        return scored.sort((a, b) => a.oa.localeCompare(b.oa));
      }
      return scored.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.oa.localeCompare(b.oa);
      });
    })();
    const isTeamNameDirty = !!(activeTeam && canManage && teamNameDraft.trim() !== activeTeam.name);
    const isTeamNameValid = !!teamNameDraft.trim();
    const memberTotalPages = Math.max(1, Math.ceil(allUsers.length / TEAM_MEMBERS_PAGE_SIZE));
    const memberPage = Math.min(teamMembersPage, memberTotalPages);
    const memberSliceStart = (memberPage - 1) * TEAM_MEMBERS_PAGE_SIZE;
    const memberSliceEnd = memberSliceStart + TEAM_MEMBERS_PAGE_SIZE;
    const pagedUsers = allUsers.slice(memberSliceStart, memberSliceEnd);

    return (
      <div className="max-w-7xl mx-auto py-2 px-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              {currentOaName[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">当前登录身份 (模拟)</div>
              <input
                value={currentOaName}
                onChange={(e) => setCurrentOaName(e.target.value)}
                placeholder="输入你的 OA"
                className="text-sm font-bold text-gray-900 bg-transparent border-none p-0 focus:ring-0 w-32 placeholder:text-gray-300 outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-3 w-full md:w-auto relative" ref={teamSwitcherRef}>
              <div className="relative flex-1 md:w-64">
              <button
                type="button"
                onClick={() => setIsTeamSwitcherOpen((prev) => !prev)}
                className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-semibold text-gray-900 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-black/5"
              >
                <span className="truncate">{activeTeam ? activeTeam.name : '选择团队...'}</span>
                <ChevronDown size={16} className={clsx('text-gray-400 shrink-0 transition-transform', isTeamSwitcherOpen && 'rotate-180')} />
              </button>

              {isTeamSwitcherOpen && (
                <div className="absolute right-0 top-full mt-2 w-full md:w-80 bg-white rounded-2xl shadow-xl border border-black/10 overflow-hidden z-50">
                  <div className="p-3 border-b border-black/5 space-y-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={teamSwitcherQuery}
                        onChange={(e) => setTeamSwitcherQuery(e.target.value)}
                        placeholder="搜索团队"
                        className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                      />
                    </div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-2 space-y-2">
                    {managedTeams.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-2 py-1 text-[11px] font-bold text-gray-500">我管理的</div>
                        {managedTeams.map((team) => (
                          <button
                            key={team.id}
                            onClick={() => {
                              setSelectedTeamId(team.id);
                              setIsTeamSwitcherOpen(false);
                            }}
                            className={clsx(
                              "w-full text-left rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors flex items-center justify-between",
                              selectedTeamId === team.id && "bg-gray-50 text-blue-600 font-medium"
                            )}
                          >
                            <span className="truncate text-sm">{team.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {joinedTeams.length > 0 && (
                      <div className="space-y-1">
                        <div className="px-2 py-1 text-[11px] font-bold text-gray-500">我加入的</div>
                        {joinedTeams.map((team) => (
                          <button
                            key={team.id}
                            onClick={() => {
                              setSelectedTeamId(team.id);
                              setIsTeamSwitcherOpen(false);
                            }}
                            className={clsx(
                              "w-full text-left rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors",
                              selectedTeamId === team.id && "bg-gray-50 text-blue-600 font-medium"
                            )}
                          >
                            <span className="truncate text-sm">{team.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {switcherTeams.length === 0 && (
                      <div className="py-6 text-center text-sm text-gray-400">没有匹配的团队</div>
                    )}
                  </div>
                </div>
              )}
            </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreateTeamOpen((prev) => !prev);
                  setTeamSwitcherQuery('');
                }}
                className={clsx(
                  'h-10 px-4 rounded-xl text-sm font-medium transition-colors shrink-0 border',
                  isCreateTeamOpen ? 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800' : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
                )}
              >
                新建团队
              </button>
            </div>
          </div>
        </div>

        {isCreateTeamOpen ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-black/5">
                  <h3 className="text-base font-semibold text-gray-900">新建团队</h3>
                  <p className="text-xs text-gray-500 mt-1">填写团队基础信息，并添加团队成员</p>
                </div>
                <div className="p-5 space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-700">团队名称</label>
                    <input
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="请输入团队名称"
                      className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-gray-700">添加成员（可选）</label>
                      <span className="text-[11px] text-gray-400">当前登录账号会自动作为管理员加入</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        value={newTeamMemberInput}
                        onChange={(e) => setNewTeamMemberInput(e.target.value)}
                        placeholder="姓名或 OA"
                        className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addNewTeamMember();
                          }
                          if (e.key === 'Escape') {
                            setNewTeamMemberInput('');
                          }
                        }}
                      />
                      <div className="flex items-center gap-2 sm:w-auto">
                        <select
                          value={newTeamMemberRole}
                          onChange={(e) => setNewTeamMemberRole(e.target.value as 'admin' | 'member')}
                          className="h-10 pl-2 pr-8 appearance-none rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/5"
                        >
                          <option value="member">成员</option>
                          <option value="admin">管理员</option>
                        </select>
                        <button
                          type="button"
                          onClick={addNewTeamMember}
                          className="h-10 px-4 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors shrink-0"
                        >
                          添加
                        </button>
                      </div>
                    </div>

                    {newTeamExtraMembers.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {newTeamExtraMembers.map((oa) => {
                          const name = directoryByOa.get(oa) ?? oa;
                          const isAdmin = newTeamExtraAdmins.includes(oa);
                          return (
                            <span
                              key={oa}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                            >
                              <span className="font-medium">{name}</span>
                              <span className="text-[10px] text-gray-400">{oa}</span>
                              {isAdmin && (
                                <span className="ml-1 rounded-full bg-purple-100 text-purple-700 px-1.5 py-0.5 text-[10px]">
                                  管理员
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setNewTeamExtraMembers((prev) => prev.filter((id) => id !== oa));
                                  setNewTeamExtraAdmins((prev) => prev.filter((id) => id !== oa));
                                }}
                                className="ml-1 text-gray-400 hover:text-red-500"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateTeamOpen(false);
                        setNewTeamName('');
                        setNewTeamMemberInput('');
                        setNewTeamMemberRole('member');
                        setNewTeamExtraMembers([]);
                        setNewTeamExtraAdmins([]);
                      }}
                      className="h-9 px-4 rounded-xl bg-white text-gray-700 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={createTeam}
                      className="h-9 px-4 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      创建团队
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-black/5">
                  <h3 className="text-base font-semibold text-gray-900">已有团队</h3>
                  <p className="text-xs text-gray-500 mt-1">查看你当前管理或加入的团队</p>
                </div>
                <div className="p-4 space-y-2 max-h-[420px] overflow-y-auto">
                  {visibleTeams.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400">暂无团队</div>
                  ) : (
                    visibleTeams.map((team) => (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => {
                          setSelectedTeamId(team.id);
                          setIsCreateTeamOpen(false);
                        }}
                        className={clsx(
                          'w-full text-left px-3 py-2 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-between gap-2',
                          selectedTeamId === team.id && 'border-gray-300 bg-gray-50'
                        )}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{team.name}</div>
                          <div className="mt-0.5 text-[11px] text-gray-400">
                            管理员 {team.admins.length} · 成员 {new Set([...team.admins, ...team.members]).size}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : !activeTeam ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-black/5 border-dashed">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Users size={24} className="text-gray-400" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">未选择团队</h3>
            <p className="text-sm text-gray-500">请在上方选择一个团队，或创建一个新团队</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-black/5">
                  <h3 className="text-base font-semibold text-gray-900">团队设置</h3>
                  <p className="text-xs text-gray-500 mt-1">管理团队基本信息</p>
                </div>
                <div className="p-5 space-y-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-gray-700">团队名称</label>
                    {activeTeam && (
                      <>
                        <div className="flex items-center gap-2">
                          {isEditingTeamName ? (
                            <>
                              <input
                                value={teamNameDraft}
                                onChange={(e) => setTeamNameDraft(e.target.value)}
                                disabled={!canManage}
                                className="flex-1 h-10 px-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5 disabled:opacity-60"
                                onKeyDown={(e) => {
                                  if (!activeTeam || !canManage) return;
                                  if (e.key === 'Enter') {
                                    renameTeam(activeTeam.id);
                                    setIsEditingTeamName(false);
                                  }
                                  if (e.key === 'Escape') {
                                    setTeamNameDraft(activeTeam.name);
                                    setIsEditingTeamName(false);
                                  }
                                }}
                              />
                              {canManage && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTeamNameDraft(activeTeam.name);
                                      setIsEditingTeamName(false);
                                    }}
                                    className="h-10 px-4 rounded-xl bg-white text-gray-700 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                                  >
                                    取消
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      renameTeam(activeTeam.id);
                                      setIsEditingTeamName(false);
                                    }}
                                    disabled={!isTeamNameDirty || !isTeamNameValid}
                                    className="h-10 px-4 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:hover:bg-gray-900"
                                  >
                                    保存
                                  </button>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">{activeTeam.name}</div>
                              </div>
                              {canManage && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTeamNameDraft(activeTeam.name);
                                    setIsEditingTeamName(true);
                                  }}
                                  className="h-9 px-3 rounded-xl bg-white text-gray-700 text-xs font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                  编辑
                                </button>
                              )}
                            </>
                          )}
                        </div>
                        {canManage && isTeamNameDirty && isEditingTeamName && (
                          <div className="text-[11px] text-gray-400">名称已修改，记得保存</div>
                        )}
                      </>
                    )}
                  </div>

                  {canManage && (
                    <div className="rounded-2xl border border-red-100 bg-red-50/40 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-red-900">危险操作</div>
                          <div className="mt-1 text-xs text-red-700/80">删除团队后不可恢复，请谨慎操作</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => activeTeam && setArmedDeleteTeamId(activeTeam.id)}
                          className="h-9 px-3 rounded-xl bg-white text-red-700 text-sm font-medium border border-red-200 hover:bg-red-50 transition-colors shrink-0"
                        >
                          删除团队
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
                <div className="p-5 border-b border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      团队成员
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">{allUsers.length}</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">管理团队成员及权限角色</p>
                  </div>
                  {canManage && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 w-full sm:w-auto">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div ref={userLookupRef} className="relative flex-1 sm:w-48">
                          <input
                            value={userLookupInput}
                            onChange={(e) => {
                              setUserLookupInput(e.target.value);
                              setIsUserLookupOpen(true);
                              updateUserLookupAnchor();
                            }}
                            onFocus={() => {
                              setIsUserLookupOpen(true);
                              updateUserLookupAnchor();
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') setIsUserLookupOpen(false);
                            }}
                            placeholder="姓名或 OA"
                            className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                          />

                          {isUserLookupOpen && (
                            <div
                              ref={userLookupDropdownRef}
                              className="fixed w-72 rounded-2xl border border-black/10 bg-white shadow-xl overflow-hidden z-[9999]"
                              style={
                                userLookupAnchor
                                  ? {
                                      right: Math.max(8, window.innerWidth - userLookupAnchor.right),
                                      bottom: Math.max(8, window.innerHeight - userLookupAnchor.top + 8),
                                    }
                                  : undefined
                              }
                            >
                              <div className="max-h-60 overflow-y-auto py-1">
                                {directoryCandidates.map((record, index) => {
                                  const isTop = !!userLookupInput.trim() && index === 0 && record.score > 0;
                                  const isExact =
                                    !!userLookupInput.trim() &&
                                    (normalizeDirectoryQuery(userLookupInput) === record.oa.toLowerCase() || userLookupInput.trim() === record.name);
                                  return (
                                    <button
                                      key={`${record.oa}-${record.name}`}
                                      type="button"
                                      onMouseDown={(event) => event.preventDefault()}
                                      onClick={() => {
                                        setUserLookupInput(record.oa);
                                        setIsUserLookupOpen(false);
                                      }}
                                      className={clsx(
                                        'w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors',
                                        isTop && 'bg-blue-50',
                                        isExact && 'bg-gray-50'
                                      )}
                                    >
                                      <span className="font-medium text-gray-900 truncate">{record.name}</span>
                                      <span className="text-xs text-gray-500 truncate">{record.oa}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                        <select
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'member')}
                          className="h-9 pl-2 pr-8 appearance-none rounded-lg border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/5"
                        >
                          <option value="member">成员</option>
                          <option value="admin">管理员</option>
                        </select>
                        <button
                          onClick={() => addUser(activeTeam.id)}
                          className="h-9 px-3 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
                        >
                          添加
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50/50 text-gray-500 border-b border-black/5">
                      <tr>
                        <th className="px-6 py-2 font-medium">姓名</th>
                        <th className="px-6 py-2 font-medium">OA账号</th>
                        <th className="px-6 py-2 font-medium">角色</th>
                        <th className="px-6 py-2 font-medium text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pagedUsers.map((oa) => {
                        const isAdmin = activeTeam.admins.includes(oa);
                        const isCurrentUser = oa === normalizedOa;
                        const displayName = directoryByOa.get(oa) ?? '-';
                        return (
                          <tr key={oa} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-2">
                              <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border border-black/5 flex items-center justify-center font-semibold text-gray-600 text-xs">
                                  {(displayName !== '-' ? displayName[0] : oa[0])?.toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 flex items-center gap-2">
                                    {displayName}
                                    {isCurrentUser && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded font-bold uppercase tracking-wider">You</span>}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-2">
                              <div className="font-medium text-gray-900">{oa}</div>
                            </td>
                            <td className="px-6 py-2">
                              {canManage ? (
                                <select
                                  value={isAdmin ? 'admin' : 'member'}
                                  onChange={(e) => changeUserRole(activeTeam.id, oa, e.target.value as 'admin' | 'member')}
                                  className="h-7 pl-2 pr-8 py-0 appearance-none rounded-lg border-transparent hover:border-gray-200 bg-transparent hover:bg-white text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-black/5 cursor-pointer transition-all"
                                >
                                  <option value="admin">管理员</option>
                                  <option value="member">成员</option>
                                </select>
                              ) : (
                                <span className={clsx("px-2.5 py-1 rounded-full text-xs font-medium", isAdmin ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-600")}>
                                  {isAdmin ? '管理员' : '成员'}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-2 text-right">
                              {canManage && (
                                <button
                                  onClick={() => removeUser(activeTeam.id, oa)}
                                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="移除成员"
                                >
                                  <X size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-3 border-t border-black/5 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    第 {memberPage} / {memberTotalPages} 页 · 每页 {TEAM_MEMBERS_PAGE_SIZE} 人
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTeamMembersPage((prev) => Math.max(1, prev - 1))}
                      disabled={memberPage <= 1}
                      className="h-8 px-3 rounded-lg bg-white text-gray-700 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:hover:bg-white"
                    >
                      上一页
                    </button>
                    <button
                      type="button"
                      onClick={() => setTeamMembersPage((prev) => Math.min(memberTotalPages, prev + 1))}
                      disabled={memberPage >= memberTotalPages}
                      className="h-8 px-3 rounded-lg bg-white text-gray-700 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:hover:bg-white"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {teamToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setArmedDeleteTeamId(null)}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <Trash2 size={18} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h2 className="text-base font-semibold text-gray-900">删除团队</h2>
                    <p className="text-xs text-gray-500">
                      确认要删除团队
                      <span className="font-semibold text-gray-900">「{teamToDelete.name}」</span>
                      吗？删除后不可恢复，团队成员将无法继续访问该团队及其内容。
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setArmedDeleteTeamId(null)}
                    className="h-9 px-4 rounded-xl bg-white text-gray-700 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteTeam(teamToDelete.id);
                      setArmedDeleteTeamId(null);
                    }}
                    className="h-9 px-4 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    确认删除
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
              <button
                onClick={() => setView('teams')}
                className={clsx(
                  "inline-flex items-center gap-2 py-3 -mb-px text-sm font-semibold border-b-2 transition-colors",
                  view === 'teams'
                    ? "text-gray-700 border-gray-300"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                )}
                aria-selected={view === 'teams'}
              >
                <Users size={16} className={clsx(view === 'teams' ? "opacity-80" : "opacity-50")} />
                我的团队
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
              {space === 'personal' && view === 'teams' && renderTeamsModule()}
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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, Clock, Trash2, Folder, Share2, Heart, X, ArrowRight, PackagePlus, Sparkles, Pencil, Download, Check, Users, ChevronDown, Search } from 'lucide-react';
import { Project, useProject, type PersonalAssetRecord } from '../context/ProjectContext';
import clsx from 'clsx';
import CreateCanvasModal from '../components/CreateCanvasModal';
import { useToast } from '../components/ToastProvider';
import { createP2PShareRecord, makeTemplateElements, resolveP2PShareRecord, type P2PShareRecord } from '../utils/p2pShare';

type SpaceView = 'projects' | 'favorites' | 'assets' | 'p2p' | 'teams';

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

type PublicTemplateDetail = {
  id: string;
  title: string;
  previewUrl: string;
  authorName: string;
  width: number;
  height: number;
  elements: string[];
};

const PUBLIC_PROJECTS_STORAGE_KEY = 'trae_deepcanvas_public_projects_v1';
const PUBLIC_TEMPLATE_FAVORITES_KEY = 'trae_deepcanvas_public_template_favorites_v1';
const PERSONAL_SPACE_TITLE_STORAGE_KEY = 'trae_deepcanvas_personal_space_title_v1';
const TEAMS_STORAGE_KEY = 'trae_deepcanvas_teams_v1';
const CURRENT_OA_STORAGE_KEY = 'trae_deepcanvas_current_oa_v1';
const TEAM_MEMBERS_PAGE_SIZE = 10;

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
      name: '双11 电商大促主视觉',
      width: 1920,
      height: 1080,
      thumbnail: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80',
      elements: [],
      publishedAt: now - 1000 * 60 * 60 * 6,
      authorName: '社区作者A',
    },
    {
      id: 'public-2',
      name: '春节 新品发布长图',
      width: 1080,
      height: 1920,
      thumbnail: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80',
      elements: [],
      publishedAt: now - 1000 * 60 * 60 * 10,
      authorName: '社区作者B',
    },
    {
      id: 'public-3',
      name: '情人节 品牌KV留白版',
      width: 1920,
      height: 1080,
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80',
      elements: [],
      publishedAt: now - 1000 * 60 * 60 * 18,
      authorName: '社区作者C',
    },
    {
      id: 'public-4',
      name: '母亲节 活动海报模板',
      width: 1242,
      height: 2208,
      thumbnail: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1200&q=80',
      elements: [],
      publishedAt: now - 1000 * 60 * 60 * 30,
      authorName: '社区作者D',
    },
    {
      id: 'public-5',
      name: '端午 节日促销海报（国潮）',
      width: 1242,
      height: 2208,
      thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80',
      elements: [],
      publishedAt: now - 1000 * 60 * 60 * 40,
      authorName: '社区作者E',
    },
    {
      id: 'public-6',
      name: '中秋 团圆礼盒 Banner（红金）',
      width: 1920,
      height: 1080,
      thumbnail: 'https://images.unsplash.com/photo-1548625361-9f9392e2133f?w=1200&q=80',
      elements: [],
      publishedAt: now - 1000 * 60 * 60 * 52,
      authorName: '社区作者F',
    },
    {
      id: 'public-7',
      name: '国庆 出游季营销KV（清爽）',
      width: 1920,
      height: 1080,
      thumbnail: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
      elements: [],
      publishedAt: now - 1000 * 60 * 60 * 70,
      authorName: '社区作者G',
    },
    {
      id: 'public-8',
      name: '圣诞 节日氛围海报（雪景）',
      width: 1242,
      height: 2208,
      thumbnail: 'https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=1200&q=80',
      elements: [],
      publishedAt: now - 1000 * 60 * 60 * 90,
      authorName: '社区作者H',
    },
    {
      id: 'public-9',
      name: '元旦 新年倒计时海报（极简）',
      width: 1242,
      height: 2208,
      thumbnail: 'https://images.unsplash.com/photo-1545231097-cbd796f1d95d?w=1200&q=80',
      elements: [],
      publishedAt: now - 1000 * 60 * 60 * 110,
      authorName: '社区作者I',
    },
    {
      id: 'public-10',
      name: '元宵 灯会活动宣传（暖色）',
      width: 1242,
      height: 2208,
      thumbnail: 'https://images.unsplash.com/photo-1516455207990-7a41ce80f7ee?w=1200&q=80',
      elements: [],
      publishedAt: now - 1000 * 60 * 60 * 130,
      authorName: '社区作者J',
    },
    {
      id: 'public-11',
      name: '三八 女神节 会员福利海报',
      width: 1242,
      height: 2208,
      thumbnail: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=1200&q=80',
      elements: [],
      publishedAt: now - 1000 * 60 * 60 * 150,
      authorName: '社区作者K',
    },
    {
      id: 'public-12',
      name: '五一 劳动节 出游攻略长图',
      width: 1080,
      height: 1920,
      thumbnail: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
      elements: [],
      publishedAt: now - 1000 * 60 * 60 * 170,
      authorName: '社区作者L',
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
    personalAssets,
    exportFolders,
    exportFolderByAssetId,
    currentProject,
    isDirty,
    deleteProject,
    createProject,
    updateProject,
    saveProject,
    saveCurrentProjectAsNew,
    createExportFolder,
    renameExportFolder,
    deleteExportFolder,
    moveExportedAssetsToFolder,
  } = useProject();

  const space: SpaceMode = location.pathname.startsWith('/public') ? 'public' : 'personal';
  const [view, setView] = useState<SpaceView>('projects');
  const [favoritesTab, setFavoritesTab] = useState<'inspiration' | 'prompts' | 'templates'>('inspiration');
  const publicTemplateQuery = useMemo(() => {
    if (space !== 'public') return '';
    const params = new URLSearchParams(location.search);
    return params.get('q') || '';
  }, [space, location.search]);
  const [publicSearchDraft, setPublicSearchDraft] = useState('');
  const [publicTemplateElementDraftById, setPublicTemplateElementDraftById] = useState<Record<string, string>>({});
  const [editingPublicTemplateElementId, setEditingPublicTemplateElementId] = useState<string | null>(null);
  const [publicTemplateFavorites, setPublicTemplateFavorites] = useState<Set<string>>(() => {
    const raw = localStorage.getItem(PUBLIC_TEMPLATE_FAVORITES_KEY);
    if (!raw) return new Set();
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return new Set();
      return new Set(parsed.filter((id: any) => typeof id === 'string'));
    } catch {
      return new Set();
    }
  });
  const [activePublicTemplateDetail, setActivePublicTemplateDetail] = useState<PublicTemplateDetail | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isCreateCanvasModalOpen, setIsCreateCanvasModalOpen] = useState(false);
  const [personalSpaceTitle, setPersonalSpaceTitle] = useState(() => {
    const stored = localStorage.getItem(PERSONAL_SPACE_TITLE_STORAGE_KEY);
    return stored?.trim() ? stored : '个人空间';
  });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(personalSpaceTitle);
  const [isTitleHover, setIsTitleHover] = useState(false);
  const [assetsTab, setAssetsTab] = useState<'generated' | 'edited' | 'exported'>('generated');
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [isAssetsSelecting, setIsAssetsSelecting] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(() => new Set());
  const [selectedExportFolderId, setSelectedExportFolderId] = useState<'all' | 'unassigned' | string>('all');
  const [newExportFolderName, setNewExportFolderName] = useState('');
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameFolderDraft, setRenameFolderDraft] = useState('');
  const [draggingAssetId, setDraggingAssetId] = useState<string | null>(null);
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
  const filteredVisibleProjects = useMemo(() => {
    if (space !== 'public') return visibleProjects;
    const normalized = publicTemplateQuery.trim().toLowerCase();
    if (!normalized) return visibleProjects;
    return visibleProjects.filter((p: any) => {
      const name = typeof p?.name === 'string' ? p.name.toLowerCase() : '';
      return name.includes(normalized);
    });
  }, [space, visibleProjects, publicTemplateQuery]);

  useEffect(() => {
    if (space !== 'public') return;
    setPublicSearchDraft(publicTemplateQuery);
  }, [space, publicTemplateQuery]);

  const commitPublicSearch = (value: string) => {
    const next = value.trim();
    if (!next) {
      navigate('/public?module=projects');
      return;
    }
    navigate(`/public?module=projects&q=${encodeURIComponent(next)}`);
  };

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
      if (assetParam === 'edit') setAssetsTab('edited');
      else if (assetParam === 'export') setAssetsTab('exported');
      else setAssetsTab('generated');
      setView('assets');
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
      assetParam = assetsTab === 'edited' ? 'edit' : assetsTab === 'exported' ? 'export' : 'gen';
      params.set('asset', assetParam);
      params.delete('fav');
    }
    params.set('module', nextModule || 'projects');
    const nextSearch = params.toString();
    const currentSearch = location.search.replace(/^\?/, '');
    if (nextSearch !== currentSearch) {
      navigate({ pathname: location.pathname, search: nextSearch }, { replace: false });
    }
  }, [view, favoritesTab, assetsTab]);

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

  const doToast = (message: string) => toast.show(message);

  useEffect(() => {
    if (view !== 'assets') {
      setIsAssetsSelecting(false);
      setSelectedAssetIds(new Set());
    }
  }, [view]);

  useEffect(() => {
    setIsAssetsSelecting(false);
    setSelectedAssetIds(new Set());
    setDraggingAssetId(null);
  }, [assetsTab, selectedExportFolderId]);

  const persistPersonalSpaceTitle = (nextTitle: string) => {
    const normalized = nextTitle.trim() ? nextTitle.trim() : '个人空间';
    setPersonalSpaceTitle(normalized);
    setTitleDraft(normalized);
    localStorage.setItem(PERSONAL_SPACE_TITLE_STORAGE_KEY, normalized);
    doToast('标题已更新');
  };
  const shareTargetProject = useMemo(() => {
    if (!shareProjectId) return null;
    return projects.find(p => p.id === shareProjectId) || null;
  }, [projects, shareProjectId]);

  const generatedAssetItems = useMemo(() => {
    return personalAssets.filter((a) => a.kind === 'generated');
  }, [personalAssets]);

  const editedAssetItems = useMemo(() => {
    return personalAssets.filter((a) => a.kind === 'edited');
  }, [personalAssets]);

  const exportedAssetItems = useMemo(() => {
    return personalAssets.filter((a) => a.kind === 'exported');
  }, [personalAssets]);

  const toggleAssetsSelecting = () => {
    setIsAssetsSelecting((prev) => {
      const next = !prev;
      if (!next) setSelectedAssetIds(new Set());
      return next;
    });
  };

  const toggleAssetSelected = (assetId: string) => {
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(assetId)) next.delete(assetId);
      else next.add(assetId);
      return next;
    });
  };

  const createFolderFromDraft = () => {
    const folder = createExportFolder(newExportFolderName);
    setNewExportFolderName('');
    setSelectedExportFolderId(folder.id);
  };

  const commitRenameFolder = () => {
    if (!renamingFolderId) return;
    renameExportFolder(renamingFolderId, renameFolderDraft);
    setRenamingFolderId(null);
    setRenameFolderDraft('');
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
    const path = `/editor?projectId=${encodeURIComponent(id)}`;
    const url = `${window.location.origin}${import.meta.env.BASE_URL}#${path}`;
    window.open(url, '_blank', 'noopener,noreferrer');
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
    const id = crypto.randomUUID();
    const name = `${publicProject.name}（同款）`;
    const popup = window.open('about:blank', '_blank', 'noopener,noreferrer');
    createProject(publicProject.width, publicProject.height, name, {
      id,
      elements: publicProject.elements || [],
      thumbnail: publicProject.thumbnail,
      sourceType: publicProject.sourceType,
      aiResizeBinding: publicProject.aiResizeBinding,
    });
    requestAnimationFrame(() => {
      saveProject();
      const path = `/editor?projectId=${encodeURIComponent(id)}`;
      const url = `${window.location.origin}${import.meta.env.BASE_URL}#${path}`;
      if (popup) popup.location.href = url;
      else window.open(url, '_blank', 'noopener,noreferrer');
    });
  };

  const doSameFromPreview = (title: string, previewUrl: string, width: number, height: number) => {
    if (projects.length >= 5) {
      doToast('已达到个人文件数量上限 (5个)');
      return;
    }
    const id = crypto.randomUUID();
    const name = title.trim() ? `${title}（同款）` : '同款设计';
    const popup = window.open('about:blank', '_blank', 'noopener,noreferrer');
    createProject(width, height, name, {
      id,
      elements: makeTemplateElements(previewUrl, width, height),
      thumbnail: previewUrl,
      sourceType: 'manual',
    });
    requestAnimationFrame(() => {
      saveProject();
      const path = `/editor?projectId=${encodeURIComponent(id)}`;
      const url = `${window.location.origin}${import.meta.env.BASE_URL}#${path}`;
      if (popup) popup.location.href = url;
      else window.open(url, '_blank', 'noopener,noreferrer');
    });
  };

  const openPublicCanvasFromTemplate = (detail: PublicTemplateDetail) => {
    const params = new URLSearchParams();
    params.set('src', detail.previewUrl);
    params.set('name', detail.title);
    params.set('id', detail.id);
    params.set('q', detail.title);
    const path = `/public-canvas?${params.toString()}`;
    const url = `${window.location.origin}${import.meta.env.BASE_URL}#${path}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const togglePublicTemplateFavorite = (templateId: string) => {
    setPublicTemplateFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(templateId)) next.delete(templateId);
      else next.add(templateId);
      localStorage.setItem(PUBLIC_TEMPLATE_FAVORITES_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const sharePublicTemplate = async (detail: PublicTemplateDetail) => {
    const record = createP2PShareRecord({
      kind: 'public_template',
      payload: {
        title: detail.title,
        previewImageUrl: detail.previewUrl,
        width: detail.width,
        height: detail.height,
        elements: makeTemplateElements(detail.previewUrl, detail.width, detail.height),
        sourceLabel: '公共模板',
      },
    });
    try {
      await navigator.clipboard.writeText(record.code);
      doToast('口令已复制到剪切板');
    } catch {
      doToast('口令已复制到剪切板');
    }
  };

  const closePublicTemplateDetail = () => setActivePublicTemplateDetail(null);

  const renderProjectsView = () => {
    const projectsToRender = space === 'public' ? filteredVisibleProjects : visibleProjects;

    if (projectsToRender.length === 0 && space === 'public') {
      const q = publicTemplateQuery.trim();
      if (q) {
        const buildMockSvgDataUrl = (seed: string, title: string) => {
          const safeTitle = title.replace(/[<>&"]/g, '');
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#8F7AFB" stop-opacity="0.94"/>
      <stop offset="1" stop-color="#111827" stop-opacity="0.92"/>
    </linearGradient>
    <filter id="n" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" seed="${seed}"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.10 0"/>
    </filter>
  </defs>
  <rect width="900" height="1200" fill="url(#g)"/>
  <rect width="900" height="1200" filter="url(#n)" opacity="0.55"/>
  <rect x="44" y="54" width="812" height="108" rx="28" fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.22)"/>
  <text x="84" y="126" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI" font-size="42" font-weight="900" fill="white">${safeTitle}</text>
  <text x="84" y="192" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI" font-size="22" font-weight="700" fill="rgba(255,255,255,0.78)">Fake 公共模板搜索结果</text>
  </svg>`;
          return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        };

        const fakeResults = Array.from({ length: 10 }).map((_, i) => {
          const title = `${q} 模板 ${i + 1}`;
          const id = `fake-public-${q}-${i + 1}`;
          const previewUrl = buildMockSvgDataUrl(`${q}-${i + 1}`, title);
          const elements = ['元素：小狗'];
          return { id, title, previewUrl, elements };
        });

        return (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 transition-all duration-300">
            {fakeResults.map((item) => {
              const detail: PublicTemplateDetail = {
                id: item.id,
                title: item.title,
                previewUrl: item.previewUrl,
                authorName: '社区作者',
                width: 1080,
                height: 1920,
                elements: item.elements,
              };
              return (
                <div key={item.id} className="group flex flex-col gap-2 cursor-pointer" onClick={() => setActivePublicTemplateDetail(detail)}>
                  <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-100 border border-gray-100 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                    <img src={item.previewUrl} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPublicCanvasFromTemplate(detail);
                        }}
                        className="pointer-events-auto px-4 py-2 rounded-full bg-white text-gray-900 text-sm font-semibold shadow-lg"
                        aria-label="使用该模板"
                      >
                        使用该模板
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      }
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <h3 className="text-lg font-semibold text-gray-900">公共空间暂无作品</h3>
          <p className="text-sm text-gray-500 max-w-sm mt-2">
            先在个人空间把设计发布到公共空间，这里会展示社区作品。
          </p>
        </div>
      );
    }

    const renderPublicTemplateCard = (project: any) => {
      const title = typeof project?.name === 'string' && project.name.trim() ? project.name.trim() : '公共模板';
      const previewUrl = typeof project?.thumbnail === 'string' ? project.thumbnail : '';
      const authorName = typeof project?.authorName === 'string' && project.authorName.trim() ? project.authorName.trim() : '社区作者';
      const width = typeof project?.width === 'number' && project.width > 0 ? project.width : 1080;
      const height = typeof project?.height === 'number' && project.height > 0 ? project.height : 1920;
      const elementChips = ['元素：小狗'];

      const detail: PublicTemplateDetail = {
        id: project.id,
        title,
        previewUrl,
        authorName,
        width,
        height,
        elements: elementChips,
      };

      return (
        <div
          key={project.id}
          className="flex-shrink-0 w-full group cursor-pointer flex flex-col gap-2"
          onClick={() => setActivePublicTemplateDetail(detail)}
        >
          <div className="relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-100 border border-gray-100 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
            {previewUrl ? (
              <img src={previewUrl} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Folder size={32} className="text-gray-300" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openPublicCanvasFromTemplate(detail);
                }}
                className="pointer-events-auto px-4 py-2 rounded-full bg-white text-gray-900 text-sm font-semibold shadow-lg"
                aria-label="使用该模板"
              >
                使用该模板
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 px-1">
            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
              {authorName.trim().slice(0, 1)}
            </div>
            <span className="text-xs text-gray-500 truncate flex-1">{authorName}</span>
          </div>
        </div>
      );
    };

    return (
      <div className={clsx(
        space === 'public'
          ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 transition-all duration-300"
          : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      )}>
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
        {projectsToRender.map((project: any) => (
          space === 'public' ? (
            renderPublicTemplateCard(project)
          ) : (
            <div
              key={project.id}
              onClick={() => {
                handleProjectClick(project.id);
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
                <button
                  onClick={(e) => openShareModal(e, project.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-9 h-9 rounded-full bg-white/85 backdrop-blur border border-black/10 shadow-sm flex items-center justify-center text-gray-700 hover:bg-white"
                  title="分享口令"
                >
                  <Share2 size={16} />
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{project.name}</h3>
                  <button
                    onClick={(e) => handleDelete(e, project.id)}
                    className="p-2 -m-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="删除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                  <Clock size={12} />
                  <span>{new Date(project.lastModified).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )
        ))}
      </div>
    );
  };

  const renderAssetsModule = () => {
    const normalizedQuery = assetSearchQuery.trim().toLowerCase();
    const baseItems =
      assetsTab === 'generated' ? generatedAssetItems : assetsTab === 'edited' ? editedAssetItems : exportedAssetItems;

    const filteredByQuery = baseItems.filter((asset) => {
      if (!normalizedQuery) return true;
      const prompt = asset.prompt ? asset.prompt.toLowerCase() : '';
      const tool = asset.tool ? asset.tool.toLowerCase() : '';
      const url = asset.url.toLowerCase();
      const metaSource = typeof asset.meta?.source === 'string' ? asset.meta.source.toLowerCase() : '';
      return prompt.includes(normalizedQuery) || tool.includes(normalizedQuery) || metaSource.includes(normalizedQuery) || url.includes(normalizedQuery);
    });

    const filteredItems = (() => {
      if (assetsTab !== 'exported') return filteredByQuery;
      if (selectedExportFolderId === 'all') return filteredByQuery;
      if (selectedExportFolderId === 'unassigned') {
        return filteredByQuery.filter((a) => !exportFolderByAssetId[a.id]);
      }
      return filteredByQuery.filter((a) => exportFolderByAssetId[a.id] === selectedExportFolderId);
    })();

    const totalCount =
      assetsTab === 'generated'
        ? generatedAssetItems.length
        : assetsTab === 'edited'
          ? editedAssetItems.length
          : exportedAssetItems.length;

    const selectedCount = selectedAssetIds.size;

    const folderCounts: Record<string, number> = {};
    let unassignedExportCount = 0;
    if (assetsTab === 'exported') {
      exportedAssetItems.forEach((a) => {
        const folderId = exportFolderByAssetId[a.id];
        if (!folderId) {
          unassignedExportCount += 1;
          return;
        }
        folderCounts[folderId] = (folderCounts[folderId] || 0) + 1;
      });
    }

    const renderAssetTitle = (asset: PersonalAssetRecord) => {
      if (asset.kind === 'generated') return asset.prompt?.trim() ? asset.prompt.trim() : '文生图生成';
      if (asset.kind === 'edited') return asset.meta?.tool || asset.tool || '编辑生成';
      return asset.meta?.source || '导出';
    };

    const handleFolderDrop = (folderId: string | null) => (e: React.DragEvent) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData('text/plain');
      if (!draggedId) return;
      const toMove =
        selectedAssetIds.size > 0 && selectedAssetIds.has(draggedId)
          ? Array.from(selectedAssetIds)
          : [draggedId];
      moveExportedAssetsToFolder(toMove, folderId);
      setDraggingAssetId(null);
    };

    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="text-sm font-black text-gray-900">资产</div>
            <div className="text-xs text-gray-500">共 {totalCount} 张</div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={assetSearchQuery}
                onChange={(e) => setAssetSearchQuery(e.target.value)}
                placeholder={assetsTab === 'generated' ? '搜索提示词/URL' : '搜索来源/URL'}
                className="h-9 w-60 pl-9 pr-3 rounded-xl border border-black/10 bg-white text-sm outline-none focus:border-black/25"
              />
            </div>

            <button onClick={toggleAssetsSelecting} className={clsx("btn-flat-neutral", isAssetsSelecting && "bg-gray-50")}>
              {isAssetsSelecting ? '取消' : '选择'}
            </button>

            {isAssetsSelecting && (
              <div className="h-9 px-3 inline-flex items-center rounded-xl border border-black/10 bg-white text-sm font-semibold text-gray-800">
                已选 {selectedCount}
              </div>
            )}
          </div>
        </div>

        <nav className="flex items-center gap-6 border-b border-black/5">
          <button
            onClick={() => setAssetsTab('generated')}
            className={clsx(
              "inline-flex items-center gap-2 py-3 -mb-px text-sm font-semibold border-b-2 transition-colors",
              assetsTab === 'generated' ? "text-gray-700 border-gray-300" : "text-gray-500 border-transparent hover:text-gray-700"
            )}
            aria-selected={assetsTab === 'generated'}
          >
            生图资产
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-black/10 bg-white text-gray-600">{generatedAssetItems.length}</span>
          </button>
          <button
            onClick={() => setAssetsTab('edited')}
            className={clsx(
              "inline-flex items-center gap-2 py-3 -mb-px text-sm font-semibold border-b-2 transition-colors",
              assetsTab === 'edited' ? "text-gray-700 border-gray-300" : "text-gray-500 border-transparent hover:text-gray-700"
            )}
            aria-selected={assetsTab === 'edited'}
          >
            编辑资产
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-black/10 bg-white text-gray-600">{editedAssetItems.length}</span>
          </button>
          <button
            onClick={() => setAssetsTab('exported')}
            className={clsx(
              "inline-flex items-center gap-2 py-3 -mb-px text-sm font-semibold border-b-2 transition-colors",
              assetsTab === 'exported' ? "text-gray-700 border-gray-300" : "text-gray-500 border-transparent hover:text-gray-700"
            )}
            aria-selected={assetsTab === 'exported'}
          >
            导出资产
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-black/10 bg-white text-gray-600">{exportedAssetItems.length}</span>
          </button>
        </nav>

        <div className={clsx(assetsTab === 'exported' && "grid grid-cols-1 lg:grid-cols-12 gap-6")}>
          {assetsTab === 'exported' && (
            <div className="lg:col-span-3 rounded-3xl border border-black/5 bg-white overflow-hidden">
              <div className="p-4 border-b border-black/5">
                <div className="text-xs font-black text-gray-900">文件夹</div>
                <div className="mt-3 flex gap-2">
                  <input
                    value={newExportFolderName}
                    onChange={(e) => setNewExportFolderName(e.target.value)}
                    placeholder="新建文件夹"
                    className="flex-1 h-9 px-3 rounded-xl border border-black/10 bg-white text-sm outline-none focus:border-black/25"
                  />
                  <button
                    onClick={createFolderFromDraft}
                    disabled={!newExportFolderName.trim()}
                    className={clsx("h-9 px-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors", !newExportFolderName.trim() && "opacity-50")}
                  >
                    创建
                  </button>
                </div>
              </div>
              <div className="p-2 space-y-1">
                <button
                  onClick={() => setSelectedExportFolderId('all')}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFolderDrop(null)}
                  className={clsx(
                    "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-2xl text-sm font-semibold transition-colors",
                    selectedExportFolderId === 'all' ? "bg-gray-50 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <Folder size={16} className="opacity-70" />
                    全部导出
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full border border-black/10 bg-white text-gray-600">{exportedAssetItems.length}</span>
                </button>

                <button
                  onClick={() => setSelectedExportFolderId('unassigned')}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFolderDrop(null)}
                  className={clsx(
                    "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-2xl text-sm font-semibold transition-colors",
                    selectedExportFolderId === 'unassigned' ? "bg-gray-50 text-gray-900" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <Folder size={16} className="opacity-40" />
                    未归档
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full border border-black/10 bg-white text-gray-600">{unassignedExportCount}</span>
                </button>

                <div className="h-px bg-black/5 my-2" />

                {exportFolders.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-400">暂无文件夹，可创建后拖拽图片归档</div>
                ) : (
                  exportFolders.map((folder) => {
                    const isRenaming = renamingFolderId === folder.id;
                    const isActive = selectedExportFolderId === folder.id;
                    const count = folderCounts[folder.id] || 0;
                    return (
                      <div
                        key={folder.id}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFolderDrop(folder.id)}
                        className={clsx(
                          "w-full px-3 py-2 rounded-2xl transition-colors",
                          draggingAssetId && "ring-1 ring-black/5",
                          isActive ? "bg-gray-50" : "hover:bg-gray-50"
                        )}
                      >
                        {isRenaming ? (
                          <div className="flex items-center gap-2">
                            <input
                              value={renameFolderDraft}
                              onChange={(e) => setRenameFolderDraft(e.target.value)}
                              className="flex-1 h-9 px-3 rounded-xl border border-black/10 bg-white text-sm outline-none focus:border-black/25"
                              autoFocus
                            />
                            <button
                              onClick={commitRenameFolder}
                              disabled={!renameFolderDraft.trim()}
                              className={clsx("h-9 px-3 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors", !renameFolderDraft.trim() && "opacity-50")}
                            >
                              保存
                            </button>
                            <button
                              onClick={() => {
                                setRenamingFolderId(null);
                                setRenameFolderDraft('');
                              }}
                              className="h-9 px-3 rounded-xl border border-black/10 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedExportFolderId(folder.id)}
                            className="w-full flex items-center justify-between gap-2 text-sm font-semibold text-gray-700"
                          >
                            <span className="inline-flex items-center gap-2 min-w-0">
                              <Folder size={16} className="opacity-70 shrink-0" />
                              <span className="truncate">{folder.name}</span>
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <span className="text-[11px] px-2 py-0.5 rounded-full border border-black/10 bg-white text-gray-600">{count}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRenamingFolderId(folder.id);
                                  setRenameFolderDraft(folder.name);
                                }}
                                className="p-1 rounded-lg hover:bg-black/5 text-gray-400 hover:text-gray-700 transition-colors"
                                title="重命名"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteExportFolder(folder.id);
                                  if (selectedExportFolderId === folder.id) setSelectedExportFolderId('all');
                                }}
                                className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                                title="删除文件夹"
                              >
                                <Trash2 size={14} />
                              </button>
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          <div className={clsx(assetsTab === 'exported' ? "lg:col-span-9" : "")}>
            {filteredItems.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                {assetsTab === 'generated' ? '暂无生图资产（在文生图页生成后会自动出现在这里）' : assetsTab === 'edited' ? '暂无编辑资产（在编辑类工具生成后会自动出现在这里）' : '暂无导出资产（导出下载后会自动出现在这里）'}
              </div>
            ) : (
              <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
                {filteredItems.map((asset) => (
                  <div key={asset.id} className="mb-4 break-inside-avoid">
                    <div
                      draggable={assetsTab === 'exported'}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', asset.id);
                        setDraggingAssetId(asset.id);
                      }}
                      onDragEnd={() => setDraggingAssetId(null)}
                      onClick={() => {
                        if (isAssetsSelecting) toggleAssetSelected(asset.id);
                      }}
                      className={clsx(
                        "group overflow-hidden rounded-2xl border border-black/5 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all",
                        isAssetsSelecting && "cursor-pointer select-none",
                        isAssetsSelecting && selectedAssetIds.has(asset.id) && "ring-2 ring-gray-300 border-gray-200"
                      )}
                    >
                      <div className="relative">
                        <img src={asset.url} alt={renderAssetTitle(asset)} className="w-full h-auto object-cover" />
                        {isAssetsSelecting && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleAssetSelected(asset.id);
                            }}
                            className={clsx(
                              "absolute top-3 right-3 w-7 h-7 rounded-full border flex items-center justify-center transition-colors",
                              selectedAssetIds.has(asset.id)
                                ? "bg-gray-800 border-gray-800 text-white"
                                : "bg-white/85 backdrop-blur border-black/10 text-transparent hover:border-black/20"
                            )}
                            aria-pressed={selectedAssetIds.has(asset.id)}
                            title={selectedAssetIds.has(asset.id) ? '取消勾选' : '勾选'}
                          >
                            <Check size={16} strokeWidth={3} />
                          </button>
                        )}
                        {assetsTab === 'exported' && (
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-black border shadow-md backdrop-blur bg-black/70 text-white border-white/20">
                            拖拽归档
                          </div>
                        )}
                      </div>
                      <div className="p-3 space-y-1">
                        <div className="text-xs font-bold text-gray-900 line-clamp-2">{renderAssetTitle(asset)}</div>
                        <div className="text-[11px] text-gray-500">{new Date(asset.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
      <div className="max-w-[1320px] mx-auto py-2 px-8 space-y-6">
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
    <div className={clsx("min-h-screen", space === 'public' ? "bg-white" : "bg-background")}>
      <CreateCanvasModal isOpen={isCreateCanvasModalOpen} onClose={() => setIsCreateCanvasModalOpen(false)} />
      <div
        className={clsx(
          "max-w-[1320px] mx-auto px-8",
          space === 'public' ? "py-6 space-y-6 pb-20" : "py-12 space-y-10"
        )}
      >
        {space === 'personal' && (
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
                  设计 {visibleProjects.length} · 资产 {personalAssets.length} · 生图 {generatedAssetItems.length} · 编辑 {editedAssetItems.length} · 导出 {exportedAssetItems.length}
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
                onClick={() => setView('assets')}
                className={clsx(
                  "inline-flex items-center gap-2 py-3 -mb-px text-sm font-semibold border-b-2 transition-colors",
                  view === 'assets'
                    ? "text-gray-700 border-gray-300"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                )}
                aria-selected={view === 'assets'}
              >
                <Download size={16} className={clsx(view === 'assets' ? "opacity-80" : "opacity-50")} />
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

        <div className={clsx(space === 'public' ? "pt-0" : "rounded-3xl border border-black/5 bg-white p-8")}>
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
              {space === 'public' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="relative group max-w-2xl flex-1 min-w-[280px]">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors">
                        <Search size={20} />
                      </div>
                      <input
                        value={publicSearchDraft}
                        onChange={(e) => setPublicSearchDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitPublicSearch(publicSearchDraft);
                        }}
                        placeholder="搜索公共模板…"
                        className="w-full h-12 pl-12 pr-24 bg-gray-50 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-black/10 rounded-xl outline-none transition-all text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => commitPublicSearch(publicSearchDraft)}
                        disabled={!publicSearchDraft.trim()}
                        className={clsx(
                          'absolute right-2 top-1/2 -translate-y-1/2 h-9 px-4 rounded-xl text-sm font-semibold transition-colors',
                          publicSearchDraft.trim()
                            ? 'bg-black text-white hover:bg-gray-900'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        )}
                      >
                        搜索
                      </button>
                    </div>
                    {publicTemplateQuery.trim() && (
                      <button
                        type="button"
                        onClick={() => commitPublicSearch('')}
                        className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        清除
                      </button>
                    )}
                  </div>
                  {renderProjectsView()}
                </div>
              )}
              {space === 'personal' && view === 'projects' && renderProjectsView()}
              {space === 'personal' && view === 'assets' && renderAssetsModule()}
              {space === 'personal' && view === 'favorites' && renderFavoritesModule()}
              {space === 'personal' && view === 'teams' && renderTeamsModule()}
              {space === 'personal' && view === 'p2p' && renderP2PView()}
            </div>
          )}
        </div>
      </div>

      {activePublicTemplateDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/30" onClick={closePublicTemplateDetail} />
          <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-black/10 overflow-hidden">
            <button
              type="button"
              onClick={closePublicTemplateDetail}
              className="absolute top-4 right-4 w-10 h-10 rounded-2xl hover:bg-black/5 text-gray-500 flex items-center justify-center transition-colors"
              aria-label="关闭"
            >
              <X size={18} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="p-6 bg-black/[0.02] border-r border-black/5">
                <div className="aspect-[9/16] rounded-2xl bg-white border border-black/10 overflow-hidden flex items-center justify-center">
                  {activePublicTemplateDetail.previewUrl ? (
                    <img
                      src={activePublicTemplateDetail.previewUrl}
                      alt={activePublicTemplateDetail.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <Folder size={32} className="text-gray-300" />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4 pr-10">
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500">{activePublicTemplateDetail.authorName}</div>
                    <div className="mt-1 text-lg font-semibold text-gray-900 truncate">{activePublicTemplateDetail.title}</div>
                    <div className="mt-2 text-xs text-gray-500">
                      {activePublicTemplateDetail.width}×{activePublicTemplateDetail.height} px
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => sharePublicTemplate(activePublicTemplateDetail)}
                      className="w-10 h-10 rounded-2xl border border-black/10 bg-white hover:bg-gray-50 text-gray-700 flex items-center justify-center transition-colors"
                      title="分享"
                      aria-label="分享"
                    >
                      <Share2 size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePublicTemplateFavorite(activePublicTemplateDetail.id)}
                      className={clsx(
                        "w-10 h-10 rounded-2xl border flex items-center justify-center transition-colors",
                        publicTemplateFavorites.has(activePublicTemplateDetail.id)
                          ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-800"
                          : "bg-white text-gray-700 border-black/10 hover:bg-gray-50"
                      )}
                      title="收藏"
                      aria-label="收藏"
                    >
                      <Heart size={18} fill={publicTemplateFavorites.has(activePublicTemplateDetail.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-gray-900">元素信息</div>
                    <button
                      type="button"
                      onClick={() => setEditingPublicTemplateElementId((prev) => (prev === activePublicTemplateDetail.id ? null : activePublicTemplateDetail.id))}
                      className="p-2 -m-2 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                      aria-label="编辑元素信息"
                      title="编辑元素信息"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>

                  {(() => {
                    const fallback = activePublicTemplateDetail.elements.join('，');
                    const draft = publicTemplateElementDraftById[activePublicTemplateDetail.id] ?? fallback;
                    const isEditing = editingPublicTemplateElementId === activePublicTemplateDetail.id;
                    const chips = draft
                      .split(/[,，、\n]/g)
                      .map((x) => x.trim())
                      .filter(Boolean)
                      .slice(0, 12);

                    return isEditing ? (
                      <input
                        value={draft}
                        onChange={(e) => setPublicTemplateElementDraftById((prev) => ({ ...prev, [activePublicTemplateDetail.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setEditingPublicTemplateElementId(null);
                        }}
                        onBlur={() => setEditingPublicTemplateElementId(null)}
                        className="w-full h-11 px-4 rounded-2xl bg-gray-50 border border-black/10 outline-none focus:border-black/20 text-sm"
                        placeholder="元素：小狗（用逗号分隔）"
                        autoFocus
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {chips.map((c) => (
                          <span
                            key={`${activePublicTemplateDetail.id}-${c}`}
                            className="inline-flex items-center h-6 px-2 rounded-full bg-gray-50 border border-black/5 text-[11px] font-semibold text-gray-700"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      openPublicCanvasFromTemplate(activePublicTemplateDetail);
                      closePublicTemplateDetail();
                    }}
                    className="flex-1 justify-center px-4 py-3 rounded-2xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
                  >
                    使用该模板
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      doSameFromPreview(activePublicTemplateDetail.title, activePublicTemplateDetail.previewUrl, activePublicTemplateDetail.width, activePublicTemplateDetail.height);
                      closePublicTemplateDetail();
                    }}
                    className="flex-1 justify-center px-4 py-3 rounded-2xl bg-white text-gray-900 border border-gray-200 text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    应用到创建设计画布
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Project {
  id: string;
  name: string;
  width: number;
  height: number;
  lastModified: number;
  thumbnail?: string;
  sourceType?: 'manual' | 'text-to-image';
  aiResizeBinding?: {
    defaultPrompt: string;
    originalPrompt: string;
    optimizedPrompt: string;
    generatedImage?: string;
    sourceWidth: number;
    sourceHeight: number;
  };
  elements: any[]; // Placeholder for canvas elements
}

export interface Team {
  id: string;
  name: string;
  projectIds: string[];
  materials: MaterialAsset[];
  createdAt: number;
}

export interface MaterialAsset {
  id: string;
  url: string;
  name?: string;
  fromProjectId?: string;
  createdAt: number;
}

export interface SpaceImageRecord {
  id: string;
  url: string;
  projectId: string;
  projectName: string;
  projectLastModified: number;
}

export type PersonalAssetKind = 'generated' | 'edited' | 'exported';

export interface PersonalAssetRecord {
  id: string;
  url: string;
  kind: PersonalAssetKind;
  createdAt: number;
  prompt?: string;
  tool?: string;
  sourceAssetId?: string;
  meta?: Record<string, any>;
}

export interface ExportFolder {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

interface ProjectContextType {
    currentProject: Project | null;
    projects: Project[];
    teams: Team[];
    personalImages: SpaceImageRecord[];
    personalMaterials: MaterialAsset[];
    personalAssets: PersonalAssetRecord[];
    exportFolders: ExportFolder[];
    exportFolderByAssetId: Record<string, string | null | undefined>;
    isDirty: boolean;
    createProject: (width: number, height: number, customName?: string, initialData?: Partial<Project>) => void;
    updateProject: (data: Partial<Project>) => void;
    saveProject: (data?: Partial<Project>) => void;
    saveCurrentProjectAsNew: () => 'ok' | 'limit_reached';
    validateSave: (name: string) => 'ok' | 'limit_reached' | 'duplicate_name';
    loadProject: (id: string) => void;
    deleteProject: (id: string) => void;
    createTeam: (name: string) => Team;
    joinTeam: (name: string) => Team;
    shareProjectToTeam: (projectId: string, teamId: string) => void;
    getTeamImages: (teamId: string) => SpaceImageRecord[];
    addImagesToPersonalLibrary: (images: SpaceImageRecord[]) => void;
    addUrlToPersonalLibrary: (url: string, name?: string) => void;
    removePersonalMaterial: (materialId: string) => void;
    addImagesToTeamLibrary: (teamId: string, images: SpaceImageRecord[]) => void;
    addUrlToTeamLibrary: (teamId: string, url: string, name?: string) => void;
    removeTeamMaterial: (teamId: string, materialId: string) => void;
    recordGeneratedAssets: (urls: string[], prompt: string, meta?: Record<string, any>) => void;
    recordEditedAsset: (url: string, tool: string, meta?: Record<string, any>) => void;
    recordExportedAsset: (url: string, meta?: Record<string, any>) => void;
    createExportFolder: (name: string) => ExportFolder;
    renameExportFolder: (folderId: string, name: string) => void;
    deleteExportFolder: (folderId: string) => void;
    moveExportedAssetsToFolder: (assetIds: string[], folderId: string | null) => void;
    markAsDirty: () => void;
  }

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'trae_deepcanvas_projects';
const TEAMS_STORAGE_KEY = 'trae_deepcanvas_teams';
const PERSONAL_MATERIALS_STORAGE_KEY = 'trae_deepcanvas_personal_materials';
const PERSONAL_ASSETS_STORAGE_KEY = 'trae_deepcanvas_personal_assets_v1';
const EXPORT_FOLDERS_STORAGE_KEY = 'trae_deepcanvas_export_folders_v1';
const EXPORT_FOLDER_MAP_STORAGE_KEY = 'trae_deepcanvas_export_folder_map_v1';

function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function extractImageUrlsFromElements(elements: any[] | undefined): string[] {
  if (!Array.isArray(elements)) return [];
  const urls = new Set<string>();
  elements.forEach((el) => {
    if (!el || typeof el !== 'object') return;
    if (typeof el.src === 'string' && el.src.trim()) urls.add(el.src.trim());
    if (el.props && typeof el.props.src === 'string' && el.props.src.trim()) urls.add(el.props.src.trim());
  });
  return Array.from(urls);
}

function makeMockSvgDataUrl(title: string, subtitle: string, accent: string) {
  const safeTitle = title.replace(/[<>]/g, '');
  const safeSubtitle = subtitle.replace(/[<>]/g, '');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1220"/>
      <stop offset="1" stop-color="#111827"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${accent}"/>
      <stop offset="1" stop-color="#ffffff"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bg)"/>
  <circle cx="920" cy="220" r="220" fill="${accent}" opacity="0.15"/>
  <circle cx="180" cy="1560" r="260" fill="${accent}" opacity="0.12"/>
  <rect x="120" y="280" width="840" height="8" rx="4" fill="url(#accent)" opacity="0.9"/>
  <text x="120" y="420" fill="#ffffff" font-size="72" font-family="ui-sans-serif, system-ui, -apple-system" font-weight="800">${safeTitle}</text>
  <text x="120" y="520" fill="#cbd5e1" font-size="36" font-family="ui-sans-serif, system-ui, -apple-system" font-weight="600">${safeSubtitle}</text>
  <rect x="120" y="1480" width="420" height="96" rx="48" fill="${accent}" opacity="0.95"/>
  <text x="160" y="1542" fill="#0b1220" font-size="34" font-family="ui-sans-serif, system-ui, -apple-system" font-weight="900">DeepCanvas</text>
  <text x="120" y="1650" fill="#94a3b8" font-size="28" font-family="ui-sans-serif, system-ui, -apple-system" font-weight="600">Mock Asset</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function seedPersonalAssets(): PersonalAssetRecord[] {
  const now = Date.now();
  const orgs = ['深圳分行', '青岛分行', '海南分行', '上海分行'];
  const accents = ['#f59e0b', '#3b82f6', '#10b981', '#a855f7'];
  const teams = ['team-1', 'team-2', 'team-3'];
  const makeId = (prefix: string) => `${prefix}-${now}-${Math.random().toString(16).slice(2)}`;
  const mk = (
    kind: PersonalAssetKind,
    title: string,
    orgCode: string,
    complianceStatus: 'unprotected' | 'processing' | 'protected',
    extra?: Partial<PersonalAssetRecord>
  ): PersonalAssetRecord => {
    const accent = accents[orgs.indexOf(orgCode) >= 0 ? orgs.indexOf(orgCode) : 0] || accents[0];
    const url = makeMockSvgDataUrl(title, `${orgCode} · ${complianceStatus === 'unprotected' ? '未消保' : complianceStatus === 'processing' ? '消保中' : '已消保'}`, accent);
    const teamId = Math.random() < 0.72 ? teams[Math.floor(Math.random() * teams.length)] : undefined;
    return {
      id: makeId(kind),
      url,
      kind,
      createdAt: now - Math.floor(Math.random() * 1000 * 60 * 60 * 72),
      ...(extra || {}),
      meta: {
        ...(extra?.meta || {}),
        seed: 'mock_asset_v2',
        teamId,
        orgCode,
        complianceStatus,
      },
    };
  };

  const promptPool = [
    '红金风，强 CTA，高对比，大标题',
    '国潮插画，留白版，信息区模块化',
    '渐变氛围，品牌调性，主副标题层级',
    '横版 Banner，投放位适配，利益点突出',
  ];
  const editToolPool = ['抠图', '智能适配', '去字修复', 'AI 扩图', '清晰度增强'];
  const exportSourcePool = ['导出下载', '导出下载（批量）', '导出下载（含水印）'];

  const makeBatch = (kind: PersonalAssetKind) => {
    const result: PersonalAssetRecord[] = [];
    (['unprotected', 'processing', 'protected'] as const).forEach((status) => {
      for (let i = 0; i < 20; i += 1) {
        const orgCode = orgs[(i + (status === 'processing' ? 1 : status === 'protected' ? 2 : 0)) % orgs.length] || orgs[0];
        if (kind === 'generated') {
          const prompt = `营销海报 ${i + 1}：${promptPool[i % promptPool.length]}`;
          result.push(
            mk('generated', `生图：营销海报 ${i + 1}`, orgCode, status, {
              prompt,
            })
          );
        } else if (kind === 'edited') {
          const tool = editToolPool[i % editToolPool.length] || '编辑生成';
          result.push(
            mk('edited', `编辑：${tool} ${i + 1}`, orgCode, status, {
              tool,
              meta: { tool, source: '编辑生成' },
            })
          );
        } else {
          const source = exportSourcePool[i % exportSourcePool.length] || '导出下载';
          result.push(
            mk('exported', `导出：投放物料 ${i + 1}`, orgCode, status, {
              meta: { source },
            })
          );
        }
      }
    });
    return result;
  };

  const all = [...makeBatch('generated'), ...makeBatch('edited'), ...makeBatch('exported')];
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

function buildImageRecords(projects: Project[]): SpaceImageRecord[] {
  const records: SpaceImageRecord[] = [];
  projects.forEach((project) => {
    const urls = extractImageUrlsFromElements(project.elements);
    urls.forEach((url, index) => {
      records.push({
        id: `${project.id}::${index}::${url.slice(0, 32)}`,
        url,
        projectId: project.id,
        projectName: project.name,
        projectLastModified: project.lastModified,
      });
    });
  });
  return records.sort((a, b) => b.projectLastModified - a.projectLastModified);
}

function getDefaultTeams(): Team[] {
  return [
    { id: 'team-1', name: '流量素材投放banner制作', projectIds: [], materials: [], createdAt: Date.now() - 3 },
    { id: 'team-2', name: '小程序贷款海报制作', projectIds: [], materials: [], createdAt: Date.now() - 2 },
    { id: 'team-3', name: '营销中台物料制作', projectIds: [], materials: [], createdAt: Date.now() - 1 },
  ];
}

function ensureDefaultTeams(input: Team[]): Team[] {
  const defaults = getDefaultTeams();
  const byId = new Map(input.map(t => [t.id, t]));
  const mergedDefaults = defaults.map((d) => {
    const existing = byId.get(d.id);
    if (!existing) return d;
    return {
      ...existing,
      name: d.name,
      projectIds: Array.isArray(existing.projectIds) ? existing.projectIds : [],
      materials: Array.isArray(existing.materials) ? existing.materials : [],
      createdAt: typeof existing.createdAt === 'number' ? existing.createdAt : d.createdAt,
    };
  });
  const rest = input.filter(t => !defaults.some(d => d.id === t.id));
  return [...mergedDefaults, ...rest];
}

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (!saved) return getDefaultTeams();
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return getDefaultTeams();
      const normalized: Team[] = parsed
        .filter((t: any) => t && typeof t.id === 'string' && typeof t.name === 'string')
        .map((t: any) => ({
          id: t.id,
          name: t.name,
          projectIds: Array.isArray(t.projectIds) ? t.projectIds.filter((id: any) => typeof id === 'string') : [],
          materials: Array.isArray(t.materials)
            ? t.materials
                .filter((m: any) => m && typeof m.id === 'string' && typeof m.url === 'string')
                .map((m: any) => ({
                  id: m.id,
                  url: m.url,
                  name: typeof m.name === 'string' ? m.name : undefined,
                  fromProjectId: typeof m.fromProjectId === 'string' ? m.fromProjectId : undefined,
                  createdAt: typeof m.createdAt === 'number' ? m.createdAt : Date.now(),
                }))
            : [],
          createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now(),
        }));
      const safe = normalized.length > 0 ? normalized : getDefaultTeams();
      return ensureDefaultTeams(safe);
    } catch {
      return getDefaultTeams();
    }
  });

  const [personalMaterials, setPersonalMaterials] = useState<MaterialAsset[]>(() => {
    const saved = localStorage.getItem(PERSONAL_MATERIALS_STORAGE_KEY);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((m: any) => m && typeof m.id === 'string' && typeof m.url === 'string')
        .map((m: any) => ({
          id: m.id,
          url: m.url,
          name: typeof m.name === 'string' ? m.name : undefined,
          fromProjectId: typeof m.fromProjectId === 'string' ? m.fromProjectId : undefined,
          createdAt: typeof m.createdAt === 'number' ? m.createdAt : Date.now(),
        }));
    } catch {
      return [];
    }
  });

  const [personalAssets, setPersonalAssets] = useState<PersonalAssetRecord[]>(() => {
    const parsed = safeParseJson<PersonalAssetRecord[]>(localStorage.getItem(PERSONAL_ASSETS_STORAGE_KEY), []);
    if (!Array.isArray(parsed)) return [];
    if (parsed.length === 0) return seedPersonalAssets();
    return parsed
      .filter((a) => a && typeof a.id === 'string' && typeof a.url === 'string' && typeof a.kind === 'string' && typeof a.createdAt === 'number')
      .map((a) => ({
        id: a.id,
        url: a.url,
        kind: a.kind as PersonalAssetKind,
        createdAt: a.createdAt,
        prompt: typeof a.prompt === 'string' ? a.prompt : undefined,
        tool: typeof a.tool === 'string' ? a.tool : undefined,
        sourceAssetId: typeof a.sourceAssetId === 'string' ? a.sourceAssetId : undefined,
        meta: a.meta && typeof a.meta === 'object' ? a.meta : undefined,
      }))
      .sort((x, y) => y.createdAt - x.createdAt);
  });

  const [exportFolders, setExportFolders] = useState<ExportFolder[]>(() => {
    const parsed = safeParseJson<ExportFolder[]>(localStorage.getItem(EXPORT_FOLDERS_STORAGE_KEY), []);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((f) => f && typeof f.id === 'string' && typeof f.name === 'string')
      .map((f) => ({
        id: f.id,
        name: f.name,
        createdAt: typeof f.createdAt === 'number' ? f.createdAt : Date.now(),
        updatedAt: typeof f.updatedAt === 'number' ? f.updatedAt : Date.now(),
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  });

  const [exportFolderByAssetId, setExportFolderByAssetId] = useState<Record<string, string | null | undefined>>(() => {
    const parsed = safeParseJson<Record<string, string | null | undefined>>(localStorage.getItem(EXPORT_FOLDER_MAP_STORAGE_KEY), {});
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  });

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const personalImages = buildImageRecords(projects);

  // Persist projects whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem(PERSONAL_MATERIALS_STORAGE_KEY, JSON.stringify(personalMaterials));
  }, [personalMaterials]);

  useEffect(() => {
    localStorage.setItem(PERSONAL_ASSETS_STORAGE_KEY, JSON.stringify(personalAssets));
  }, [personalAssets]);

  useEffect(() => {
    setPersonalAssets((prev) => {
      const hasV2 = prev.some((a) => typeof a.meta?.seed === 'string' && a.meta.seed === 'mock_asset_v2');
      if (hasV2) return prev;
      const seeded = seedPersonalAssets();
      return [...seeded, ...prev].sort((a, b) => b.createdAt - a.createdAt);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(EXPORT_FOLDERS_STORAGE_KEY, JSON.stringify(exportFolders));
  }, [exportFolders]);

  useEffect(() => {
    localStorage.setItem(EXPORT_FOLDER_MAP_STORAGE_KEY, JSON.stringify(exportFolderByAssetId));
  }, [exportFolderByAssetId]);

  const createProject = (width: number, height: number, customName?: string, initialData?: Partial<Project>) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: customName || 'Untitled Project',
      width,
      height,
      lastModified: Date.now(),
      sourceType: 'manual',
      elements: [],
      ...(initialData || {}),
    };
    setCurrentProject(newProject);
    setIsDirty(false); // New empty project is not dirty initially
  };

  const updateProject = (data: Partial<Project>) => {
    if (!currentProject) return;
    setCurrentProject(prev => prev ? { ...prev, ...data } : null);
    setIsDirty(true);
  };

  const markAsDirty = () => {
    setIsDirty(true);
  };

  const saveProject = (data?: Partial<Project>) => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      ...(data || {}),
      lastModified: Date.now(),
    };

    if (!updatedProject.thumbnail) {
      const urls = extractImageUrlsFromElements(updatedProject.elements);
      if (urls.length > 0) {
        updatedProject.thumbnail = urls[0];
      }
    }

    setProjects(prev => {
      const exists = prev.find(p => p.id === updatedProject.id);
      if (exists) {
        return prev.map(p => p.id === updatedProject.id ? updatedProject : p);
      } else {
        return [updatedProject, ...prev];
      }
    });
    
    setCurrentProject(updatedProject);
    setIsDirty(false);
  };

  const validateSave = (name: string): 'ok' | 'limit_reached' | 'duplicate_name' => {
    if (!currentProject) return 'ok';

    // Check limit (only if it's a new project not yet in the list)
    const exists = projects.find(p => p.id === currentProject.id);
    if (!exists && projects.length >= 5) {
      return 'limit_reached';
    }
    
    // Check duplicate name (excluding self)
    const isDuplicate = projects.some(p => p.name === name && p.id !== currentProject.id);
    if (isDuplicate) {
      return 'duplicate_name';
    }
    
    return 'ok';
  };

  const saveCurrentProjectAsNew = (): 'ok' | 'limit_reached' => {
    if (!currentProject) return 'ok';
    if (projects.length >= 5) return 'limit_reached';

    const baseName = currentProject.name.trim() ? currentProject.name.trim() : '未命名设计';
    const existsName = (n: string) => projects.some(p => p.name === n);
    let nextName = `${baseName}（备份）`;
    if (existsName(nextName)) {
      let i = 2;
      while (existsName(`${baseName}（备份 ${i}）`) && i < 50) i += 1;
      nextName = i >= 50 ? `${baseName}（备份 ${Date.now()}）` : `${baseName}（备份 ${i}）`;
    }

    const duplicated: Project = {
      ...currentProject,
      id: crypto.randomUUID(),
      name: nextName,
      lastModified: Date.now(),
    };

    if (!duplicated.thumbnail) {
      const urls = extractImageUrlsFromElements(duplicated.elements);
      if (urls.length > 0) duplicated.thumbnail = urls[0];
    }

    setProjects(prev => [duplicated, ...prev]);
    return 'ok';
  };

  const loadProject = (id: string) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      setCurrentProject(project);
      setIsDirty(false);
    }
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setTeams(prev => prev.map(t => ({ ...t, projectIds: t.projectIds.filter(pid => pid !== id) })));
    if (currentProject?.id === id) {
      setCurrentProject(null);
      setIsDirty(false);
    }
  };

  const createTeam = (name: string) => {
    const trimmedName = name.trim();
    const baseName = trimmedName.length > 0 ? trimmedName : '新建团队';
    const exists = (n: string) => teams.some(t => t.name === n);
    let finalName = baseName;
    if (exists(finalName)) {
      let i = 2;
      while (exists(`${baseName}${i}`)) i += 1;
      finalName = `${baseName}${i}`;
    }

    const newTeam: Team = {
      id: crypto.randomUUID(),
      name: finalName,
      projectIds: [],
      materials: [],
      createdAt: Date.now(),
    };
    setTeams(prev => [newTeam, ...prev]);
    return newTeam;
  };

  const joinTeam = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return createTeam('新建团队');
    const existing = teams.find(t => t.name === trimmedName);
    if (existing) return existing;
    return createTeam(trimmedName);
  };

  const shareProjectToTeam = (projectId: string, teamId: string) => {
    setTeams(prev => prev.map(team => {
      if (team.id !== teamId) return team;
      if (team.projectIds.includes(projectId)) return team;
      return { ...team, projectIds: [projectId, ...team.projectIds] };
    }));
  };

  const getTeamImages = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return [];
    const idSet = new Set(team.projectIds);
    return personalImages.filter(image => idSet.has(image.projectId));
  };

  const addImagesToPersonalLibrary = (images: SpaceImageRecord[]) => {
    if (images.length === 0) return;
    setPersonalMaterials(prev => {
      const existingUrls = new Set(prev.map(item => item.url));
      const additions: MaterialAsset[] = [];
      images.forEach((img) => {
        if (existingUrls.has(img.url)) return;
        existingUrls.add(img.url);
        additions.push({
          id: crypto.randomUUID(),
          url: img.url,
          name: `${img.projectName} 素材`,
          fromProjectId: img.projectId,
          createdAt: Date.now(),
        });
      });
      return [...additions, ...prev];
    });
  };

  const removePersonalMaterial = (materialId: string) => {
    setPersonalMaterials(prev => prev.filter(m => m.id !== materialId));
  };

  const addUrlToPersonalLibrary = (url: string, name?: string) => {
    const normalized = url.trim();
    if (!normalized) return;
    setPersonalMaterials(prev => {
      if (prev.some(item => item.url === normalized)) return prev;
      const created: MaterialAsset = {
        id: crypto.randomUUID(),
        url: normalized,
        name: name?.trim() || '个人素材',
        createdAt: Date.now(),
      };
      return [created, ...prev];
    });
  };

  const addImagesToTeamLibrary = (teamId: string, images: SpaceImageRecord[]) => {
    if (images.length === 0) return;
    setTeams(prev => prev.map(team => {
      if (team.id !== teamId) return team;
      const existingUrls = new Set(team.materials.map(item => item.url));
      const additions: MaterialAsset[] = [];
      images.forEach((img) => {
        if (existingUrls.has(img.url)) return;
        existingUrls.add(img.url);
        additions.push({
          id: crypto.randomUUID(),
          url: img.url,
          name: `${img.projectName} 团队素材`,
          fromProjectId: img.projectId,
          createdAt: Date.now(),
        });
      });
      return { ...team, materials: [...additions, ...team.materials] };
    }));
  };

  const removeTeamMaterial = (teamId: string, materialId: string) => {
    setTeams(prev => prev.map(team => {
      if (team.id !== teamId) return team;
      return { ...team, materials: team.materials.filter(m => m.id !== materialId) };
    }));
  };

  const addUrlToTeamLibrary = (teamId: string, url: string, name?: string) => {
    const normalized = url.trim();
    if (!normalized) return;
    setTeams(prev => prev.map(team => {
      if (team.id !== teamId) return team;
      if (team.materials.some(item => item.url === normalized)) return team;
      const created: MaterialAsset = {
        id: crypto.randomUUID(),
        url: normalized,
        name: name?.trim() || `${team.name} 素材`,
        createdAt: Date.now(),
      };
      return { ...team, materials: [created, ...team.materials] };
    }));
  };

  const recordGeneratedAssets = (urls: string[], prompt: string, meta?: Record<string, any>) => {
    const normalizedUrls = urls.map((u) => u.trim()).filter(Boolean);
    if (normalizedUrls.length === 0) return;
    const now = Date.now();
    setPersonalAssets((prev) => {
      const additions: PersonalAssetRecord[] = normalizedUrls.map((url) => ({
        id: crypto.randomUUID(),
        url,
        kind: 'generated',
        createdAt: now,
        prompt: prompt.trim() ? prompt.trim() : undefined,
        meta,
      }));
      return [...additions, ...prev].sort((a, b) => b.createdAt - a.createdAt);
    });
  };

  const recordEditedAsset = (url: string, tool: string, meta?: Record<string, any>) => {
    const normalized = url.trim();
    if (!normalized) return;
    const now = Date.now();
    setPersonalAssets((prev) => {
      const created: PersonalAssetRecord = {
        id: crypto.randomUUID(),
        url: normalized,
        kind: 'edited',
        createdAt: now,
        tool: tool.trim() ? tool.trim() : undefined,
        meta,
      };
      return [created, ...prev].sort((a, b) => b.createdAt - a.createdAt);
    });
  };

  const recordExportedAsset = (url: string, meta?: Record<string, any>) => {
    const normalized = url.trim();
    if (!normalized) return;
    const now = Date.now();
    setPersonalAssets((prev) => {
      const created: PersonalAssetRecord = {
        id: crypto.randomUUID(),
        url: normalized,
        kind: 'exported',
        createdAt: now,
        meta,
      };
      return [created, ...prev].sort((a, b) => b.createdAt - a.createdAt);
    });
  };

  const createExportFolder = (name: string) => {
    const trimmed = name.trim() ? name.trim() : '新建文件夹';
    const exists = (n: string) => exportFolders.some((f) => f.name === n);
    let finalName = trimmed;
    if (exists(finalName)) {
      let i = 2;
      while (exists(`${trimmed} ${i}`) && i < 200) i += 1;
      finalName = i >= 200 ? `${trimmed} ${Date.now()}` : `${trimmed} ${i}`;
    }
    const now = Date.now();
    const created: ExportFolder = { id: crypto.randomUUID(), name: finalName, createdAt: now, updatedAt: now };
    setExportFolders((prev) => [created, ...prev]);
    return created;
  };

  const renameExportFolder = (folderId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setExportFolders((prev) =>
      prev.map((f) => (f.id === folderId ? { ...f, name: trimmed, updatedAt: Date.now() } : f))
    );
  };

  const deleteExportFolder = (folderId: string) => {
    setExportFolders((prev) => prev.filter((f) => f.id !== folderId));
    setExportFolderByAssetId((prev) => {
      const next: Record<string, string | null | undefined> = { ...prev };
      Object.keys(next).forEach((assetId) => {
        if (next[assetId] === folderId) next[assetId] = null;
      });
      return next;
    });
  };

  const moveExportedAssetsToFolder = (assetIds: string[], folderId: string | null) => {
    if (assetIds.length === 0) return;
    setExportFolderByAssetId((prev) => {
      const next: Record<string, string | null | undefined> = { ...prev };
      assetIds.forEach((id) => {
        next[id] = folderId;
      });
      return next;
    });
    if (folderId) {
      setExportFolders((prev) => prev.map((f) => (f.id === folderId ? { ...f, updatedAt: Date.now() } : f)));
    }
  };

  return (
    <ProjectContext.Provider value={{
      currentProject,
      projects,
      teams,
      personalImages,
      personalMaterials,
      personalAssets,
      exportFolders,
      exportFolderByAssetId,
      isDirty,
      createProject,
      updateProject,
      saveProject,
      saveCurrentProjectAsNew,
      validateSave,
      loadProject,
      deleteProject,
      createTeam,
      joinTeam,
      shareProjectToTeam,
      getTeamImages,
      addImagesToPersonalLibrary,
      addUrlToPersonalLibrary,
      removePersonalMaterial,
      addImagesToTeamLibrary,
      addUrlToTeamLibrary,
      removeTeamMaterial,
      recordGeneratedAssets,
      recordEditedAsset,
      recordExportedAsset,
      createExportFolder,
      renameExportFolder,
      deleteExportFolder,
      moveExportedAssetsToFolder,
      markAsDirty
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

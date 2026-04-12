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

interface ProjectContextType {
    currentProject: Project | null;
    projects: Project[];
    teams: Team[];
    personalImages: SpaceImageRecord[];
    personalMaterials: MaterialAsset[];
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
    markAsDirty: () => void;
  }

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'trae_deepcanvas_projects';
const TEAMS_STORAGE_KEY = 'trae_deepcanvas_teams';
const PERSONAL_MATERIALS_STORAGE_KEY = 'trae_deepcanvas_personal_materials';

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

  return (
    <ProjectContext.Provider value={{
      currentProject,
      projects,
      teams,
      personalImages,
      personalMaterials,
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

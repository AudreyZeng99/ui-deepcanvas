import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Project {
  id: string;
  name: string;
  width: number;
  height: number;
  lastModified: number;
  thumbnail?: string;
  elements: any[]; // Placeholder for canvas elements
}

export interface Team {
  id: string;
  name: string;
  projectIds: string[];
  createdAt: number;
}

interface ProjectContextType {
    currentProject: Project | null;
    projects: Project[];
    teams: Team[];
    isDirty: boolean;
    createProject: (width: number, height: number, customName?: string) => void;
    updateProject: (data: Partial<Project>) => void;
    saveProject: (data?: Partial<Project>) => void;
    validateSave: (name: string) => 'ok' | 'limit_reached' | 'duplicate_name';
    loadProject: (id: string) => void;
    deleteProject: (id: string) => void;
    createTeam: (name: string) => Team;
    shareProjectToTeam: (projectId: string, teamId: string) => void;
    markAsDirty: () => void;
  }

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'trae_deepcanvas_projects';
const TEAMS_STORAGE_KEY = 'trae_deepcanvas_teams';

function getDefaultTeams(): Team[] {
  return [
    { id: 'team-1', name: '团队1', projectIds: [], createdAt: Date.now() - 3 },
    { id: 'team-2', name: '团队2', projectIds: [], createdAt: Date.now() - 2 },
    { id: 'team-3', name: '团队3', projectIds: [], createdAt: Date.now() - 1 },
  ];
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
          createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now(),
        }));
      return normalized.length > 0 ? normalized : getDefaultTeams();
    } catch {
      return getDefaultTeams();
    }
  });

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Persist projects whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
  }, [teams]);

  const createProject = (width: number, height: number, customName?: string) => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: customName || 'Untitled Project',
      width,
      height,
      lastModified: Date.now(),
      elements: [],
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
      createdAt: Date.now(),
    };
    setTeams(prev => [newTeam, ...prev]);
    return newTeam;
  };

  const shareProjectToTeam = (projectId: string, teamId: string) => {
    setTeams(prev => prev.map(team => {
      if (team.id !== teamId) return team;
      if (team.projectIds.includes(projectId)) return team;
      return { ...team, projectIds: [projectId, ...team.projectIds] };
    }));
  };

  return (
    <ProjectContext.Provider value={{
      currentProject,
      projects,
      teams,
      isDirty,
      createProject,
      updateProject,
      saveProject,
      validateSave,
      loadProject,
      deleteProject,
      createTeam,
      shareProjectToTeam,
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

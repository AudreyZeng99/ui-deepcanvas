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

interface ProjectContextType {
    currentProject: Project | null;
    projects: Project[];
    isDirty: boolean;
    createProject: (width: number, height: number, customName?: string) => void;
    updateProject: (data: Partial<Project>) => void;
    saveProject: (data?: Partial<Project>) => void;
    validateSave: (name: string) => 'ok' | 'limit_reached' | 'duplicate_name';
    loadProject: (id: string) => void;
    deleteProject: (id: string) => void;
    markAsDirty: () => void;
  }

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'trae_deepcanvas_projects';

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Persist projects whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

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
    if (currentProject?.id === id) {
      setCurrentProject(null);
      setIsDirty(false);
    }
  };

  return (
    <ProjectContext.Provider value={{
      currentProject,
      projects,
      isDirty,
      createProject,
      updateProject,
      saveProject,
      validateSave,
      loadProject,
      deleteProject,
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

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, Trash2, Folder } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import clsx from 'clsx';
import { useTheme } from '../theme/ThemeContext';

export default function Projects() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { projects, loadProject, deleteProject } = useProject();

  const handleCreateNew = () => {
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

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Projects ({projects.length}/5)</h1>
            <p className="text-gray-500">Manage and organize your creative works</p>
          </div>
          <button 
            onClick={handleCreateNew}
            className={clsx(
              "px-4 py-2 rounded-xl text-white flex items-center gap-2 transition-all",
              projects.length >= 5 ? "bg-gray-400 cursor-not-allowed" : (theme.id.includes('glass') ? "bg-accent-primary/80 backdrop-blur-md" : "bg-accent-primary hover:opacity-90")
            )}
          >
            <Plus size={20} />
            New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Folder size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">No projects yet</h3>
            <p className="text-gray-500 max-w-sm mb-8">
              Start your creative journey by creating your first design project.
            </p>
            <button 
              onClick={handleCreateNew}
              className="text-accent-primary font-medium hover:underline"
            >
              Create New Canvas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <div 
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                {/* Thumbnail Placeholder */}
                <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center relative overflow-hidden">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                      <Folder size={32} className="text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold truncate pr-4">{project.name}</h3>
                    <button 
                      onClick={(e) => handleDelete(e, project.id)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock size={12} />
                    <span>{new Date(project.lastModified).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

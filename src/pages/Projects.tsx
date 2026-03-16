import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Clock, Trash2, Folder, Share2, Users, X } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import clsx from 'clsx';
import { useTheme } from '../theme/ThemeContext';

export default function Projects() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { theme } = useTheme();
  const { projects, teams, loadProject, deleteProject, shareProjectToTeam, createTeam } = useProject();
  const [shareProjectId, setShareProjectId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const activeTeam = useMemo(() => {
    if (!teamId) return null;
    return teams.find(t => t.id === teamId) || null;
  }, [teamId, teams]);

  const isTeamSpace = Boolean(teamId);
  const visibleProjects = useMemo(() => {
    if (!isTeamSpace) return projects;
    if (!activeTeam) return [];
    const idSet = new Set(activeTeam.projectIds);
    return projects.filter(p => idSet.has(p.id));
  }, [activeTeam, isTeamSpace, projects]);

  const shareTargetProject = useMemo(() => {
    if (!shareProjectId) return null;
    return projects.find(p => p.id === shareProjectId) || null;
  }, [projects, shareProjectId]);

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

  const openShareModal = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setShareProjectId(id);
    setCreatingTeam(false);
    setNewTeamName('');
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setShareProjectId(null);
    setCreatingTeam(false);
    setNewTeamName('');
  };

  const doToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 1800);
  };

  const handleShareToTeam = (teamIdToShare: string) => {
    if (!shareTargetProject) return;
    shareProjectToTeam(shareTargetProject.id, teamIdToShare);
    const team = teams.find(t => t.id === teamIdToShare);
    closeShareModal();
    doToast(team ? `已分享到 ${team.name}` : '已分享到团队空间');
  };

  const handleCreateTeamAndShare = () => {
    if (!shareTargetProject) return;
    const created = createTeam(newTeamName);
    shareProjectToTeam(shareTargetProject.id, created.id);
    closeShareModal();
    doToast(`已分享到 ${created.name}`);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="text-xl text-gray-500 font-medium">
            {isTeamSpace ? (
              <>
                团队空间 <span className="mx-2">|</span>{' '}
                <span className="text-gray-700 font-bold">{activeTeam?.name || '未找到团队'}</span>{' '}
                <span className="text-gray-400 font-normal">({visibleProjects.length})</span>
              </>
            ) : (
              <>
                个人空间 <span className="mx-2">|</span> 管理和组织您的设计稿项目 ({projects.length}/5)
              </>
            )}
          </div>
          {!isTeamSpace && (
            <button 
              onClick={handleCreateNew}
              className={clsx(
                "px-4 py-2 rounded-xl text-white flex items-center gap-2 transition-all",
                projects.length >= 5 ? "bg-gray-400 cursor-not-allowed" : (theme.id.includes('glass') ? "bg-accent-primary/80 backdrop-blur-md" : "bg-accent-primary hover:opacity-90")
              )}
            >
              <Plus size={20} />
              新建项目
            </button>
          )}
        </div>

        {toast && (
          <div className="fixed top-6 right-6 z-50">
            <div className="bg-black text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-xl shadow-black/20">
              {toast}
            </div>
          </div>
        )}

        {isTeamSpace && !activeTeam ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Users size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">Team not found</h3>
            <p className="text-gray-500 max-w-sm mb-8">请从左侧选择一个有效的团队空间。</p>
            <button onClick={() => navigate('/projects')} className="text-accent-primary font-medium hover:underline">
              返回个人空间
            </button>
          </div>
        ) : visibleProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Folder size={48} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">{isTeamSpace ? '团队暂无共享项目' : '还没有项目'}</h3>
            <p className="text-gray-500 max-w-sm mb-8">
              {isTeamSpace ? '在个人空间将设计稿分享到团队后，会在这里出现。' : '从新建项目开始，创建你的第一张画布。'}
            </p>
            {!isTeamSpace && (
              <button onClick={handleCreateNew} className="text-accent-primary font-medium hover:underline">
                新建画布
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleProjects.map((project) => (
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
                  {!isTeamSpace && (
                    <div className="absolute left-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => openShareModal(e, project.id)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 backdrop-blur border border-gray-200 text-gray-900 text-xs font-bold shadow-sm hover:bg-white"
                        title="分享到我的团队"
                      >
                        <Share2 size={14} />
                        分享到我的团队
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold truncate pr-4">{project.name}</h3>
                    {!isTeamSpace && (
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
                    <span>{new Date(project.lastModified).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isShareModalOpen && shareTargetProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeShareModal} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-black/20 border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500 font-medium">分享到我的团队</div>
                <div className="text-xl font-black text-gray-900 mt-1 truncate">
                  {shareTargetProject.name}
                </div>
              </div>
              <button
                onClick={closeShareModal}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors"
                title="关闭"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => handleShareToTeam(team.id)}
                    className="group/team text-left p-4 rounded-2xl border border-gray-200 hover:border-black hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
                        <Users size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 truncate">{team.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{team.projectIds.length} 个项目</div>
                      </div>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => setCreatingTeam(true)}
                  className={clsx(
                    "text-left p-4 rounded-2xl border border-dashed transition-all",
                    creatingTeam ? "border-black bg-gray-50" : "border-gray-300 hover:border-black hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-700 flex items-center justify-center">
                      <Plus size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 truncate">新建团队</div>
                      <div className="text-xs text-gray-500 mt-0.5">创建后立刻分享到该团队</div>
                    </div>
                  </div>
                </button>
              </div>

              {creatingTeam && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <div className="text-sm font-bold text-gray-900">团队名称</div>
                  <div className="flex gap-3">
                    <input
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="例如：设计组 / 品牌组"
                      className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-white"
                    />
                    <button
                      onClick={handleCreateTeamAndShare}
                      className="px-5 py-3 rounded-2xl bg-black text-white font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!newTeamName.trim()}
                    >
                      创建并分享
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

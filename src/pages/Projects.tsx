import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Clock, Trash2, Folder, Share2, Users, X, CheckCircle2, Image as ImageIcon, Library, UserPlus, ArrowRight, PackagePlus } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import clsx from 'clsx';
import { useTheme } from '../theme/ThemeContext';

type SpaceView = 'projects' | 'images' | 'materials';

export default function Projects() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { theme } = useTheme();
  const {
    projects,
    teams,
    personalImages,
    personalMaterials,
    loadProject,
    deleteProject,
    shareProjectToTeam,
    createTeam,
    joinTeam,
    getTeamImages,
    addImagesToPersonalLibrary,
    addUrlToPersonalLibrary,
    removePersonalMaterial,
    addImagesToTeamLibrary,
    addUrlToTeamLibrary,
    removeTeamMaterial,
  } = useProject();

  const [view, setView] = useState<SpaceView>('projects');
  const [shareProjectId, setShareProjectId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [creatingTeamForShare, setCreatingTeamForShare] = useState(false);
  const [shareTeamName, setShareTeamName] = useState('');
  const [teamNameInput, setTeamNameInput] = useState('');
  const [joinTeamInput, setJoinTeamInput] = useState('');
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  const [newMaterialUrl, setNewMaterialUrl] = useState('');
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

  const visibleImages = useMemo(() => {
    if (!isTeamSpace) return personalImages;
    if (!activeTeam) return [];
    return getTeamImages(activeTeam.id);
  }, [isTeamSpace, personalImages, activeTeam, getTeamImages]);

  const visibleMaterials = useMemo(() => {
    if (!isTeamSpace) return personalMaterials;
    return activeTeam?.materials || [];
  }, [isTeamSpace, personalMaterials, activeTeam]);

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
    setCreatingTeamForShare(false);
    setShareTeamName('');
    setIsShareModalOpen(true);
  };

  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setShareProjectId(null);
    setCreatingTeamForShare(false);
    setShareTeamName('');
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
    const created = createTeam(shareTeamName);
    shareProjectToTeam(shareTargetProject.id, created.id);
    closeShareModal();
    doToast(`已分享到 ${created.name}`);
  };

  const handleCreateTeam = () => {
    if (!teamNameInput.trim()) return;
    const team = createTeam(teamNameInput);
    setTeamNameInput('');
    doToast(`已创建 ${team.name}`);
    navigate(`/teams/${team.id}`);
  };

  const handleJoinTeam = () => {
    if (!joinTeamInput.trim()) return;
    const team = joinTeam(joinTeamInput);
    setJoinTeamInput('');
    doToast(`已加入 ${team.name}`);
    navigate(`/teams/${team.id}`);
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
    if (isTeamSpace && activeTeam) {
      addImagesToTeamLibrary(activeTeam.id, selectedImages);
      doToast(`已将 ${selectedImages.length} 张图片加入 ${activeTeam.name} 素材库`);
    } else {
      addImagesToPersonalLibrary(selectedImages);
      doToast(`已将 ${selectedImages.length} 张图片加入个人素材库`);
    }
    setSelectedImageIds(new Set());
  };

  const handleAddMaterialByUrl = () => {
    if (!newMaterialUrl.trim()) return;
    if (isTeamSpace && activeTeam) {
      addUrlToTeamLibrary(activeTeam.id, newMaterialUrl);
      doToast(`已添加到 ${activeTeam.name} 素材库`);
    } else {
      addUrlToPersonalLibrary(newMaterialUrl);
      doToast('已添加到个人素材库');
    }
    setNewMaterialUrl('');
  };

  const renderProjectsView = () => {
    if (isTeamSpace && !activeTeam) {
      return (
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
      );
    }

    if (visibleProjects.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <Folder size={48} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold mb-2">{isTeamSpace ? '团队暂无共享项目' : '还没有项目'}</h3>
          <p className="text-gray-500 max-w-sm mb-8">
            {isTeamSpace ? '先在个人空间分享项目到该团队后，这里会展示对应设计稿。' : '从新建项目开始，创建你的第一张画布。'}
          </p>
          {!isTeamSpace && (
            <button onClick={handleCreateNew} className="text-accent-primary font-medium hover:underline">
              新建画布
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => handleProjectClick(project.id)}
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
                    if (isTeamSpace && activeTeam) removeTeamMaterial(activeTeam.id, material.id);
                    else removePersonalMaterial(material.id);
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
              {isTeamSpace ? (
                <>
                  团队空间 <span className="mx-2">|</span>
                  <span className="text-gray-800 font-black">{activeTeam?.name || '未找到团队'}</span>
                </>
              ) : (
                <>
                  个人空间 <span className="mx-2">|</span> 项目、图片记录、个人素材库一体管理
                </>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              项目 {visibleProjects.length} · 图片 {visibleImages.length} · 素材 {visibleMaterials.length}
            </div>
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

        {!isTeamSpace && (
          <div className="bg-white border border-gray-100 rounded-2xl p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-900 inline-flex items-center gap-2">
                <UserPlus size={16} />
                创建团队
              </div>
              <div className="flex gap-2">
                <input
                  value={teamNameInput}
                  onChange={(e) => setTeamNameInput(e.target.value)}
                  placeholder="输入团队名称"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:border-black outline-none"
                />
                <button onClick={handleCreateTeam} disabled={!teamNameInput.trim()} className="px-3 py-2 rounded-xl bg-black text-white text-sm disabled:opacity-50">
                  创建
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-900 inline-flex items-center gap-2">
                <UserPlus size={16} />
                加入团队
              </div>
              <div className="flex gap-2">
                <input
                  value={joinTeamInput}
                  onChange={(e) => setJoinTeamInput(e.target.value)}
                  placeholder="输入团队名称"
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:border-black outline-none"
                />
                <button onClick={handleJoinTeam} disabled={!joinTeamInput.trim()} className="px-3 py-2 rounded-xl border border-gray-300 text-sm disabled:opacity-50 inline-flex items-center gap-1.5">
                  加入
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

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

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          {view === 'projects' && renderProjectsView()}
          {view === 'images' && renderImagesView()}
          {view === 'materials' && renderMaterialsView()}
        </div>
      </div>

      {isShareModalOpen && shareTargetProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeShareModal} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl shadow-black/20 border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div>
                <div className="text-sm text-gray-500 font-medium">分享到我的团队</div>
                <div className="text-xl font-black text-gray-900 mt-1 truncate">{shareTargetProject.name}</div>
              </div>
              <button onClick={closeShareModal} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors" title="关闭">
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
                        <div className="text-xs text-gray-500 mt-0.5">{team.projectIds.length} 个项目 · {team.materials.length} 素材</div>
                      </div>
                    </div>
                  </button>
                ))}
                <button
                  onClick={() => setCreatingTeamForShare(true)}
                  className={clsx("text-left p-4 rounded-2xl border border-dashed transition-all", creatingTeamForShare ? "border-black bg-gray-50" : "border-gray-300 hover:border-black hover:bg-gray-50")}
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

              {creatingTeamForShare && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                  <div className="text-sm font-bold text-gray-900">团队名称</div>
                  <div className="flex gap-3">
                    <input
                      value={shareTeamName}
                      onChange={(e) => setShareTeamName(e.target.value)}
                      placeholder="例如：设计组 / 品牌组"
                      className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-white"
                    />
                    <button
                      onClick={handleCreateTeamAndShare}
                      className="px-5 py-3 rounded-2xl bg-black text-white font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!shareTeamName.trim()}
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

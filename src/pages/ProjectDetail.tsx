import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Search, Star, X } from 'lucide-react';
import clsx from 'clsx';

import { useToast } from '../components/ToastProvider';
import {
  type ManagedProject,
  type ProjectTemplatePlacement,
  formatTeamName,
  readManagedProjects,
  writeManagedProjects,
} from '../utils/managedProjects';
import {
  type ActivityType,
  type BenefitType,
  type ImageSize,
  LAYER_TEMPLATES_STORAGE_KEY,
  type LayerTemplate,
  type LibraryScope,
  type ToneColor,
  readLayerTemplates,
} from '../utils/layerTemplates';

const IMAGE_SIZE_OPTIONS: Array<{ value: ImageSize; label: string }> = [
  { value: 'large_banner', label: '大banner' },
  { value: 'small_banner', label: '小banner' },
  { value: 'hero_banner', label: '首图banner' },
];
const ACTIVITY_TYPE_OPTIONS: ActivityType[] = ['拉新活动', '节日营销', '权益推广', '品牌宣传'];
const BENEFIT_TYPE_OPTIONS: BenefitType[] = ['红包福利', '积分权益', '礼品权益', '会员权益'];
const COLOR_OPTIONS: Array<{ id: ToneColor; label: string }> = [
  { id: 'red', label: '红' },
  { id: 'orange', label: '橙' },
  { id: 'yellow', label: '黄' },
  { id: 'green', label: '绿' },
  { id: 'cyan', label: '青' },
  { id: 'blue', label: '蓝' },
  { id: 'purple', label: '紫' },
];
const IMAGE_SIZE_SECTION_ORDER: ImageSize[] = ['hero_banner', 'large_banner', 'small_banner'];

function formatDateTime(timestamp: number) {
  if (!Number.isFinite(timestamp)) return '-';
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

type SortMode = 'latest' | 'hottest' | 'usage';

function writeTemplates(next: LayerTemplate[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LAYER_TEMPLATES_STORAGE_KEY, JSON.stringify(next));
}

export default function ProjectDetail() {
  const navigate = useNavigate();
  const toast = useToast();
  const params = useParams();
  const projectId = params.projectId ? decodeURIComponent(params.projectId) : '';

  const [projects, setProjects] = useState<ManagedProject[]>(() => readManagedProjects());
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<LayerTemplate | null>(null);
  const [isScopeEditing, setIsScopeEditing] = useState(false);
  const [pendingScopeConfirm, setPendingScopeConfirm] = useState(false);
  const [permissionScopeDraft, setPermissionScopeDraft] = useState<ManagedProject['permissionScope']>('self');
  const [templateQuery, setTemplateQuery] = useState('');
  const [templateSortMode, setTemplateSortMode] = useState<SortMode>('latest');
  const [templateImageSize, setTemplateImageSize] = useState<ImageSize | ''>('');
  const [templateColor, setTemplateColor] = useState<ToneColor | null>(null);
  const [templateActivityType, setTemplateActivityType] = useState<ActivityType | ''>('');
  const [templateBenefitType, setTemplateBenefitType] = useState<BenefitType | ''>('');
  const [templateScope, setTemplateScope] = useState<LibraryScope | ''>('');
  const [templateOnlyFavorites, setTemplateOnlyFavorites] = useState(false);
  const [templates, setTemplates] = useState<LayerTemplate[]>(() => readLayerTemplates());

  useEffect(() => {
    writeManagedProjects(projects);
  }, [projects]);

  const project = useMemo(() => projects.find((p) => p.id === projectId) ?? null, [projects, projectId]);

  const assignedTemplateCards = useMemo(() => {
    if (!project) return [] as Array<ProjectTemplatePlacement & { template: LayerTemplate | null }>;
    return project.assignedTemplates.map((placement) => ({
      ...placement,
      template: templates.find((item) => item.id === placement.templateId) ?? null,
    }));
  }, [project, templates]);

  const groupedAssignedTemplates = useMemo(() => {
    const groups: Record<ImageSize, Array<ProjectTemplatePlacement & { template: LayerTemplate }>> = {
      hero_banner: [],
      large_banner: [],
      small_banner: [],
    };
    assignedTemplateCards.forEach((item) => {
      if (!item.template) return;
      groups[item.template.imageSize].push(item as ProjectTemplatePlacement & { template: LayerTemplate });
    });
    return IMAGE_SIZE_SECTION_ORDER.map((size) => ({
      size,
      label: IMAGE_SIZE_OPTIONS.find((option) => option.value === size)?.label || size,
      items: groups[size],
    })).filter((section) => section.items.length > 0);
  }, [assignedTemplateCards]);

  const filteredTemplates = useMemo(() => {
    const q = templateQuery.trim().toLowerCase();
    const list = templates
      .filter((t) => (templateScope ? t.scope === templateScope : true))
      .filter((t) => {
        if (!q) return true;
        return (
          t.name.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.projectName.toLowerCase().includes(q)
        );
      })
      .filter((t) => (templateImageSize ? t.imageSize === templateImageSize : true))
      .filter((t) => (templateColor === null ? true : t.color === templateColor))
      .filter((t) => (templateActivityType ? t.activityType === templateActivityType : true))
      .filter((t) => (templateBenefitType ? t.benefitType === templateBenefitType : true))
      .filter((t) => (templateOnlyFavorites ? t.isFavorite : true));

    return [...list].sort((a, b) => {
      if (templateSortMode === 'usage') return b.usageCount - a.usageCount;
      if (templateSortMode === 'hottest') {
        const scoreA = a.usageCount + (a.isFavorite ? 30 : 0);
        const scoreB = b.usageCount + (b.isFavorite ? 30 : 0);
        return scoreB - scoreA;
      }
      return b.createdAt - a.createdAt;
    });
  }, [
    templateActivityType,
    templateBenefitType,
    templateColor,
    templateImageSize,
    templateOnlyFavorites,
    templateQuery,
    templateScope,
    templateSortMode,
    templates,
  ]);

  const openScopeEditor = () => {
    if (!project) return;
    setPermissionScopeDraft(project.permissionScope);
    setIsScopeEditing(true);
  };

  const cancelScopeEditor = () => {
    setIsScopeEditing(false);
    setPendingScopeConfirm(false);
  };

  const requestSaveScope = () => {
    if (!project) return;
    if (permissionScopeDraft === project.permissionScope) {
      setIsScopeEditing(false);
      return;
    }
    if (permissionScopeDraft === 'team' && !project.orgLevel1) {
      toast.show('请先选择项目归属（一级机构）后再切换为团队可操作');
      return;
    }
    setPendingScopeConfirm(true);
  };

  const confirmSaveScope = () => {
    if (!project) return;
    if (permissionScopeDraft === project.permissionScope) {
      setPendingScopeConfirm(false);
      setIsScopeEditing(false);
      return;
    }
    const updated: ManagedProject = {
      ...project,
      permissionScope: permissionScopeDraft,
    };
    setProjects((current) => current.map((p) => (p.id === updated.id ? updated : p)));
    toast.show('已更新操作权限（模拟）');
    setPendingScopeConfirm(false);
    setIsScopeEditing(false);
  };

  const applyTemplate = (template: LayerTemplate) => {
    if (!project) return;
    const placement: ProjectTemplatePlacement = {
      templateId: template.id,
      flowId: `flow-${Date.now().toString().slice(-6)}`,
      outputCount: Math.max(1, Math.round(Math.max(template.usageCount, 1) / 8)),
      addedAt: Date.now(),
    };
    setProjects((current) =>
      current.map((p) =>
        p.id === project.id
          ? {
              ...p,
              configuredLayerTemplateId: template.id,
              assignedTemplates: [placement, ...p.assignedTemplates],
            }
          : p
      )
    );
    toast.show(`已添加模板到当前项目：${template.name}`);
    setPendingTemplate(null);
    setIsTemplateModalOpen(false);
  };

  const toggleTemplateFavorite = (templateId: string) => {
    setTemplates((current) => {
      const next = current.map((item) =>
        item.id === templateId
          ? {
              ...item,
              isFavorite: !item.isFavorite,
            }
          : item
      );
      writeTemplates(next);
      return next;
    });
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-background px-8 py-8 md:px-12">
        <div className="mx-auto max-w-5xl space-y-6">
          <button
            type="button"
            onClick={() => navigate('/project-management')}
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-black/10 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            返回项目列表
          </button>
          <div className="border-b border-black/5 pb-6">
            <h1 className="text-2xl font-semibold text-gray-950">项目不存在</h1>
            <div className="mt-2 text-sm text-gray-500">该项目可能已被删除或尚未创建。</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-8 py-8 md:px-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 border-b border-black/5 pb-6 md:flex-row md:items-start md:justify-between">
          <button
            type="button"
            onClick={() => navigate('/project-management')}
            className="inline-flex h-10 items-center gap-2 self-start rounded-[10px] border border-black/10 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft size={16} />
            返回
          </button>

          <div className="flex flex-wrap items-center gap-2 md:justify-end">
            <button
              type="button"
              onClick={() => setIsTemplateModalOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-accent-primary px-4 text-sm font-semibold text-white transition-colors hover:opacity-90"
            >
              <Plus size={16} />
              模板选用
            </button>
          </div>
        </div>

        <section className="overflow-hidden border border-black/5 bg-background">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 md:px-6">
            <div className="text-sm font-semibold text-gray-950">项目信息</div>
            <div className="text-xs text-gray-400">共 7 项</div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3">
            <KeyField label="项目名称" value={project.name} />
            <KeyField label="关联业务系统类型" value={project.businessSystemType} />
            <KeyField label="关联业务项目ID" value={project.businessProjectId || '未填写'} />
            <KeyField label="项目归属" value={formatTeamName(project.orgLevel1, project.orgLevel2) || '未设置'} />
            <div className="border-b border-black/5 px-4 py-3 md:px-6">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-semibold text-gray-600">操作权限</div>
                {isScopeEditing ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={cancelScopeEditor}
                      className="inline-flex h-8 items-center rounded-[10px] border border-black/10 px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={requestSaveScope}
                      className="inline-flex h-8 items-center rounded-[10px] bg-accent-primary px-3 text-xs font-semibold text-white transition-colors hover:opacity-90"
                    >
                      保存
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={openScopeEditor}
                    className="inline-flex h-8 items-center gap-2 rounded-[10px] border border-black/10 px-3 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <Pencil size={14} />
                    编辑
                  </button>
                )}
              </div>

              {isScopeEditing ? (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    aria-pressed={permissionScopeDraft === 'self'}
                    onClick={() => setPermissionScopeDraft('self')}
                    className={clsx(
                      'inline-flex h-10 items-center justify-center rounded-[10px] border px-3 text-sm font-semibold transition-colors',
                      permissionScopeDraft === 'self'
                        ? 'border-accent-primary bg-accent-primary text-white'
                        : 'border-black/10 bg-background text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    仅限本人操作
                  </button>
                  <button
                    type="button"
                    aria-pressed={permissionScopeDraft === 'team'}
                    onClick={() => {
                      if (!project.orgLevel1) {
                        toast.show('请先选择项目归属（一级机构）');
                        return;
                      }
                      setPermissionScopeDraft('team');
                    }}
                    className={clsx(
                      'inline-flex h-10 items-center justify-center rounded-[10px] border px-3 text-sm font-semibold transition-colors',
                      permissionScopeDraft === 'team'
                        ? 'border-accent-primary bg-accent-primary text-white'
                        : 'border-black/10 bg-background text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    归属团队可操作
                  </button>
                </div>
              ) : (
                <div className="mt-1 text-sm font-semibold text-gray-950">
                  {project.permissionScope === 'team' ? '归属团队可操作' : '仅限本人操作'}
                </div>
              )}
            </div>
            <KeyField label="项目创建人" value={project.creatorName} />
            <KeyField
              label="创建时间"
              value={
                <div className="space-y-1">
                  <div>{formatDateTime(project.createdAt)}</div>
                  <div className="text-xs font-normal text-gray-400">ts: {project.createdAt}</div>
                </div>
              }
            />
          </div>
        </section>

        <section className="border border-black/5 bg-card-light p-4 md:p-6">
          {assignedTemplateCards.length === 0 ? (
            <div className="flex min-h-[420px] items-center justify-center text-center">
              <div className="max-w-md px-6">
                <div className="text-lg font-semibold text-gray-900">当前还没有添加模板</div>
                <div className="mt-2 text-sm leading-6 text-gray-500">
                  点击右上角“模板选用”，将图层模板添加到当前项目后，这里会按不同尺寸自动排布展示。
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedAssignedTemplates.map((section) => (
                <div key={section.size} className="space-y-3">
                  <div className="border-b border-black/5 pb-2">
                    <div className="text-sm font-semibold text-gray-900">{section.label}</div>
                  </div>
                  <div className={getAssignedSectionGridClass(section.size)}>
                    {section.items.map((item) => (
                      <article key={`${item.templateId}-${item.flowId}`} className="group overflow-hidden border border-black/10 bg-background">
                        <div className={clsx('relative w-full overflow-hidden bg-[#f3f4f6]', getAssignedCardAspectClass(section.size))}>
                          <img
                            src={item.template.previewUrl}
                            alt={item.template.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 via-black/20 to-transparent px-3 py-3 text-white">
                            <span className="text-[11px] font-medium">流程id：{item.flowId}</span>
                            <span className="text-[11px] font-medium">出图数：{item.outputCount}</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsTemplateModalOpen(false)} />
          <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[18px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
            <div className="flex items-start justify-between gap-4 border-b border-black/5 px-6 py-5 md:px-8">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Layer Templates</div>
                <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-gray-950">模板选用</div>
                <div className="mt-2 text-sm text-gray-500">从图层模板库选择一个模板配置到当前项目。</div>
              </div>
              <button
                type="button"
                onClick={() => setIsTemplateModalOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-transparent text-gray-400 transition-colors hover:border-black/10 hover:text-gray-800"
                aria-label="关闭模板选用弹窗"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 border-b border-black/5 px-6 py-4 md:px-8">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={templateQuery}
                  onChange={(event) => setTemplateQuery(event.target.value)}
                  placeholder="搜索图层模板名称 / 项目 / ID"
                  className="h-11 w-full border border-black/10 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-accent-primary"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-medium text-gray-700">排序筛选：</span>
                  <ToolbarToggle label="最新" active={templateSortMode === 'latest'} onClick={() => setTemplateSortMode('latest')} />
                  <ToolbarToggle label="最热" active={templateSortMode === 'hottest'} onClick={() => setTemplateSortMode('hottest')} />
                  <ToolbarToggle label="使用频率" active={templateSortMode === 'usage'} onClick={() => setTemplateSortMode('usage')} />
                </div>

                <ToolbarSelect
                  value={templateImageSize}
                  onChange={(value) => setTemplateImageSize((value as ImageSize | '') || '')}
                  placeholder="图片尺寸"
                  options={IMAGE_SIZE_OPTIONS.map((item) => ({ value: item.value, label: item.label }))}
                />
                <ToolbarSelect
                  value={templateColor ?? ''}
                  onChange={(value) => setTemplateColor(value ? (value as ToneColor) : null)}
                  placeholder="颜色"
                  options={COLOR_OPTIONS.map((item) => ({ value: item.id, label: item.label }))}
                />
                <ToolbarSelect
                  value={templateActivityType}
                  onChange={(value) => setTemplateActivityType((value as ActivityType | '') || '')}
                  placeholder="活动类型"
                  options={ACTIVITY_TYPE_OPTIONS.map((item) => ({ value: item, label: item }))}
                />
                <ToolbarSelect
                  value={templateBenefitType}
                  onChange={(value) => setTemplateBenefitType((value as BenefitType | '') || '')}
                  placeholder="权益类型"
                  options={BENEFIT_TYPE_OPTIONS.map((item) => ({ value: item, label: item }))}
                />
                <ToolbarSelect
                  value={templateScope}
                  onChange={(value) => setTemplateScope((value as LibraryScope | '') || '')}
                  placeholder="模版权限"
                  options={[
                    { value: 'team', label: '团队' },
                    { value: 'public', label: '个人' },
                  ]}
                />

                <button
                  type="button"
                  onClick={() => setTemplateOnlyFavorites((prev) => !prev)}
                  className={clsx(
                    'ml-auto inline-flex h-10 items-center gap-2 rounded-[10px] border px-4 text-sm font-medium transition-colors',
                    templateOnlyFavorites
                      ? 'border-accent-primary bg-accent-primary text-white'
                      : 'border-black/10 bg-white text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Star size={15} className={templateOnlyFavorites ? 'fill-current' : ''} />
                  只看收藏
                </button>
              </div>
            </div>

            <div className="max-h-[560px] overflow-y-auto px-6 py-6 md:px-8">
              {filteredTemplates.length === 0 ? (
                <div className="flex min-h-[240px] items-center justify-center border border-dashed border-black/10 bg-card-light text-center">
                  <div className="max-w-md px-6">
                    <div className="text-base font-semibold text-gray-900">暂无匹配模板</div>
                    <div className="mt-2 text-sm text-gray-500">尝试切换图层库范围或调整搜索关键词。</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setPendingTemplate(template)}
                      className="group border border-black/10 bg-white text-left transition-colors hover:border-black/20"
                    >
                      <div className={clsx('relative w-full overflow-hidden bg-[#f3f4f6]', getTemplatePreviewAspectClass(template.imageSize))}>
                        <img
                          src={template.previewUrl}
                          alt=""
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 text-center text-xs font-semibold text-white opacity-0 transition-all duration-200 group-hover:bg-black/45 group-hover:opacity-100">
                          <span className="px-4 leading-5">添加该模板到当前项目</span>
                        </div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleTemplateFavorite(template.id);
                          }}
                          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-[8px] border border-white/60 bg-white/90 text-gray-600 backdrop-blur transition-colors hover:text-gray-900"
                          aria-label={template.isFavorite ? '取消收藏' : '收藏模板'}
                        >
                          <Star size={13} className={template.isFavorite ? 'fill-current text-amber-400' : ''} />
                        </button>
                      </div>
                      <div className="space-y-2 px-3 py-3">
                        <div className="text-xs font-semibold text-gray-900 line-clamp-2">{template.name}</div>
                        <div className="text-[11px] text-gray-500 line-clamp-1">{template.projectName}</div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Chip>{IMAGE_SIZE_OPTIONS.find((item) => item.value === template.imageSize)?.label || '—'}</Chip>
                          <Chip>{COLOR_OPTIONS.find((item) => item.id === template.color)?.label || '—'}</Chip>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                          <span>{template.scope === 'team' ? '团队' : '个人'}</span>
                          <span>{template.usageCount} 次</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {pendingScopeConfirm ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/35" onClick={() => setPendingScopeConfirm(false)} />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[18px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
            <div className="border-b border-black/5 px-6 py-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Confirm</div>
              <div className="mt-2 text-xl font-semibold tracking-[-0.03em] text-gray-950">确认修改操作权限</div>
            </div>
            <div className="space-y-3 px-6 py-5 text-sm leading-6 text-gray-600">
              <div>
                修改后操作权限将更新为：
                <span className="ml-2 font-semibold text-gray-900">
                  {permissionScopeDraft === 'team' ? '归属团队可操作' : '仅限本人操作'}
                </span>
              </div>
              <div className="rounded-[12px] border border-black/10 bg-[#fafafa] px-3 py-2 text-gray-600">
                修改后会影响项目在“个人项目 / 团队项目”中的归类展示。
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-black/5 px-6 py-4">
              <button
                type="button"
                onClick={() => setPendingScopeConfirm(false)}
                className="inline-flex h-10 items-center rounded-[10px] border border-black/10 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmSaveScope}
                className="inline-flex h-10 items-center rounded-[10px] bg-accent-primary px-4 text-sm font-semibold text-white transition-colors hover:opacity-90"
              >
                确认修改
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {pendingTemplate && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/35" onClick={() => setPendingTemplate(null)} />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[18px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
            <div className="border-b border-black/5 px-6 py-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Template Confirmation</div>
              <div className="mt-2 text-xl font-semibold tracking-[-0.03em] text-gray-950">确认添加模板</div>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div className="rounded-[14px] border border-black/10 bg-[#fafafa] p-3">
                <div className="text-sm font-semibold text-gray-900">{pendingTemplate.name}</div>
                <div className="mt-1 text-xs text-gray-500">{pendingTemplate.projectName}</div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Chip>{IMAGE_SIZE_OPTIONS.find((item) => item.value === pendingTemplate.imageSize)?.label || '—'}</Chip>
                  <Chip>{pendingTemplate.scope === 'team' ? '团队模板' : '个人模板'}</Chip>
                </div>
              </div>
              <div className="space-y-2 text-sm leading-6 text-gray-600">
                <p>确认将该模板添加到当前项目中吗？</p>
                <p className="rounded-[12px] border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                  添加后，当前版本暂不支持从项目中删除该模板，请确认后再继续。
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-black/5 px-6 py-4">
              <button
                type="button"
                onClick={() => setPendingTemplate(null)}
                className="inline-flex h-10 items-center rounded-[10px] border border-black/10 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => applyTemplate(pendingTemplate)}
                className="inline-flex h-10 items-center rounded-[10px] bg-accent-primary px-4 text-sm font-semibold text-white transition-colors hover:opacity-90"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KeyField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="border-b border-black/5 px-4 py-3 md:px-6">
      <div className="text-xs font-semibold text-gray-600">{label}</div>
      <div className="mt-1 text-sm font-semibold text-gray-950">{value}</div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-black/5 bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">{children}</span>;
}

function getTemplatePreviewAspectClass(imageSize: ImageSize) {
  if (imageSize === 'large_banner') return 'aspect-[16/9]';
  if (imageSize === 'hero_banner') return 'aspect-[3/4]';
  return 'aspect-[4/3]';
}

function getAssignedSectionGridClass(imageSize: ImageSize) {
  if (imageSize === 'large_banner') return 'grid grid-cols-1 gap-4 xl:grid-cols-2';
  if (imageSize === 'hero_banner') return 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4';
  return 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5';
}

function getAssignedCardAspectClass(imageSize: ImageSize) {
  if (imageSize === 'large_banner') return 'aspect-[16/9]';
  if (imageSize === 'hero_banner') return 'aspect-[3/4]';
  return 'aspect-[4/3]';
}

function ToolbarToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex h-8 items-center rounded-[999px] border px-3 text-xs font-semibold transition-colors',
        active
          ? 'border-accent-primary bg-accent-primary text-white'
          : 'border-black/10 bg-white text-gray-700 hover:bg-gray-50'
      )}
    >
      {label}
    </button>
  );
}

function ToolbarSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 min-w-[112px] rounded-[10px] border border-black/10 bg-white px-3 text-sm text-gray-700 outline-none transition-colors focus:border-accent-primary"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

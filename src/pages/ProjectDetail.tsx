import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Sparkles, Star, X } from 'lucide-react';
import clsx from 'clsx';

import { useToast } from '../components/ToastProvider';
import {
  CURRENT_USER_NAME,
  type ManagedProject,
  type ProjectTemplatePlacement,
  type ProjectFormState,
  formatTeamName,
  getLevel2Options,
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

const INPUT_CLASSNAME =
  'h-11 w-full rounded-[10px] border border-black/10 bg-white px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-black/30';

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

const INITIAL_FORM: ProjectFormState = {
  name: '',
  businessSystemType: '',
  businessProjectId: '',
  teamName: '',
  orgLevel1: '',
  orgLevel2: '',
  creatorName: CURRENT_USER_NAME,
  permissionScope: 'self',
};

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
  const [isScopeModalOpen, setIsScopeModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<LayerTemplate | null>(null);
  const [templateQuery, setTemplateQuery] = useState('');
  const [templateSortMode, setTemplateSortMode] = useState<SortMode>('latest');
  const [templateImageSize, setTemplateImageSize] = useState<ImageSize | ''>('');
  const [templateColor, setTemplateColor] = useState<ToneColor | null>(null);
  const [templateActivityType, setTemplateActivityType] = useState<ActivityType | ''>('');
  const [templateBenefitType, setTemplateBenefitType] = useState<BenefitType | ''>('');
  const [templateScope, setTemplateScope] = useState<LibraryScope | ''>('');
  const [templateOnlyFavorites, setTemplateOnlyFavorites] = useState(false);
  const [form, setForm] = useState<ProjectFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormState, string>>>({});
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

  const level1Options = useMemo(() => ['深圳分行', '广州分行', '总行数字金融'], []);
  const level2Options = getLevel2Options(form.orgLevel1);

  const openScopeModal = () => {
    if (!project) return;
    setForm({
      name: '',
      businessSystemType: '',
      businessProjectId: '',
      teamName: project.teamName,
      orgLevel1: project.orgLevel1,
      orgLevel2: project.orgLevel2,
      creatorName: project.creatorName,
      permissionScope: project.permissionScope,
    });
    setErrors({});
    setIsScopeModalOpen(true);
  };

  const closeScopeModal = () => {
    setIsScopeModalOpen(false);
    setErrors({});
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!project) return;

    const nextErrors: Partial<Record<keyof ProjectFormState, string>> = {};
    if (!form.permissionScope) nextErrors.permissionScope = '请选择操作权限';
    if (!form.orgLevel1) nextErrors.orgLevel1 = '请选择一级机构';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const updated: ManagedProject = {
      ...project,
      permissionScope: form.permissionScope,
      orgLevel1: form.orgLevel1,
      orgLevel2: form.orgLevel2,
      teamName: formatTeamName(form.orgLevel1, form.orgLevel2),
    };

    setProjects((current) => current.map((p) => (p.id === updated.id ? updated : p)));
    toast.show('已调整项目归属（模拟）');
    closeScopeModal();
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
      <div className="min-h-screen bg-white px-8 py-8 md:px-12">
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
    <div className="min-h-screen bg-white px-8 py-8 md:px-12">
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
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-900"
            >
              <Plus size={16} />
              模板选用
            </button>
            <button
              type="button"
              onClick={openScopeModal}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-black/10 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Sparkles size={16} />
              项目归属调整
            </button>
          </div>
        </div>

        <section className="overflow-hidden border border-black/5 bg-white">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3 md:px-6">
            <div className="text-sm font-semibold text-gray-950">项目信息</div>
            <div className="text-xs text-gray-400">共 8 项</div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3">
            <KeyField label="项目名称" value={project.name} />
            <KeyField label="关联业务系统类型" value={project.businessSystemType} />
            <KeyField label="关联业务项目ID" value={project.businessProjectId || '未填写'} />
            <KeyField label="项目归属" value={project.permissionScope === 'team' ? '团队项目' : '个人项目'} />
            <KeyField label="归属团队" value={project.teamName} />
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
            <KeyField label="已添加模板" value={`${assignedTemplateCards.length} 个`} />
          </div>
        </section>

        <section className="border border-black/5 bg-[#fafafa] p-4 md:p-6">
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
                      <article key={`${item.templateId}-${item.flowId}`} className="group overflow-hidden border border-black/10 bg-white">
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
                        <div className="space-y-1.5 px-3 py-3">
                          <div className="text-xs font-semibold text-gray-900 line-clamp-2">{item.template.name}</div>
                          <div className="text-[11px] text-gray-500 line-clamp-1">{item.template.projectName}</div>
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
                  className="h-11 w-full border border-black/10 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-black/30"
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
                      ? 'border-black bg-black text-white'
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
                <div className="flex min-h-[240px] items-center justify-center border border-dashed border-black/10 bg-[#fafafa] text-center">
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

      {isScopeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/30" onClick={closeScopeModal} />
          <div className="relative z-10 w-full max-w-3xl rounded-[18px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-5 md:px-8">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Project Assignment</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-gray-950">项目归属调整</h2>
              </div>
              <button
                type="button"
                onClick={closeScopeModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-transparent text-gray-400 transition-colors hover:border-black/10 hover:text-gray-800"
                aria-label="关闭项目归属调整弹窗"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="grid gap-6 px-6 py-6 md:grid-cols-2 md:px-8 md:py-8">
                <Field label="项目归属" required error={errors.orgLevel1} className="md:col-span-2">
                  <div className="space-y-2">
                    <div className="grid gap-4 md:grid-cols-2">
                      <select
                        value={form.orgLevel1}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            orgLevel1: event.target.value,
                            orgLevel2: '',
                            teamName: '',
                          }))
                        }
                        className={INPUT_CLASSNAME}
                      >
                        <option value="">请选择一级机构</option>
                        {level1Options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>

                      <select
                        value={form.orgLevel2}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            orgLevel2: event.target.value,
                            teamName: formatTeamName(current.orgLevel1, event.target.value),
                          }))
                        }
                        className={clsx(
                          INPUT_CLASSNAME,
                          !form.orgLevel1 && 'cursor-not-allowed bg-[#f7f7f8] text-gray-400'
                        )}
                        disabled={!form.orgLevel1}
                      >
                        <option value="">
                          {form.orgLevel1 ? '请选择二级机构（可选）' : '请先选择一级机构'}
                        </option>
                        {level2Options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="text-xs text-gray-400">一级机构必选，二级机构可选</div>
                  </div>
                </Field>

                <Field label="操作权限" required error={errors.permissionScope} className="md:col-span-2">
                  <div className="space-y-3">
                    <PermissionOption
                      title="仅限本人操作"
                      description="项目归入个人空间，仅本人可操作"
                      checked={form.permissionScope === 'self'}
                      onChange={() =>
                        setForm((current) => ({
                          ...current,
                          permissionScope: 'self',
                        }))
                      }
                    />
                    <PermissionOption
                      title="归属团队可操作"
                      description="项目归入团队空间，团队成员可协作操作"
                      checked={form.permissionScope === 'team'}
                      onChange={() =>
                        setForm((current) => {
                          if (!current.orgLevel1) {
                            setErrors((prev) => ({ ...prev, orgLevel1: '请选择一级机构' }));
                            toast.show('请先选择项目归属（一级机构）');
                            return current;
                          }
                          return { ...current, permissionScope: 'team' };
                        })
                      }
                    />
                  </div>
                </Field>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-black/5 px-6 py-4 md:px-8">
                <button
                  type="button"
                  onClick={closeScopeModal}
                  className="inline-flex h-10 items-center rounded-[10px] border border-black/10 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center rounded-[10px] bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-900"
                >
                  保存归属
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                className="inline-flex h-10 items-center rounded-[10px] bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-900"
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

function Field({
  label,
  required,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={clsx('block', className)}>
      <div className="mb-2 flex items-center gap-1 text-sm font-medium text-gray-800">
        <span>{label}</span>
        {required ? <span className="text-red-500">*</span> : null}
      </div>
      {children}
      {error ? <div className="mt-2 text-xs text-red-500">{error}</div> : null}
    </label>
  );
}

function PermissionOption({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={clsx(
        'flex cursor-pointer items-start gap-3 rounded-[12px] border px-4 py-3 transition-colors',
        checked ? 'border-black bg-black/[0.02]' : 'border-black/10 hover:bg-gray-50'
      )}
    >
      <input type="radio" checked={checked} onChange={onChange} className="mt-1" />
      <div>
        <div className="text-sm font-medium text-gray-900">{title}</div>
        <div className="mt-1 text-xs text-gray-500">{description}</div>
      </div>
    </label>
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
        active ? 'border-black bg-black text-white' : 'border-black/10 bg-white text-gray-700 hover:bg-gray-50'
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
      className="h-10 min-w-[112px] rounded-[10px] border border-black/10 bg-white px-3 text-sm text-gray-700 outline-none transition-colors focus:border-black/30"
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

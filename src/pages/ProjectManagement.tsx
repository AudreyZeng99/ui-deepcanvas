import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ChevronRight, Plus, Search, Users, X } from 'lucide-react';
import clsx from 'clsx';

import { useToast } from '../components/ToastProvider';
import {
  CURRENT_USER_NAME,
  type ManagedProject,
  type ProjectFormState,
  formatTeamName,
  getLevel2Options,
  readManagedProjects,
  writeManagedProjects,
} from '../utils/managedProjects';

type ProjectTab = 'personal' | 'team';

const BUSINESS_SYSTEM_OPTIONS = ['零售银行', '信用卡中心', '财富管理', '营销中台'];
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

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ProjectManagement() {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<ProjectTab>('personal');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBusinessSystemType, setFilterBusinessSystemType] = useState('');
  const [filterBusinessProjectId, setFilterBusinessProjectId] = useState('');
  const [projects, setProjects] = useState<ManagedProject[]>(() => readManagedProjects());
  const [form, setForm] = useState<ProjectFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormState, string>>>({});

  useEffect(() => {
    writeManagedProjects(projects);
  }, [projects]);

  const personalProjects = useMemo(
    () => projects.filter((project) => project.permissionScope === 'self'),
    [projects]
  );
  const teamProjects = useMemo(
    () => projects.filter((project) => project.permissionScope === 'team'),
    [projects]
  );

  const businessProjectIdOptions = useMemo(() => {
    const source = activeTab === 'personal' ? personalProjects : teamProjects;
    const next = new Set<string>();
    source
      .filter((project) => (filterBusinessSystemType ? project.businessSystemType === filterBusinessSystemType : true))
      .forEach((project) => {
        if (project.businessProjectId) next.add(project.businessProjectId);
      });
    return Array.from(next).sort((a, b) => a.localeCompare(b));
  }, [activeTab, filterBusinessSystemType, personalProjects, teamProjects]);

  const visibleProjects = useMemo(() => {
    const source = activeTab === 'personal' ? personalProjects : teamProjects;
    const query = searchQuery.trim().toLowerCase();
    return source
      .filter((project) =>
        query
          ? [
              project.name,
              project.businessProjectId,
              project.businessSystemType,
              project.teamName,
              project.creatorName,
            ]
              .join(' ')
              .toLowerCase()
              .includes(query)
          : true
      )
      .filter((project) =>
        filterBusinessSystemType ? project.businessSystemType === filterBusinessSystemType : true
      )
      .filter((project) => (filterBusinessProjectId ? project.businessProjectId === filterBusinessProjectId : true));
  }, [activeTab, filterBusinessProjectId, filterBusinessSystemType, personalProjects, searchQuery, teamProjects]);

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrors({});
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    resetForm();
  };

  const openCreateModal = () => {
    setIsFormModalOpen(true);
    setForm(INITIAL_FORM);
    setErrors({});
  };
  const level1Options = useMemo(() => ['深圳分行', '广州分行', '总行数字金融'], []);
  const level2Options = getLevel2Options(form.orgLevel1);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof ProjectFormState, string>> = {};
    if (!form.name.trim()) nextErrors.name = '请输入项目名称';
    if (!form.businessSystemType) nextErrors.businessSystemType = '请选择关联业务系统类型';
    if (!form.creatorName.trim()) nextErrors.creatorName = '项目创建人不能为空';
    if (!form.permissionScope) nextErrors.permissionScope = '请选择操作权限';
    if (!form.orgLevel1) nextErrors.orgLevel1 = '请选择一级机构';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const newProject: ManagedProject = {
      id: `project-${Date.now()}`,
      name: form.name.trim(),
      businessSystemType: form.businessSystemType,
      businessProjectId: form.businessProjectId.trim(),
      teamName: formatTeamName(form.orgLevel1, form.orgLevel2),
      orgLevel1: form.orgLevel1,
      orgLevel2: form.orgLevel2,
      creatorName: form.creatorName.trim(),
      permissionScope: form.permissionScope,
      createdAt: Date.now(),
      assignedTemplates: [],
    };

    setProjects((current) => [newProject, ...current]);
    setActiveTab(newProject.permissionScope === 'team' ? 'team' : 'personal');
    toast.show('已新建项目（模拟）');
    closeFormModal();
  };

  return (
    <div className="min-h-screen bg-background px-8 py-8 md:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-black/5 pb-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <h1 className="text-[34px] font-semibold leading-none tracking-[-0.04em] text-gray-950">项目</h1>
          </div>

          <div className="flex flex-col items-start gap-4 md:items-end">
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-accent-primary px-4 text-sm font-semibold text-white transition-colors hover:opacity-90"
            >
              <Plus size={16} />
              新建项目
            </button>
          </div>
        </header>

        <section className="pt-6">
          <div className="pb-4">
            <div className="flex max-w-md items-center gap-2">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="搜索项目名称 / 业务项目ID / 归属团队"
                  className="h-10 w-full rounded-[10px] border border-black/10 bg-background pl-9 pr-3 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-accent-primary"
                />
              </div>
              <button
                type="button"
                onClick={() => setSearchQuery((current) => current.trim())}
                className="inline-flex h-10 items-center rounded-[10px] bg-accent-primary px-4 text-sm font-semibold text-white transition-colors hover:opacity-90"
              >
                搜索
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-b border-black/5 pb-4 pt-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-8">
              <TabButton
                label="个人项目"
                isActive={activeTab === 'personal'}
                count={personalProjects.length}
                onClick={() => setActiveTab('personal')}
              />
              <TabButton
                label="团队项目"
                isActive={activeTab === 'team'}
                count={teamProjects.length}
                onClick={() => setActiveTab('team')}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 border-b border-black/5 py-4 md:flex-row md:items-center">
            <select
              value={filterBusinessSystemType}
              onChange={(event) => setFilterBusinessSystemType(event.target.value)}
              className="h-10 min-w-[180px] rounded-[10px] border border-black/10 bg-background px-3 text-sm text-gray-700 outline-none transition-colors focus:border-accent-primary"
            >
              <option value="">关联业务系统类型</option>
              {BUSINESS_SYSTEM_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={filterBusinessProjectId}
              onChange={(event) => setFilterBusinessProjectId(event.target.value)}
              className="h-10 min-w-[220px] rounded-[10px] border border-black/10 bg-background px-3 text-sm text-gray-700 outline-none transition-colors focus:border-accent-primary"
            >
              <option value="">关联业务项目ID</option>
              {businessProjectIdOptions.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>

          {visibleProjects.length === 0 ? (
            <EmptyState activeTab={activeTab} onCreate={openCreateModal} />
          ) : (
            <div className="pt-4">
              <div className="hidden grid-cols-[minmax(240px,1.4fr)_1fr_1fr_1.1fr_1.1fr_120px] gap-6 border-b border-black/5 pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 md:grid">
                <span>项目名称</span>
                <span>业务项目ID</span>
                <span>业务系统</span>
                <span>归属团队</span>
                <span>创建人</span>
                <span className="text-right">查看</span>
              </div>

              <div>
                {visibleProjects.map((project) => (
                  <article
                    key={project.id}
                    className="border-b border-black/5 py-4 transition-colors hover:bg-black/[0.015] cursor-pointer"
                    onClick={() => navigate(`/project-management/${encodeURIComponent(project.id)}`)}
                  >
                    <div className="hidden grid-cols-[minmax(240px,1.4fr)_1fr_1fr_1.1fr_1.1fr_120px] gap-6 md:grid">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center border border-black/10 bg-background text-gray-700">
                            {project.permissionScope === 'team' ? <Users size={16} /> : <Briefcase size={16} />}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-gray-950">{project.name}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">{project.businessProjectId || '未填写'}</div>
                      <div className="flex items-center text-sm text-gray-600">{project.businessSystemType}</div>
                      <div className="flex items-center text-sm text-gray-600">{project.teamName}</div>
                      <div className="flex flex-col justify-center text-sm text-gray-600">
                        <span>{project.creatorName}</span>
                        <span className="mt-1 text-xs text-gray-400">{formatDate(project.createdAt)}</span>
                      </div>
                      <div className="flex items-center justify-end">
                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-black/10 text-gray-600">
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 md:hidden">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-base font-semibold text-gray-950">{project.name}</div>
                          <div className="mt-1 text-xs text-gray-400">
                            {project.permissionScope === 'team' ? '团队项目' : '个人项目'}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">{formatDate(project.createdAt)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <MobileDetail label="项目名称" value={project.name} />
                        <MobileDetail label="业务项目ID" value={project.businessProjectId || '未填写'} />
                        <MobileDetail label="业务系统" value={project.businessSystemType} />
                        <MobileDetail label="归属团队" value={project.teamName} />
                        <MobileDetail label="创建人" value={project.creatorName} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/30" onClick={closeFormModal} />
          <div className="relative z-10 w-full max-w-3xl rounded-[18px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-5 md:px-8">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Create Project</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-gray-950">新建项目</h2>
              </div>
              <button
                type="button"
                onClick={closeFormModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-transparent text-gray-400 transition-colors hover:border-black/10 hover:text-gray-800"
                aria-label="关闭新建项目弹窗"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 px-6 py-6 md:grid-cols-2 md:px-8 md:py-8">
                <Field label="项目名称" required error={errors.name}>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="请输入项目名称"
                    className={INPUT_CLASSNAME}
                  />
                </Field>

                <Field label="关联业务系统类型" required error={errors.businessSystemType}>
                  <select
                    value={form.businessSystemType}
                    onChange={(event) => setForm((current) => ({ ...current, businessSystemType: event.target.value }))}
                    className={INPUT_CLASSNAME}
                  >
                    <option value="">请选择系统类型</option>
                    {BUSINESS_SYSTEM_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="关联业务项目ID">
                  <input
                    type="text"
                    value={form.businessProjectId}
                    onChange={(event) => setForm((current) => ({ ...current, businessProjectId: event.target.value }))}
                    placeholder="请输入业务项目ID"
                    className={INPUT_CLASSNAME}
                  />
                </Field>

                <Field label="项目创建人" required error={errors.creatorName}>
                  <input
                    type="text"
                    value={form.creatorName}
                    readOnly
                    className={`${INPUT_CLASSNAME} bg-[#fafafa] text-gray-500`}
                  />
                </Field>

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
                          return {
                            ...current,
                            permissionScope: 'team',
                          };
                        })
                      }
                    />
                  </div>
                </Field>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-black/5 px-6 py-4 md:px-8">
                <button
                  type="button"
                  onClick={closeFormModal}
                  className="inline-flex h-10 items-center rounded-[10px] border border-black/10 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center rounded-[10px] bg-accent-primary px-4 text-sm font-semibold text-white transition-colors hover:opacity-90"
                >
                  创建项目
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({
  label,
  isActive,
  count,
  onClick,
}: {
  label: string;
  isActive: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'relative inline-flex items-center gap-2 pb-3 text-sm font-medium transition-colors',
        isActive ? 'text-gray-950' : 'text-gray-400 hover:text-gray-700'
      )}
    >
      <span>{label}</span>
      <span className={clsx('text-xs', isActive ? 'text-gray-500' : 'text-gray-300')}>{count}</span>
      <span
        className={clsx(
          'absolute bottom-0 left-0 h-px w-full transition-colors',
          isActive ? 'bg-accent-primary' : 'bg-transparent'
        )}
      />
    </button>
  );
}

function EmptyState({
  activeTab,
  onCreate,
}: {
  activeTab: ProjectTab;
  onCreate: () => void;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center border-b border-black/5 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center border border-black/10 bg-[#fafafa] text-gray-700">
        {activeTab === 'personal' ? <Briefcase size={28} /> : <Users size={28} />}
      </div>
      <h2 className="mt-6 text-[28px] font-semibold tracking-[-0.03em] text-gray-950">
        {activeTab === 'personal' ? '个人项目为空' : '团队项目为空'}
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
        当前分页还没有任何项目。点击下方按钮新建项目，填写信息后会自动展示在对应列表中。
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-7 inline-flex h-10 items-center gap-2 rounded-[10px] bg-accent-primary px-4 text-sm font-semibold text-white transition-colors hover:opacity-90"
      >
        <Plus size={16} />
        新建项目
      </button>
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

function MobileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] uppercase tracking-[0.12em] text-gray-400">{label}</div>
      <div className="mt-1 truncate text-sm text-gray-700">{value}</div>
    </div>
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
        checked ? 'border-accent-primary bg-accent-primary/5' : 'border-black/10 hover:bg-gray-50'
      )}
    >
      <input type="radio" checked={checked} onChange={onChange} className="mt-1 accent-accent-primary" />
      <div>
        <div className="text-sm font-medium text-gray-900">{title}</div>
        <div className="mt-1 text-xs text-gray-500">{description}</div>
      </div>
    </label>
  );
}

const INPUT_CLASSNAME =
  'h-11 w-full rounded-[10px] border border-black/10 bg-white px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-accent-primary';

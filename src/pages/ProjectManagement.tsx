import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { Briefcase, FolderOpen, Plus, Users, X } from 'lucide-react';
import clsx from 'clsx';

type ProjectTab = 'personal' | 'team';
type PermissionScope = 'self' | 'team';

type ManagedProject = {
  id: string;
  name: string;
  businessSystemType: string;
  businessProjectId: string;
  teamName: string;
  creatorName: string;
  permissionScope: PermissionScope;
  createdAt: number;
};

type ProjectFormState = {
  name: string;
  businessSystemType: string;
  businessProjectId: string;
  teamName: string;
  creatorName: string;
  permissionScope: PermissionScope;
};

const STORAGE_KEY = 'trae_deepcanvas_project_management_v1';
const CURRENT_USER_NAME = '当前用户';
const ORG_CODE = 'orgcode';
const ORG_NAME = 'orgname';

const BUSINESS_SYSTEM_OPTIONS = ['零售银行', '信用卡中心', '财富管理', '营销中台'];
const TEAM_OPTIONS = ['品牌设计组', '增长运营组', '活动策划组', '平台产品组'];

const INITIAL_FORM: ProjectFormState = {
  name: '',
  businessSystemType: '',
  businessProjectId: '',
  teamName: '',
  creatorName: CURRENT_USER_NAME,
  permissionScope: 'self',
};

function readStoredProjects() {
  if (typeof window === 'undefined') return [] as ManagedProject[];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [] as ManagedProject[];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ManagedProject[]) : [];
  } catch {
    return [] as ManagedProject[];
  }
}

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
  const [activeTab, setActiveTab] = useState<ProjectTab>('personal');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState<ManagedProject[]>(() => readStoredProjects());
  const [form, setForm] = useState<ProjectFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormState, string>>>({});

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects]);

  const personalProjects = useMemo(
    () => projects.filter((project) => project.permissionScope === 'self'),
    [projects]
  );
  const teamProjects = useMemo(
    () => projects.filter((project) => project.permissionScope === 'team'),
    [projects]
  );

  const visibleProjects = activeTab === 'personal' ? personalProjects : teamProjects;

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrors({});
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    resetForm();
  };

  const openModal = () => {
    setIsCreateModalOpen(true);
    setForm(INITIAL_FORM);
    setErrors({});
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Partial<Record<keyof ProjectFormState, string>> = {};
    if (!form.name.trim()) nextErrors.name = '请输入项目名称';
    if (!form.businessSystemType) nextErrors.businessSystemType = '请选择关联业务系统类型';
    if (!form.teamName) nextErrors.teamName = '请选择归属团队';
    if (!form.creatorName.trim()) nextErrors.creatorName = '项目创建人不能为空';
    if (!form.permissionScope) nextErrors.permissionScope = '请选择操作权限';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const newProject: ManagedProject = {
      id: `project-${Date.now()}`,
      name: form.name.trim(),
      businessSystemType: form.businessSystemType,
      businessProjectId: form.businessProjectId.trim(),
      teamName: form.teamName,
      creatorName: form.creatorName.trim(),
      permissionScope: form.permissionScope,
      createdAt: Date.now(),
    };

    setProjects((current) => [newProject, ...current]);
    setActiveTab(newProject.permissionScope === 'team' ? 'team' : 'personal');
    closeModal();
  };

  return (
    <div className="min-h-screen bg-white px-8 py-8 md:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-black/5 pb-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
              <FolderOpen size={14} />
              Project Space
            </div>
            <h1 className="text-[34px] font-semibold leading-none tracking-[-0.04em] text-gray-950">项目</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
              用更清晰的方式管理个人项目和团队项目。初始状态为空，创建后自动进入对应分页。
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 md:items-end">
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.16em] text-gray-400">orgcode</span>
                <span className="font-medium text-gray-900">{ORG_CODE}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.16em] text-gray-400">orgname</span>
                <span className="font-medium text-gray-900">{ORG_NAME}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={openModal}
              className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-black/10 px-4 text-sm font-semibold text-gray-900 transition-colors hover:bg-black hover:text-white"
            >
              <Plus size={16} />
              新建项目
            </button>
          </div>
        </header>

        <section className="pt-6">
          <div className="flex flex-col gap-4 border-b border-black/5 pb-4 md:flex-row md:items-center md:justify-between">
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

            <button
              type="button"
              onClick={openModal}
              className="inline-flex h-9 items-center gap-2 self-start rounded-[10px] border border-black/10 px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Plus size={15} />
              新建项目
            </button>
          </div>

          {visibleProjects.length === 0 ? (
            <EmptyState activeTab={activeTab} onCreate={openModal} />
          ) : (
            <div className="pt-4">
              <div className="hidden grid-cols-[minmax(220px,1.6fr)_1fr_1fr_1fr_1fr] gap-6 border-b border-black/5 pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400 md:grid">
                <span>项目</span>
                <span>业务系统</span>
                <span>归属团队</span>
                <span>创建人</span>
                <span>权限 / 时间</span>
              </div>

              <div>
                {visibleProjects.map((project) => (
                  <article
                    key={project.id}
                    className="border-b border-black/5 py-4 transition-colors hover:bg-black/[0.015]"
                  >
                    <div className="hidden grid-cols-[minmax(220px,1.6fr)_1fr_1fr_1fr_1fr] gap-6 md:grid">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center border border-black/10 bg-[#fafafa] text-gray-700">
                            {project.permissionScope === 'team' ? <Users size={16} /> : <Briefcase size={16} />}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-gray-950">{project.name}</div>
                            <div className="mt-1 truncate text-xs text-gray-400">
                              业务项目ID：{project.businessProjectId || '未填写'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">{project.businessSystemType}</div>
                      <div className="flex items-center text-sm text-gray-600">{project.teamName}</div>
                      <div className="flex items-center text-sm text-gray-600">{project.creatorName}</div>
                      <div className="flex flex-col justify-center text-sm text-gray-600">
                        <span>{project.permissionScope === 'team' ? '团队可操作' : '仅本人'}</span>
                        <span className="mt-1 text-xs text-gray-400">{formatDate(project.createdAt)}</span>
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
                        <MobileDetail label="业务系统" value={project.businessSystemType} />
                        <MobileDetail label="归属团队" value={project.teamName} />
                        <MobileDetail label="创建人" value={project.creatorName} />
                        <MobileDetail label="操作权限" value={project.permissionScope === 'team' ? '团队可操作' : '仅本人'} />
                        <MobileDetail label="业务项目ID" value={project.businessProjectId || '未填写'} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/30" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-3xl rounded-[18px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-5 md:px-8">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Create Project</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-gray-950">新建项目</h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
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

                <Field label="归属团队" required error={errors.teamName}>
                  <select
                    value={form.teamName}
                    onChange={(event) => setForm((current) => ({ ...current, teamName: event.target.value }))}
                    className={INPUT_CLASSNAME}
                  >
                    <option value="">请选择归属团队</option>
                    {TEAM_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="项目创建人" required error={errors.creatorName}>
                  <input
                    type="text"
                    value={form.creatorName}
                    onChange={(event) => setForm((current) => ({ ...current, creatorName: event.target.value }))}
                    className={INPUT_CLASSNAME}
                  />
                </Field>

                <Field label="操作权限" required error={errors.permissionScope}>
                  <div className="space-y-3">
                    <PermissionOption
                      title="仅限本人操作"
                      description="创建后归入个人项目"
                      checked={form.permissionScope === 'self'}
                      onChange={() => setForm((current) => ({ ...current, permissionScope: 'self' }))}
                    />
                    <PermissionOption
                      title="归属团队可操作"
                      description="创建后归入团队项目"
                      checked={form.permissionScope === 'team'}
                      onChange={() => setForm((current) => ({ ...current, permissionScope: 'team' }))}
                    />
                  </div>
                </Field>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-black/5 px-6 py-4 md:px-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex h-10 items-center rounded-[10px] border border-black/10 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center rounded-[10px] bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-900"
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
          isActive ? 'bg-gray-900' : 'bg-transparent'
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
        className="mt-7 inline-flex h-10 items-center gap-2 rounded-[10px] border border-black/10 px-4 text-sm font-semibold text-gray-900 transition-colors hover:bg-black hover:text-white"
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
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
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

const INPUT_CLASSNAME =
  'h-11 w-full rounded-[10px] border border-black/10 bg-white px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-black/30';

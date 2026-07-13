export type PermissionScope = 'self' | 'team';

export type ProjectTemplatePlacement = {
  templateId: string;
  flowId: string;
  outputCount: number;
  addedAt: number;
};

export type ManagedProject = {
  id: string;
  name: string;
  businessSystemType: string;
  businessProjectId: string;
  teamName: string;
  orgLevel1: string;
  orgLevel2: string;
  creatorName: string;
  permissionScope: PermissionScope;
  createdAt: number;
  configuredLayerTemplateId?: string;
  assignedTemplates: ProjectTemplatePlacement[];
};

export type ProjectFormState = {
  name: string;
  businessSystemType: string;
  businessProjectId: string;
  teamName: string;
  orgLevel1: string;
  orgLevel2: string;
  creatorName: string;
  permissionScope: PermissionScope;
};

export const MANAGED_PROJECTS_STORAGE_KEY = 'trae_deepcanvas_project_management_v1';
export const CURRENT_USER_NAME = '当前用户';

export const ORG_TREE = [
  {
    level1: '深圳分行',
    level2: ['品牌设计组', '增长运营组', '活动策划组', '平台产品组'],
  },
  {
    level1: '广州分行',
    level2: ['零售营销组', '财富运营组', '渠道支持组'],
  },
  {
    level1: '总行数字金融',
    level2: ['权益运营组', '设计中台组', '用户增长组'],
  },
] as const;

export function formatTeamName(orgLevel1: string, orgLevel2: string) {
  if (orgLevel1 && orgLevel2) return `${orgLevel1} / ${orgLevel2}`;
  return orgLevel1 || orgLevel2 || '';
}

export function getLevel2Options(level1: string) {
  return ORG_TREE.find((item) => item.level1 === level1)?.level2 ?? [];
}

export function readManagedProjects() {
  if (typeof window === 'undefined') return [] as ManagedProject[];
  try {
    const raw = window.localStorage.getItem(MANAGED_PROJECTS_STORAGE_KEY);
    if (!raw) return [] as ManagedProject[];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [] as ManagedProject[];
    return parsed.map((item) => {
      const orgLevel1 = typeof item.orgLevel1 === 'string' ? item.orgLevel1 : '';
      const orgLevel2 = typeof item.orgLevel2 === 'string' ? item.orgLevel2 : '';
      return {
        id: item.id,
        name: item.name,
        businessSystemType: item.businessSystemType,
        businessProjectId: item.businessProjectId,
        teamName:
          typeof item.teamName === 'string' && item.teamName
            ? item.teamName
            : formatTeamName(orgLevel1, orgLevel2),
        orgLevel1,
        orgLevel2,
        creatorName: item.creatorName,
        permissionScope: item.permissionScope === 'team' ? 'team' : 'self',
        createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
        configuredLayerTemplateId:
          typeof item.configuredLayerTemplateId === 'string' ? item.configuredLayerTemplateId : undefined,
        assignedTemplates: Array.isArray(item.assignedTemplates)
          ? item.assignedTemplates
              .filter((tpl: unknown) => typeof tpl === 'object' && tpl !== null && typeof (tpl as { templateId?: unknown }).templateId === 'string')
              .map((tpl: unknown) => {
                const placement = tpl as {
                  templateId: string;
                  flowId?: unknown;
                  outputCount?: unknown;
                  addedAt?: unknown;
                };
                return {
                  templateId: placement.templateId,
                  flowId: typeof placement.flowId === 'string' ? placement.flowId : `flow-${placement.templateId}`,
                  outputCount: typeof placement.outputCount === 'number' ? placement.outputCount : 1,
                  addedAt: typeof placement.addedAt === 'number' ? placement.addedAt : Date.now(),
                };
              })
          : [],
      } satisfies ManagedProject;
    });
  } catch {
    return [] as ManagedProject[];
  }
}

export function writeManagedProjects(next: ManagedProject[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MANAGED_PROJECTS_STORAGE_KEY, JSON.stringify(next));
}

export function canManageTeamProject(project: ManagedProject) {
  return project.permissionScope === 'team' && project.creatorName === CURRENT_USER_NAME;
}

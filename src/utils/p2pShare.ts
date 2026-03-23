import type { Project } from '../context/ProjectContext';

export type P2PShareKind = 'inspiration' | 'public_template' | 'personal_design';

export type InspirationSharePayload = {
  title: string;
  prompt: string;
  imageUrl?: string;
};

export type TemplateSharePayload = {
  title: string;
  previewImageUrl?: string;
  width: number;
  height: number;
  elements: any[];
  sourceLabel: '公共模板';
};

export type PersonalDesignSharePayload = {
  project: Project;
};

export type P2PShareRecord =
  | {
      code: string;
      kind: 'inspiration';
      payload: InspirationSharePayload;
      createdAt: number;
    }
  | {
      code: string;
      kind: 'public_template';
      payload: TemplateSharePayload;
      createdAt: number;
    }
  | {
      code: string;
      kind: 'personal_design';
      payload: PersonalDesignSharePayload;
      createdAt: number;
    };

export const P2P_SHARE_STORAGE_KEY = 'trae_deepcanvas_p2p_share_codes_v1';

export function safeParseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function normalizeP2PCode(input: string) {
  return input.trim().toUpperCase();
}

export function generateShareCode(existingCodes: Set<string>) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let tries = 0;
  while (tries < 20) {
    const code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    if (!existingCodes.has(code)) return code;
    tries += 1;
  }
  return `${Date.now().toString(36).slice(-8)}`.toUpperCase();
}

export function getShareMap() {
  return safeParseJson<Record<string, any>>(localStorage.getItem(P2P_SHARE_STORAGE_KEY), {});
}

export function setShareMap(map: Record<string, any>) {
  localStorage.setItem(P2P_SHARE_STORAGE_KEY, JSON.stringify(map));
}

export function createP2PShareRecord(record: Omit<P2PShareRecord, 'code' | 'createdAt'>) {
  const map = getShareMap();
  const existing = new Set(Object.keys(map));
  const code = generateShareCode(existing);
  const full: P2PShareRecord = { ...(record as any), code, createdAt: Date.now() };
  map[code] = full;
  setShareMap(map);
  return full;
}

export function resolveP2PShareRecord(codeInput: string): P2PShareRecord | null {
  const code = normalizeP2PCode(codeInput);
  if (!code) return null;
  const map = getShareMap();
  const raw = map[code];
  if (!raw) return null;

  if (raw.kind === 'inspiration' && raw.payload?.prompt) return raw as P2PShareRecord;
  if (raw.kind === 'public_template' && raw.payload?.elements) return raw as P2PShareRecord;
  if (raw.kind === 'personal_design' && raw.payload?.project) return raw as P2PShareRecord;

  if (raw.project) {
    const legacyProject = raw.project as Project;
    const legacy: P2PShareRecord = {
      code,
      createdAt: raw.createdAt || Date.now(),
      kind: 'personal_design',
      payload: { project: legacyProject },
    };
    return legacy;
  }

  return null;
}

export function makeTemplateElements(previewImageUrl: string | undefined, width: number, height: number) {
  if (!previewImageUrl) return [];
  return [
    {
      id: crypto.randomUUID(),
      type: 'image',
      src: previewImageUrl,
      props: {
        x: 0,
        y: 0,
        width,
        height,
        rotation: 0,
        opacity: 1,
      },
      visible: true,
      locked: true,
    },
  ];
}

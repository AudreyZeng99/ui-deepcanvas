import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  Download,
  Loader2,
  Palette,
  Package,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import clsx from 'clsx';

import ToolLayout from './ToolLayout';
import { useToast } from '../../components/ToastProvider';
import { ELEMENT_OPTIONS, COLOR_OPTIONS, getCombo, type ElementCombo } from '../../utils/allElements';

type Phase = 'config' | 'producing' | 'done';

type ResultStatus = 'pending' | 'generating' | 'done';

type ResultItem = {
  id: string;
  element_id: string;
  color_id: string;
  element_label: string;
  color_label: string;
  background: string;
  main: string;
  secondary: string;
  accent: string;
  prompt: string;
  status: ResultStatus;
  imageUrl: string | null;
};

const ELEMENT_EMOJI: Record<string, string> = {
  open_gift_box: '🎁',
  closed_gift_box: '🎁',
  glowing_gift_box: '✨',
  filled_gift_box: '🎁',
  red_packet: '🧧',
  card_wallet: '💳',
  growth_arrow: '📈',
  piggy_bank: '🐷',
  empty_cart: '🛒',
  appliance_cart: '🛒',
  daily_goods_cart: '🛒',
  beauty_cart: '🛒',
  shield: '🛡️',
  calendar: '📅',
  coupon: '🎫',
  appliances: '📺',
  daily_goods: '🧴',
  beauty_products: '💄',
  movie_products: '🎬',
};

function buildMockImageUrl(combo: ElementCombo, main: string, secondary: string, accent: string): string {
  const elementLabel = ELEMENT_OPTIONS.find((e) => e.id === combo.element_id)?.label ?? combo.element_id;
  const emoji = ELEMENT_EMOJI[combo.element_id] ?? '🎨';
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="bg" cx="50%" cy="42%" r="70%">
      <stop offset="0%" stop-color="${main}" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="${combo.background}" stop-opacity="1"/>
    </radialGradient>
    <radialGradient id="core" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${secondary}" stop-opacity="0.95"/>
      <stop offset="60%" stop-color="${main}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0.3"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <circle cx="512" cy="470" r="280" fill="url(#core)" opacity="0.85"/>
  <circle cx="512" cy="470" r="200" fill="${main}" opacity="0.55"/>
  <text x="512" y="500" font-size="240" text-anchor="middle" dominant-baseline="central">${emoji}</text>
  <text x="512" y="780" font-size="44" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-weight="700" fill="#333" text-anchor="middle">${elementLabel} · ${combo.color_label}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function svgDataUrlToPng(svgDataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('no ctx'));
        return;
      }
      ctx.drawImage(img, 0, 0, 1024, 1024);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = svgDataUrl;
  });
}

export function MaterialBatchGeneratorPanel({
  headerSlot,
}: {
  headerSlot?: React.ReactNode;
}) {
  const toast = useToast();
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>(['closed_gift_box', 'open_gift_box']);
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>(['red', 'gold']);
  const [phase, setPhase] = useState<Phase>('config');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);

  const timerRef = useRef<number | null>(null);
  const resultsRef = useRef<ResultItem[]>([]);

  resultsRef.current = results;

  const elementLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    ELEMENT_OPTIONS.forEach((e) => {
      map[e.id] = e.label;
    });
    return map;
  }, []);

  const colorMap = useMemo(() => {
    const map: Record<string, (typeof COLOR_OPTIONS)[number]> = {};
    COLOR_OPTIONS.forEach((c) => {
      map[c.id] = c;
    });
    return map;
  }, []);

  const combos = useMemo<ElementCombo[]>(() => {
    const list: ElementCombo[] = [];
    for (const eid of selectedElementIds) {
      for (const cid of selectedColorIds) {
        const combo = getCombo(eid, cid);
        if (combo) list.push(combo);
      }
    }
    return list;
  }, [selectedElementIds, selectedColorIds]);

  const comboCount = selectedElementIds.length * selectedColorIds.length;
  const doneCount = results.filter((r) => r.status === 'done').length;

  const toggleElement = (id: string) => {
    setSelectedElementIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleColor = (id: string) => {
    setSelectedColorIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllElements = () => setSelectedElementIds(ELEMENT_OPTIONS.map((e) => e.id));
  const clearElements = () => setSelectedElementIds([]);
  const selectAllColors = () => setSelectedColorIds(COLOR_OPTIONS.map((c) => c.id));
  const clearColors = () => setSelectedColorIds([]);

  const startProduction = useCallback(() => {
    if (combos.length === 0) {
      toast.show('请至少选择一个元素和一个配色');
      return;
    }
    const initial: ResultItem[] = combos.map((combo) => {
      const color = colorMap[combo.color_id];
      return {
        id: combo.id,
        element_id: combo.element_id,
        color_id: combo.color_id,
        element_label: elementLabelMap[combo.element_id] ?? combo.element_id,
        color_label: combo.color_label,
        background: combo.background,
        main: color?.main ?? '#888',
        secondary: color?.secondary ?? '#aaa',
        accent: color?.accent ?? '#ccc',
        prompt: combo.prompt,
        status: 'pending',
        imageUrl: null,
      };
    });
    setResults(initial);
    setSelectedIds(new Set());
    setPhase('producing');
    setShowResults(true);

    let idx = 0;
    const tick = () => {
      const current = resultsRef.current;
      if (idx >= current.length) {
        setPhase('done');
        return;
      }
      setResults((prev) => {
        const next = [...prev];
        const item = next[idx];
        if (item) {
          const combo = getCombo(item.element_id, item.color_id);
          const color = colorMap[item.color_id];
          next[idx] = {
            ...item,
            status: 'done',
            imageUrl: combo ? buildMockImageUrl(combo, color?.main ?? '#888', color?.secondary ?? '#aaa', color?.accent ?? '#ccc') : null,
          };
        }
        return next;
      });
      idx += 1;
      timerRef.current = window.setTimeout(tick, 350);
    };
    timerRef.current = window.setTimeout(tick, 350);
  }, [combos, colorMap, elementLabelMap, toast]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  const resetToConfig = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setPhase('config');
    setResults([]);
    setSelectedIds(new Set());
    setShowResults(false);
  };

  const stopProduction = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setPhase('done');
    toast.show('已停止生成，保留已完成的素材');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const doneResults = results.filter((r) => r.status === 'done');
  const allDoneSelected = doneResults.length > 0 && doneResults.every((r) => selectedIds.has(r.id));

  const toggleSelectAll = () => {
    if (allDoneSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(doneResults.map((r) => r.id)));
    }
  };

  const handleSingleDownload = async (item: ResultItem) => {
    if (!item.imageUrl) return;
    try {
      const png = await svgDataUrlToPng(item.imageUrl);
      downloadDataUrl(png, `${item.element_label}_${item.color_label}.png`);
    } catch {
      downloadDataUrl(item.imageUrl, `${item.element_label}_${item.color_label}.svg`);
    }
  };

  const handleBatchDownload = async () => {
    const targets = results.filter((r) => selectedIds.has(r.id) && r.imageUrl);
    if (targets.length === 0) {
      toast.show('请先勾选要下载的素材');
      return;
    }
    toast.show(`开始下载 ${targets.length} 张素材`);
    for (let i = 0; i < targets.length; i += 1) {
      const item = targets[i];
      if (!item.imageUrl) continue;
      try {
        const png = await svgDataUrlToPng(item.imageUrl);
        downloadDataUrl(png, `${item.element_label}_${item.color_label}.png`);
      } catch {
        downloadDataUrl(item.imageUrl, `${item.element_label}_${item.color_label}.svg`);
      }
      await new Promise((r) => setTimeout(r, 200));
    }
  };

  const handleImportToLibrary = () => {
    const targets = results.filter((r) => selectedIds.has(r.id) && r.status === 'done');
    if (targets.length === 0) {
      toast.show('请先勾选要导入的素材');
      return;
    }
    toast.success(`已将 ${targets.length} 张素材导入个人素材库`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {headerSlot}

      <section className="rounded-[28px] border border-black/5 bg-gradient-to-r from-[rgba(143,122,251,0.08)] to-[rgba(255,255,255,0.96)] px-8 py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(143,122,251,0.2)] bg-white/80 px-3 py-1 text-xs font-medium text-[#6F58F3]">
              <Sparkles size={14} />
              批量素材生成
            </div>
            <div className="text-2xl font-bold text-gray-900">多选元素与配色，一键批量生成素材</div>
            <div className="text-sm leading-6 text-gray-600">
              从 {ELEMENT_OPTIONS.length} 个元素和 {COLOR_OPTIONS.length} 套配色中自由组合，系统按 N×M 逐条拼接提示词并模拟生成。
              生成完成后可单张下载，或批量勾选下载 / 导入个人素材库。
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
              <div className="text-gray-400">元素</div>
              <div className="mt-1 font-semibold text-gray-900">{ELEMENT_OPTIONS.length}</div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
              <div className="text-gray-400">配色</div>
              <div className="mt-1 font-semibold text-gray-900">{COLOR_OPTIONS.length}</div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
              <div className="text-gray-400">本次组合</div>
              <div className="mt-1 font-semibold text-[#6F58F3]">{comboCount}</div>
            </div>
          </div>
        </div>
      </section>

      {phase === 'config' && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1fr]">
          <section className="rounded-3xl border border-black/5 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-gray-900">选择元素（可多选）</div>
                <div className="mt-1 text-sm text-gray-500">已选 {selectedElementIds.length} / {ELEMENT_OPTIONS.length}</div>
              </div>
              <div className="inline-flex rounded-full border border-black/5 bg-gray-50 p-0.5">
                <button
                  onClick={selectAllElements}
                  className="h-7 px-3 rounded-full text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  全选
                </button>
                <button
                  onClick={clearElements}
                  className="h-7 px-3 rounded-full text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  清空
                </button>
              </div>
            </div>
            <div className="grid gap-2 p-6 sm:grid-cols-2">
              {ELEMENT_OPTIONS.map((item) => {
                const active = selectedElementIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleElement(item.id)}
                    className={clsx(
                      'rounded-2xl border px-4 py-3 text-left transition-all flex items-center gap-3',
                      active
                        ? 'border-[rgba(143,122,251,0.35)] bg-[rgba(143,122,251,0.08)]'
                        : 'border-black/5 bg-white hover:border-black/10 hover:bg-gray-50'
                    )}
                  >
                    <span className="text-2xl">{ELEMENT_EMOJI[item.id] ?? '🎨'}</span>
                    <span className="flex-1 text-sm font-semibold text-gray-900">{item.label}</span>
                    {active && (
                      <span className="h-5 w-5 rounded-full bg-[#7C5CFA] flex items-center justify-center">
                        <Check size={13} className="text-white" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-black/5 bg-white shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-gray-900">选择配色（可多选）</div>
                <div className="mt-1 text-sm text-gray-500">已选 {selectedColorIds.length} / {COLOR_OPTIONS.length}</div>
              </div>
              <div className="inline-flex rounded-full border border-black/5 bg-gray-50 p-0.5">
                <button
                  onClick={selectAllColors}
                  className="h-7 px-3 rounded-full text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  全选
                </button>
                <button
                  onClick={clearColors}
                  className="h-7 px-3 rounded-full text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  清空
                </button>
              </div>
            </div>
            <div className="grid gap-2 p-6 sm:grid-cols-2">
              {COLOR_OPTIONS.map((item) => {
                const active = selectedColorIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleColor(item.id)}
                    className={clsx(
                      'rounded-2xl border px-4 py-3 text-left transition-all',
                      active
                        ? 'border-[rgba(143,122,251,0.35)] bg-[rgba(143,122,251,0.08)]'
                        : 'border-black/5 bg-white hover:border-black/10 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                      <div className="flex items-center gap-1.5">
                        {[item.main, item.secondary, item.accent].map((c) => (
                          <span key={c} className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    </div>
                    {active && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#6F58F3]">
                        <Check size={12} /> 已选中
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      <section className="rounded-3xl border border-black/5 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-base font-semibold text-gray-900">
              {phase === 'config' ? '提示词拼接预览' : '制作进度'}
            </div>
            <div className="mt-1 text-sm text-gray-500">
              {phase === 'config'
                ? `共 ${comboCount} 组提示词（${selectedElementIds.length} 元素 × ${selectedColorIds.length} 配色）`
                : `已生成 ${doneCount} / ${results.length}`}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {phase === 'config' && (
              <button
                type="button"
                onClick={startProduction}
                disabled={comboCount === 0}
                className={clsx(
                  'h-11 px-5 rounded-2xl text-sm font-semibold text-white transition-all inline-flex items-center gap-2',
                  comboCount === 0 ? 'bg-gray-300 cursor-not-allowed' : 'hover:opacity-90 shadow-sm shadow-[rgba(124,92,250,0.3)]'
                )}
                style={comboCount > 0 ? { backgroundColor: '#7C5CFA' } : undefined}
              >
                <Sparkles size={16} />
                开始批量制作
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/20 px-1.5 text-xs font-bold">
                  {comboCount}
                </span>
              </button>
            )}

            {phase === 'producing' && (
              <>
                <button
                  type="button"
                  onClick={() => setShowResults((v) => !v)}
                  className="h-11 px-4 rounded-2xl border border-black/5 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2"
                >
                  {showResults ? '收起结果' : '查看结果'}
                  <ChevronDown size={16} className={clsx('transition-transform', showResults && 'rotate-180')} />
                </button>
                <button
                  type="button"
                  onClick={stopProduction}
                  className="h-11 px-4 rounded-2xl border border-red-200 bg-white text-sm font-semibold text-red-600 hover:bg-red-50 inline-flex items-center gap-2"
                >
                  <X size={16} />
                  停止
                </button>
                <div
                  className="h-11 px-5 rounded-2xl text-sm font-semibold text-white inline-flex items-center gap-2"
                  style={{ backgroundColor: '#7C5CFA' }}
                >
                  <Loader2 size={16} className="animate-spin" />
                  制作中
                  <span className="font-mono text-xs bg-white/20 rounded-full px-2 py-0.5">
                    {doneCount}/{results.length}
                  </span>
                </div>
              </>
            )}

            {phase === 'done' && (
              <button
                type="button"
                onClick={resetToConfig}
                className="h-11 px-4 rounded-2xl border border-black/5 bg-white text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-700 inline-flex items-center gap-2"
              >
                <X size={16} />
                重新配置
              </button>
            )}
          </div>
        </div>

        {phase === 'config' && combos.length > 0 && (
          <div className="p-6 max-h-96 overflow-auto space-y-2">
            {combos.slice(0, 30).map((combo) => (
              <div key={combo.id} className="rounded-2xl border border-black/5 bg-gray-50 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-gray-900">
                    {elementLabelMap[combo.element_id]} · {combo.color_label}
                  </div>
                  <div className="text-[11px] text-gray-400">{combo.id}</div>
                </div>
                <div className="mt-1.5 text-xs text-gray-500 line-clamp-2">{combo.prompt}</div>
              </div>
            ))}
            {combos.length > 30 && (
              <div className="text-center text-xs text-gray-400 py-2">仅展示前 30 条，共 {combos.length} 条</div>
            )}
          </div>
        )}

        {phase === 'config' && combos.length === 0 && (
          <div className="p-12 text-center text-sm text-gray-400">
            请至少选择一个元素和一个配色
          </div>
        )}

        {(phase === 'producing' || phase === 'done') && showResults && (
          <div className="p-6 space-y-4">
            <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600 flex items-center justify-between flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5">
                {phase === 'producing' ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-[#7C5CFA]" />
                    正在逐张生成素材，已完成 <b className="text-[#7C5CFA]">{doneCount}</b> / {results.length}
                  </>
                ) : (
                  <>
                    <Check size={14} className="text-green-500" />
                    全部生成完成，共 <b className="text-gray-900">{results.length}</b> 张素材
                  </>
                )}
              </span>
              <span className="text-xs text-gray-400">勾选卡片可批量下载或导入素材库</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((item) => (
                <ResultCard
                  key={item.id}
                  item={item}
                  selected={selectedIds.has(item.id)}
                  selectable={item.status === 'done'}
                  onToggle={() => toggleSelect(item.id)}
                  onDownload={() => handleSingleDownload(item)}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {phase === 'done' && showResults && (
        <div className="sticky bottom-6 z-20 flex justify-center px-4">
          <div className="inline-flex items-center gap-1 rounded-full border border-black/5 bg-white/95 backdrop-blur px-2 py-2 shadow-xl shadow-black/5">
            <label className="inline-flex items-center gap-2 pl-3 pr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allDoneSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4 accent-[#7C5CFA]"
              />
              <span className="text-sm text-gray-600">
                已选 <b className="text-[#7C5CFA] tabular-nums">{selectedIds.size}</b>
                <span className="text-gray-300 mx-1">/</span>
                {doneResults.length}
              </span>
            </label>
            <div className="h-5 w-px bg-gray-200" />
            <button
              type="button"
              onClick={handleBatchDownload}
              disabled={selectedIds.size === 0}
              className={clsx(
                'h-9 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 transition-all',
                selectedIds.size === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-white hover:opacity-90'
              )}
              style={selectedIds.size > 0 ? { backgroundColor: '#7C5CFA' } : undefined}
            >
              <Download size={15} />
              批量下载
            </button>
            <button
              type="button"
              onClick={handleImportToLibrary}
              disabled={selectedIds.size === 0}
              className={clsx(
                'h-9 px-4 rounded-full text-sm font-semibold inline-flex items-center gap-1.5 transition-all',
                selectedIds.size === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-white hover:opacity-90'
              )}
              style={selectedIds.size > 0 ? { backgroundColor: '#111' } : undefined}
            >
              <Upload size={15} />
              导入个人素材
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({
  item,
  selected,
  selectable,
  onToggle,
  onDownload,
}: {
  item: ResultItem;
  selected: boolean;
  selectable: boolean;
  onToggle: () => void;
  onDownload: () => void;
}) {
  return (
    <div
      className={clsx(
        'rounded-2xl border overflow-hidden bg-white transition-all',
        selected ? 'border-[#7C5CFA] ring-2 ring-[rgba(124,92,250,0.2)]' : 'border-black/5'
      )}
    >
      <div className="relative aspect-square bg-gray-100">
        {item.status === 'pending' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Package size={28} />
            <span className="text-xs">等待生成</span>
          </div>
        )}
        {item.status === 'generating' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#7C5CFA]">
            <Loader2 size={28} className="animate-spin" />
            <span className="text-xs">生成中</span>
          </div>
        )}
        {item.status === 'done' && item.imageUrl && (
          <img src={item.imageUrl} alt={item.id} className="h-full w-full object-cover" />
        )}

        {selectable && (
          <label
            className={clsx(
              'absolute top-2 left-2 h-5 w-5 rounded-md border-2 flex items-center justify-center cursor-pointer transition-all',
              selected ? 'bg-[#7C5CFA] border-[#7C5CFA]' : 'bg-white/80 border-gray-300 hover:border-[#7C5CFA]'
            )}
          >
            <input type="checkbox" checked={selected} onChange={onToggle} className="sr-only" />
            {selected && <Check size={13} className="text-white" />}
          </label>
        )}

        {item.status === 'done' && (
          <button
            type="button"
            onClick={onDownload}
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-gray-700 hover:bg-white hover:text-[#7C5CFA] transition-colors shadow-sm"
            title="下载"
          >
            <Download size={15} />
          </button>
        )}
      </div>

      <div className="px-3 py-2.5">
        <div className="text-sm font-semibold text-gray-900 truncate">{item.element_label}</div>
        <div className="mt-0.5 text-[11px] text-gray-500 flex items-center gap-1.5">
          <Palette size={11} />
          {item.color_label}
        </div>
      </div>
    </div>
  );
}

export default function MaterialBatchGenerator() {
  return (
    <ToolLayout title="素材批量生成">
      <MaterialBatchGeneratorPanel />
    </ToolLayout>
  );
}

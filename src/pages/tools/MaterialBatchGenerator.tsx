import { useEffect, useMemo, useState } from 'react';
import { Copy, Package, Sparkles } from 'lucide-react';
import clsx from 'clsx';

import ToolLayout from './ToolLayout';
import { useToast } from '../../components/ToastProvider';

type ElementTypeId = 'gift_box' | 'card_pack' | 'flower';

type ElementTypeDefinition = {
  id: ElementTypeId;
  label: string;
  description: string;
  detailLabels: {
    main: string;
    secondary: string;
    accent: string;
  };
};

type ElementVariant = {
  id: string;
  typeId: ElementTypeId;
  label: string;
  statusLabel: string;
  description: string;
  subjectPrompt: string;
};

type ColorFamily = {
  id: string;
  label: string;
  background: string;
  main: string;
  secondary: string;
  accent: string;
};

type BatchMode = 'same-color-multi-element' | 'same-element-multi-color';

type GeneratedDesign = {
  id: string;
  element_id: string;
  color_id: string;
  color_label: string;
  background: string;
  width: number;
  height: number;
  prompt: string;
  negative_prompt: string;
  seed: number;
  requested_model: string;
  used_model: string;
  api_base: string;
  size: number;
  response_request_id: string;
};

const ELEMENT_TYPES: ElementTypeDefinition[] = [
  {
    id: 'gift_box',
    label: '礼盒',
    description: '适合节日活动、福利发放、权益礼包等营销视觉素材。',
    detailLabels: {
      main: '礼盒主体',
      secondary: '丝带颜色',
      accent: '高光点缀',
    },
  },
  {
    id: 'card_pack',
    label: '卡包',
    description: '适合权益卡、会员卡、金融卡面和礼包权益视觉素材。',
    detailLabels: {
      main: '卡包颜色',
      secondary: '卡片颜色',
      accent: '边缘点缀',
    },
  },
  {
    id: 'flower',
    label: '花朵',
    description: '适合节气、节日、关怀活动和氛围型装饰素材。',
    detailLabels: {
      main: '花瓣颜色',
      secondary: '花心颜色',
      accent: '高光点缀',
    },
  },
];

const ELEMENT_VARIANTS: ElementVariant[] = [
  {
    id: 'closed_gift_box',
    typeId: 'gift_box',
    label: '闭合礼盒',
    statusLabel: '闭合',
    description: '一个关闭的方形礼盒，上方有立体蝴蝶结，丝带整齐包裹盒身。',
    subjectPrompt:
      '一个关闭的方形礼盒，上方有立体蝴蝶结，丝带整齐包裹盒身，圆润边角，精致礼品感，表面无文字无图案。',
  },
  {
    id: 'opened_gift_box',
    typeId: 'gift_box',
    label: '打开的礼盒',
    statusLabel: '打开',
    description: '礼盒上盖掀开，丝带自然展开，适合表现惊喜感和赠礼氛围。',
    subjectPrompt:
      '一个打开的方形礼盒，盒盖微微掀起，丝带自然展开，内部有精致层次但无额外物品，圆润边角，惊喜礼赠感，表面无文字无图案。',
  },
  {
    id: 'single_card_pack',
    typeId: 'card_pack',
    label: '单层卡包',
    statusLabel: '单层',
    description: '一个简洁立体的卡包，露出一张卡片，适合权益卡类素材。',
    subjectPrompt:
      '一个精致立体卡包，包体圆润挺括，顶部自然露出一张卡片，卡片无文字无图案，整体简洁高级，适合权益和会员视觉物料。',
  },
  {
    id: 'double_card_pack',
    typeId: 'card_pack',
    label: '双卡卡包',
    statusLabel: '双卡',
    description: '卡包中露出两张有层次的卡片，更适合权益组合表达。',
    subjectPrompt:
      '一个精致立体卡包，包体圆润挺括，内部露出两张错落层叠的卡片，卡片无文字无图案，整体简洁高级，适合权益组合和金融营销物料。',
  },
  {
    id: 'single_flower',
    typeId: 'flower',
    label: '单朵花',
    statusLabel: '单朵',
    description: '一朵圆润立体花朵，适合节气和装饰类素材。',
    subjectPrompt:
      '一朵单独的立体花朵，花瓣圆润饱满，花心层次清晰，整体简洁可爱，干净高级，无文字无图案，适合作为节气或氛围装饰素材。',
  },
  {
    id: 'bouquet_flower',
    typeId: 'flower',
    label: '花束',
    statusLabel: '花束',
    description: '一束简洁花束，更适合祝福、感谢、关怀场景。',
    subjectPrompt:
      '一束简洁立体花束，花朵圆润饱满，花心层次清晰，花束结构紧凑精致，干净高级，无文字无图案，适合作为祝福和关怀活动素材。',
  },
];

const COLOR_FAMILIES: ColorFamily[] = [
  {
    id: 'deep_blue',
    label: '深蓝色',
    background: '#00FF00',
    main: '#1D4ED8',
    secondary: '#60A5FA',
    accent: '#DBEAFE',
  },
  {
    id: 'rose_gold',
    label: '玫瑰金',
    background: '#00FF00',
    main: '#E879A6',
    secondary: '#F9A8D4',
    accent: '#FCE7F3',
  },
  {
    id: 'emerald_green',
    label: '翡翠绿',
    background: '#00FF00',
    main: '#059669',
    secondary: '#34D399',
    accent: '#D1FAE5',
  },
  {
    id: 'sunshine_orange',
    label: '日光橙',
    background: '#00FF00',
    main: '#F97316',
    secondary: '#FDBA74',
    accent: '#FFEDD5',
  },
];

const NEGATIVE_PROMPT = [
  '不要文字',
  '不要logo',
  '不要商标',
  '不要水印',
  '不要二维码',
  '不要条形码',
  '不要真实品牌',
  '不要人物',
  '不要复杂背景',
  '不要边框',
  '不要海报排版',
  '不要信息卡片',
  '不要真实纸币',
  '不要真实银行卡',
  '不要卡号',
  '不要日期',
  '不要姓名',
  '不要芯片',
  '不要磁条',
  '不要货币符号',
  '不要人民币符号',
  '不要美元符号',
  '不要欧元符号',
  '不要¥',
  '不要$',
  '不要€',
  '不要多余图案。',
].join('，');

const MODEL_META = {
  requested_model: 'qwen-image2512',
  used_model: 'qwen-image-max',
  api_base: 'dashscope.aliyuncs.com',
};

const OUTPUT_SIZE = 1024;

function makeRequestId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function buildPrompt(variant: ElementVariant, colorFamily: ColorFamily, elementType: ElementTypeDefinition) {
  return [
    '单独生成一个营销活动3D图标素材，整体为精致商业3D插画风格，圆润可爱，干净高级，适合金融、电商、福利活动海报使用。',
    `主体是：${variant.subjectPrompt}`,
    '画幅要求：1:1正方形构图，单个主体素材，不是海报，不要排版。',
    `配色要求：${elementType.detailLabels.main}为${colorFamily.label}主色 ${colorFamily.main}，${elementType.detailLabels.secondary}为 ${colorFamily.secondary}，${elementType.detailLabels.accent}为 ${colorFamily.accent}。颜色明亮、通透、统一，不要杂乱。`,
    `纯色背景 ${colorFamily.background}，背景必须完全平坦、纯色、无渐变、无纹理、无光斑、无阴影。主体不能使用背景色。主体完整居中，四周留出足够边距，不要裁切。`,
    '物体本身可以有柔和高光、材质明暗和圆润体积感，但不要投影、不要接触阴影、不要地面阴影、不要反射阴影、不要桌面、不要地面。',
    NEGATIVE_PROMPT,
  ].join('\n');
}

function buildDesign(variant: ElementVariant, colorFamily: ColorFamily, prompt: string): GeneratedDesign {
  return {
    id: `${variant.id}__${colorFamily.id}`,
    element_id: variant.id,
    color_id: colorFamily.id,
    color_label: colorFamily.label,
    background: colorFamily.background,
    width: OUTPUT_SIZE,
    height: OUTPUT_SIZE,
    prompt,
    negative_prompt: NEGATIVE_PROMPT,
    seed: 20260713,
    requested_model: MODEL_META.requested_model,
    used_model: MODEL_META.used_model,
    api_base: MODEL_META.api_base,
    size: OUTPUT_SIZE,
    response_request_id: makeRequestId(),
  };
}

function DesignJsonCard({
  title,
  design,
  onCopy,
}: {
  title: string;
  design: GeneratedDesign;
  onCopy: (payload: string, message: string) => void;
}) {
  return (
    <section className="rounded-3xl border border-black/5 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between gap-4">
        <div>
          <div className="text-base font-semibold text-gray-900">{title}</div>
          <div className="text-sm text-gray-500">
            {design.id} · {design.color_label}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onCopy(JSON.stringify(design, null, 2), '已复制 design JSON')}
          className="h-10 px-4 rounded-2xl border border-black/5 bg-white text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
        >
          <Copy size={16} />
          复制 JSON
        </button>
      </div>
      <div className="p-6">
        <pre className="min-h-[340px] overflow-auto whitespace-pre-wrap break-all rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-800">
          {JSON.stringify(design, null, 2)}
        </pre>
      </div>
    </section>
  );
}

export default function MaterialBatchGenerator() {
  const toast = useToast();
  const [selectedTypeId, setSelectedTypeId] = useState<ElementTypeId>('gift_box');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('closed_gift_box');
  const [selectedColorFamilyId, setSelectedColorFamilyId] = useState<string>('deep_blue');
  const [batchMode, setBatchMode] = useState<BatchMode>('same-color-multi-element');
  const [selectedBatchVariantIds, setSelectedBatchVariantIds] = useState<string[]>(['closed_gift_box', 'opened_gift_box']);
  const [selectedBatchColorIds, setSelectedBatchColorIds] = useState<string[]>(['deep_blue', 'rose_gold']);

  const openInNewTab = (path: string) => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const url = `${window.location.origin}${import.meta.env.BASE_URL}#${normalized}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const selectedType = useMemo(
    () => ELEMENT_TYPES.find((item) => item.id === selectedTypeId) ?? ELEMENT_TYPES[0],
    [selectedTypeId]
  );

  const variantsForType = useMemo(
    () => ELEMENT_VARIANTS.filter((item) => item.typeId === selectedTypeId),
    [selectedTypeId]
  );

  const selectedVariant = useMemo(
    () => variantsForType.find((item) => item.id === selectedVariantId) ?? variantsForType[0],
    [selectedVariantId, variantsForType]
  );

  const selectedColorFamily = useMemo(
    () => COLOR_FAMILIES.find((item) => item.id === selectedColorFamilyId) ?? COLOR_FAMILIES[0],
    [selectedColorFamilyId]
  );

  const defaultPrompt = useMemo(
    () => buildPrompt(selectedVariant, selectedColorFamily, selectedType),
    [selectedColorFamily, selectedType, selectedVariant]
  );

  const [editablePrompt, setEditablePrompt] = useState(defaultPrompt);

  useEffect(() => {
    setEditablePrompt(defaultPrompt);
  }, [defaultPrompt]);

  const currentDesign = useMemo(
    () => buildDesign(selectedVariant, selectedColorFamily, editablePrompt),
    [editablePrompt, selectedColorFamily, selectedVariant]
  );

  const batchVariantPool = useMemo(() => ELEMENT_VARIANTS, []);

  const batchDesigns = useMemo(() => {
    if (batchMode === 'same-color-multi-element') {
      return batchVariantPool
        .filter((item) => selectedBatchVariantIds.includes(item.id))
        .map((item) => {
          const type = ELEMENT_TYPES.find((typeItem) => typeItem.id === item.typeId) ?? ELEMENT_TYPES[0];
          const prompt = buildPrompt(item, selectedColorFamily, type);
          return buildDesign(item, selectedColorFamily, prompt);
        });
    }

    return COLOR_FAMILIES.filter((item) => selectedBatchColorIds.includes(item.id)).map((item) => {
      const prompt = buildPrompt(selectedVariant, item, selectedType);
      return buildDesign(selectedVariant, item, prompt);
    });
  }, [batchMode, batchVariantPool, selectedBatchColorIds, selectedBatchVariantIds, selectedColorFamily, selectedType, selectedVariant]);

  const batchPayload = useMemo(() => JSON.stringify(batchDesigns, null, 2), [batchDesigns]);

  const handleCopy = async (payload: string, message: string) => {
    try {
      await navigator.clipboard.writeText(payload);
      toast.show(message);
    } catch {
      toast.show('复制失败，请手动复制');
    }
  };

  const handleOpenInCanvas = () => {
    const params = new URLSearchParams();
    params.set('q', editablePrompt.trim() || defaultPrompt);
    params.set('width', String(currentDesign.width));
    params.set('height', String(currentDesign.height));
    params.set('seed', String(currentDesign.seed));
    openInNewTab(`/public-canvas?${params.toString()}`);
  };

  const toggleBatchVariant = (variantId: string) => {
    setSelectedBatchVariantIds((prev) => {
      if (prev.includes(variantId)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== variantId);
      }
      return [...prev, variantId];
    });
  };

  const toggleBatchColor = (colorId: string) => {
    setSelectedBatchColorIds((prev) => {
      if (prev.includes(colorId)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== colorId);
      }
      return [...prev, colorId];
    });
  };

  return (
    <ToolLayout title="素材批量生成">
      <div className="space-y-8">
        <section className="rounded-[28px] border border-black/5 bg-gradient-to-r from-[rgba(143,122,251,0.08)] to-[rgba(255,255,255,0.96)] px-8 py-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(143,122,251,0.2)] bg-white/80 px-3 py-1 text-xs font-medium text-[#6F58F3]">
                <Sparkles size={14} />
                设计系统化生成
              </div>
              <div className="text-2xl font-bold text-gray-900">把元素、状态和色系组合成可复用的 design</div>
              <div className="text-sm leading-6 text-gray-600">
                先选择元素类型，再确定具体状态和色系。系统会自动生成 design JSON 和可编辑 prompt，
                你可以直接送到无限画布生成，也可以切换到批量模式，一次输出多组设计组合。
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
                <div className="text-gray-400">元素类型</div>
                <div className="mt-1 font-semibold text-gray-900">{ELEMENT_TYPES.length}</div>
              </div>
              <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
                <div className="text-gray-400">元素状态</div>
                <div className="mt-1 font-semibold text-gray-900">{ELEMENT_VARIANTS.length}</div>
              </div>
              <div className="rounded-2xl border border-black/5 bg-white px-4 py-3">
                <div className="text-gray-400">预置色系</div>
                <div className="mt-1 font-semibold text-gray-900">{COLOR_FAMILIES.length}</div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.95fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-black/5 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-black/5">
                <div className="text-base font-semibold text-gray-900">1 选择元素类型</div>
                <div className="mt-1 text-sm text-gray-500">先决定要生成什么素材类别，比如礼盒、卡包、花朵。</div>
              </div>
              <div className="grid gap-3 p-6 md:grid-cols-3">
                {ELEMENT_TYPES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedTypeId(item.id);
                      const nextVariant = ELEMENT_VARIANTS.find((variant) => variant.typeId === item.id);
                      if (nextVariant) setSelectedVariantId(nextVariant.id);
                    }}
                    className={clsx(
                      'rounded-2xl border px-4 py-4 text-left transition-all',
                      item.id === selectedTypeId
                        ? 'border-[rgba(143,122,251,0.25)] bg-[rgba(143,122,251,0.08)]'
                        : 'border-black/5 bg-white hover:border-black/10 hover:bg-gray-50'
                    )}
                  >
                    <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                    <div className="mt-2 text-xs leading-5 text-gray-500">{item.description}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-black/5 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-black/5">
                <div className="text-base font-semibold text-gray-900">2 选择具体元素</div>
                <div className="mt-1 text-sm text-gray-500">
                  `element = element type + element status`，例如 `礼盒 + 打开 = 打开的礼盒`
                </div>
              </div>
              <div className="grid gap-3 p-6 md:grid-cols-2">
                {variantsForType.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedVariantId(item.id)}
                    className={clsx(
                      'rounded-2xl border px-4 py-4 text-left transition-all',
                      item.id === selectedVariant.id
                        ? 'border-[rgba(143,122,251,0.25)] bg-[rgba(143,122,251,0.08)]'
                        : 'border-black/5 bg-white hover:border-black/10 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                      <div className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-500">{item.statusLabel}</div>
                    </div>
                    <div className="mt-2 text-xs leading-5 text-gray-500">{item.description}</div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-black/5 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-black/5">
                <div className="text-base font-semibold text-gray-900">3 选择配色方案</div>
                <div className="mt-1 text-sm text-gray-500">
                  `element + colorset = design`，当前元素会自动映射到对应的颜色槽位。
                </div>
              </div>
              <div className="space-y-5 p-6">
                <div className="grid gap-3 md:grid-cols-2">
                  {COLOR_FAMILIES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedColorFamilyId(item.id)}
                      className={clsx(
                        'rounded-2xl border px-4 py-4 text-left transition-all',
                        item.id === selectedColorFamilyId
                          ? 'border-[rgba(143,122,251,0.25)] bg-[rgba(143,122,251,0.08)]'
                          : 'border-black/5 bg-white hover:border-black/10 hover:bg-gray-50'
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                        <div className="flex items-center gap-1.5">
                          {[item.main, item.secondary, item.accent].map((color) => (
                            <span
                              key={color}
                              className="h-4 w-4 rounded-full border border-black/10"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-gray-500">
                        <div>
                          <div>{selectedType.detailLabels.main}</div>
                          <div className="mt-1 font-medium text-gray-700">{item.main}</div>
                        </div>
                        <div>
                          <div>{selectedType.detailLabels.secondary}</div>
                          <div className="mt-1 font-medium text-gray-700">{item.secondary}</div>
                        </div>
                        <div>
                          <div>{selectedType.detailLabels.accent}</div>
                          <div className="mt-1 font-medium text-gray-700">{item.accent}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-dashed border-[rgba(143,122,251,0.24)] bg-[rgba(143,122,251,0.06)] px-4 py-4">
                  <div className="text-sm font-semibold text-gray-900">当前 design 组合</div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-900">{selectedVariant.label}</span>
                    {' + '}
                    <span className="font-medium text-gray-900">{selectedColorFamily.label}</span>
                    {' = '}
                    <span className="font-medium text-[#6F58F3]">{currentDesign.id}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-black/5 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-gray-900">4 Prompt 编辑区</div>
                  <div className="mt-1 text-sm text-gray-500">系统先自动生成 prompt，你可以继续调整后再去生图。</div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditablePrompt(defaultPrompt)}
                  className="h-10 px-4 rounded-2xl border border-black/5 bg-white text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  恢复默认 prompt
                </button>
              </div>
              <div className="p-6 space-y-4">
                <textarea
                  value={editablePrompt}
                  onChange={(event) => setEditablePrompt(event.target.value)}
                  className="min-h-[360px] w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4"
                  style={{
                    ['--tw-ring-color' as any]: 'rgba(143, 122, 251, 0.12)',
                    ['--tw-ring-opacity' as any]: '1',
                  }}
                />
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(editablePrompt, '已复制 prompt')}
                    className="h-10 px-4 rounded-2xl border border-black/5 bg-white text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
                  >
                    <Copy size={16} />
                    复制 prompt
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenInCanvas}
                    className="h-10 px-4 rounded-2xl text-sm font-semibold text-white transition-colors"
                    style={{ backgroundColor: '#8F7AFB' }}
                  >
                    送去无限画布生成
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <DesignJsonCard title="当前 design JSON" design={currentDesign} onCopy={handleCopy} />

            <section className="rounded-3xl border border-black/5 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-base font-semibold text-gray-900">批量组合预览</div>
                  <div className="mt-1 text-sm text-gray-500">当前先输出批量设计数据，后续可以直接接批量生图任务。</div>
                </div>
                <div className="inline-flex rounded-full border border-black/5 bg-gray-50 p-1">
                  <button
                    type="button"
                    onClick={() => setBatchMode('same-color-multi-element')}
                    className={clsx(
                      'h-8 rounded-full px-3 text-xs font-semibold transition-colors',
                      batchMode === 'same-color-multi-element' ? 'bg-white text-[#6F58F3] border border-black/10' : 'text-gray-500'
                    )}
                  >
                    同色系批量元素
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchMode('same-element-multi-color')}
                    className={clsx(
                      'h-8 rounded-full px-3 text-xs font-semibold transition-colors',
                      batchMode === 'same-element-multi-color' ? 'bg-white text-[#6F58F3] border border-black/10' : 'text-gray-500'
                    )}
                  >
                    同元素批量配色
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {batchMode === 'same-color-multi-element' ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-black/5 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                      当前统一色系：
                      <span className="ml-1 font-semibold text-gray-900">{selectedColorFamily.label}</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {batchVariantPool.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleBatchVariant(item.id)}
                          className={clsx(
                            'rounded-2xl border px-3 py-3 text-left transition-all',
                            selectedBatchVariantIds.includes(item.id)
                              ? 'border-[rgba(143,122,251,0.25)] bg-[rgba(143,122,251,0.08)]'
                              : 'border-black/5 bg-white hover:border-black/10 hover:bg-gray-50'
                          )}
                        >
                          <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                          <div className="mt-1 text-[11px] text-gray-500">{item.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-black/5 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                      当前统一元素：
                      <span className="ml-1 font-semibold text-gray-900">{selectedVariant.label}</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {COLOR_FAMILIES.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleBatchColor(item.id)}
                          className={clsx(
                            'rounded-2xl border px-3 py-3 text-left transition-all',
                            selectedBatchColorIds.includes(item.id)
                              ? 'border-[rgba(143,122,251,0.25)] bg-[rgba(143,122,251,0.08)]'
                              : 'border-black/5 bg-white hover:border-black/10 hover:bg-gray-50'
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                            <div className="flex gap-1.5">
                              {[item.main, item.secondary, item.accent].map((color) => (
                                <span
                                  key={color}
                                  className="h-4 w-4 rounded-full border border-black/10"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">已生成 {batchDesigns.length} 个批量 design</div>
                      <div className="mt-1 text-xs text-gray-500">后续接 API 时，这里可以直接变成批量任务请求体。</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(batchPayload, '已复制批量 design JSON')}
                      className="h-9 px-3 rounded-2xl border border-black/5 bg-white text-xs font-semibold text-gray-900 hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
                    >
                      <Package size={14} />
                      复制批量 JSON
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {batchDesigns.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-black/5 bg-white px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{item.id}</div>
                          <div className="mt-1 text-[11px] text-gray-500">{item.color_label}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.prompt, `已复制 ${item.id} 的 prompt`)}
                          className="h-8 px-3 rounded-xl border border-black/5 bg-white text-xs font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                          复制 prompt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

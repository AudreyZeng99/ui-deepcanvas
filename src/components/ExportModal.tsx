import { ReactNode, useEffect, useMemo, useState } from 'react';
import { X, Download, Pipette, AlertCircle, Check } from 'lucide-react';
import clsx from 'clsx';

type ExportSceneCategory = 'customer_marketing' | 'party_building' | 'union_activity' | 'internal_training' | 'other';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewImage?: string;
  previewContent?: ReactNode;
  previewSize?: { width: number; height: number };
  enableSceneSelection?: boolean;
  onExport: (settings: ExportSettings) => void;
}

export interface ExportSettings {
  watermarkText: string;
  watermarkColor: string;
  watermarkOpacity: number;
  position: 'tl' | 'tr' | 'bl' | 'br' | 'custom';
  customX: number;
  customY: number;
  format: 'jpg' | 'png' | 'gif';
  quality: number;
  sceneCategory?: ExportSceneCategory;
  sceneOption?: string;
  sceneOtherValue?: string;
}

const SCENE_OPTIONS: Record<ExportSceneCategory, { label: string; options: string[] }> = {
  customer_marketing: {
    label: '对客营销',
    options: ['小程序', '手机银行', '企业网银', '物理网点', '微信（企业微信/朋友圈）', '其他'],
  },
  party_building: {
    label: '党建宣传',
    options: ['办公场所', '内网', '其他'],
  },
  union_activity: {
    label: '工会活动',
    options: ['小程序', '内网', '微信', '其他'],
  },
  internal_training: {
    label: '对内培训',
    options: ['内网', '微信', '其他'],
  },
  other: {
    label: '其他',
    options: ['其他'],
  },
};

export default function ExportModal({
  isOpen,
  onClose,
  previewImage,
  previewContent,
  previewSize,
  enableSceneSelection = false,
  onExport,
}: ExportModalProps) {
  const totalSteps = enableSceneSelection ? 2 : 1;
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkColor, setWatermarkColor] = useState('#ffffff');
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const [position, setPosition] = useState<'tl' | 'tr' | 'bl' | 'br' | 'custom'>('br');
  const [customX, setCustomX] = useState(20);
  const [customY, setCustomY] = useState(20);
  const [format, setFormat] = useState<'jpg' | 'png' | 'gif'>('jpg');
  const [quality, setQuality] = useState(100);
  const [sceneCategory, setSceneCategory] = useState<ExportSceneCategory | ''>('');
  const [sceneOption, setSceneOption] = useState('');
  const [sceneOtherValue, setSceneOtherValue] = useState('');
  const [sceneError, setSceneError] = useState('');
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    if (!isOpen) return;
    setSceneError('');
    setActiveStep(1);
  }, [isOpen]);

  const normalizedUrl = previewImage?.trim() || '';
  const needsSceneOtherInput = sceneOption === '其他' || sceneCategory === 'other';
  const computedPreviewScale = useMemo(() => {
    if (!previewSize) return 1;
    return Math.min(1, 320 / previewSize.width, 300 / previewSize.height);
  }, [previewSize]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (enableSceneSelection) {
      if (!sceneCategory || !sceneOption) {
        setSceneError('请先选择导出场景。');
        setActiveStep(3);
        return;
      }
      if (needsSceneOtherInput && !sceneOtherValue.trim()) {
        setSceneError('请补充“其他”场景说明。');
        setActiveStep(3);
        return;
      }
    }

    const settings: ExportSettings = {
      watermarkText,
      watermarkColor,
      watermarkOpacity,
      position,
      customX,
      customY,
      format,
      quality,
      sceneCategory: sceneCategory || undefined,
      sceneOption: sceneOption || undefined,
      sceneOtherValue: sceneOtherValue.trim() || undefined,
    };

    onExport(settings);

    const fileName = `deepcanvas-export-${Date.now()}.${settings.format}`;
    if (!normalizedUrl) return;

    try {
      const res = await fetch(normalizedUrl);
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objUrl);
    } catch {
      const a = document.createElement('a');
      a.href = normalizedUrl;
      a.download = fileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  const handleNext = () => {
    if (activeStep >= totalSteps) return;
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep <= 1) return;
    setActiveStep((prev) => prev - 1);
  };

  const canConfirm =
    !enableSceneSelection ||
    (!!sceneCategory && !!sceneOption && (!needsSceneOtherInput || !!sceneOtherValue.trim()));

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-[1120px] flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-black/5">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
              <Download className="text-[#2563EB]" size={20} />
              导出
            </h2>
            <div className="hidden md:flex items-center gap-2 text-xs">
              {[
                { id: 1, label: '导出设置' },
                ...(enableSceneSelection ? [{ id: 2, label: '场景用途' }] : []),
              ].map((item) => {
                const isDone = activeStep > item.id;
                const isActive = activeStep === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveStep(item.id)}
                    className={clsx(
                      'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors',
                      isActive
                        ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
                        : isDone
                          ? 'border-black/10 bg-white text-gray-600 hover:bg-gray-50'
                          : 'border-black/5 bg-white text-gray-500 hover:bg-gray-50'
                    )}
                  >
                    <span
                      className={clsx(
                        'inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-semibold',
                        isActive ? 'bg-[#2563EB] text-white' : isDone ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-700'
                      )}
                    >
                      {isDone ? <Check size={12} /> : item.id}
                    </span>
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <div className="md:basis-[40%] md:shrink-0 bg-[#F4F7FF] p-5 md:p-6 flex items-center justify-center relative overflow-auto border-r border-gray-100">
            <div className="w-full h-full flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">画布预览</div>
                  {previewSize && (
                    <div className="mt-1 text-xs text-gray-500">
                      {previewSize.width} x {previewSize.height}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-h-[300px] rounded-[18px] border border-[#D9E6FF] bg-white/70 backdrop-blur-sm flex items-center justify-center overflow-auto p-4">
                <div className="relative shadow-[0_24px_64px_rgba(37,99,235,0.10)]">
                  <div
                    className="relative origin-center overflow-hidden border border-black/10 bg-white"
                    style={{
                      width: previewSize?.width ?? 560,
                      height: previewSize?.height ?? 320,
                      transform: `scale(${computedPreviewScale})`,
                      transformOrigin: 'center center',
                    }}
                  >
                    {previewContent ? (
                      previewContent
                    ) : normalizedUrl ? (
                      <img src={normalizedUrl} alt="Export Preview" className="h-full w-full object-contain block" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
                        暂无可导出的画布内容
                      </div>
                    )}

                    {watermarkText && (
                      <div
                        className="absolute pointer-events-none whitespace-nowrap font-medium"
                        style={{
                          color: watermarkColor,
                          opacity: watermarkOpacity / 100,
                          top: position === 'tl' ? '20px' : position === 'tr' ? '20px' : position === 'custom' ? `${customY}px` : 'auto',
                          bottom: position === 'bl' ? '20px' : position === 'br' ? '20px' : 'auto',
                          left: position === 'tl' ? '20px' : position === 'bl' ? '20px' : position === 'custom' ? `${customX}px` : 'auto',
                          right: position === 'tr' ? '20px' : position === 'br' ? '20px' : 'auto',
                          textShadow: '0 2px 4px rgba(0,0,0,0.35)',
                          fontSize: '24px',
                        }}
                      >
                        {watermarkText}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:flex-1 bg-white flex flex-col h-full min-w-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {activeStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900">水印设置</h3>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500">水印文本</label>
                      <input
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        placeholder="输入水印文字"
                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#2563EB] focus:outline-none text-sm transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">水印文字颜色</label>
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-full rounded-xl bg-gray-50 border border-gray-200 flex items-center px-2 gap-2">
                            <input
                              type="color"
                              value={watermarkColor}
                              onChange={(e) => setWatermarkColor(e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer border-none bg-transparent p-0"
                            />
                            <span className="text-xs text-gray-500 font-mono uppercase flex-1">{watermarkColor}</span>
                          </div>
                          <button type="button" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="吸取颜色">
                            <Pipette size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-500">水印文字透明度 {watermarkOpacity}%</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={watermarkOpacity}
                          onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2563EB]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500">快捷水印位置</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'tl', label: '左上' },
                          { value: 'tr', label: '右上' },
                          { value: 'bl', label: '左下' },
                          { value: 'br', label: '右下' },
                        ].map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setPosition(item.value as 'tl' | 'tr' | 'bl' | 'br')}
                            className={clsx(
                              'h-10 rounded-xl border text-sm font-medium transition-all',
                              position === item.value
                                ? 'border-[#2563EB] bg-[#2563EB] text-white'
                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                            )}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-black/5 bg-gray-50/70 p-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-500">自定义水印位置</label>
                        <button
                          type="button"
                          onClick={() => setPosition('custom')}
                          className={clsx(
                            'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                            position === 'custom'
                              ? 'bg-[#2563EB] text-white border-[#2563EB]'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          )}
                        >
                          启用自定义
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400">X 坐标</label>
                          <input
                            type="number"
                            value={customX}
                            onChange={(e) => setCustomX(Number(e.target.value))}
                            disabled={position !== 'custom'}
                            className={clsx(
                              'w-full px-3 py-2 rounded-xl border text-sm outline-none transition-colors',
                              position === 'custom'
                                ? 'bg-white border-gray-200 focus:border-[#2563EB]'
                                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            )}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400">Y 坐标</label>
                          <input
                            type="number"
                            value={customY}
                            onChange={(e) => setCustomY(Number(e.target.value))}
                            disabled={position !== 'custom'}
                            className={clsx(
                              'w-full px-3 py-2 rounded-xl border text-sm outline-none transition-colors',
                              position === 'custom'
                                ? 'bg-white border-gray-200 focus:border-[#2563EB]'
                                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-gray-100" />

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900">导出参数</h3>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-500">导出格式</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['jpg', 'png', 'gif'].map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setFormat(fmt as 'jpg' | 'png' | 'gif')}
                          className={clsx(
                            'py-2.5 rounded-xl text-sm font-medium transition-all uppercase border',
                            format === fmt
                              ? 'bg-[#2563EB] text-white border-[#2563EB]'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          )}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <label className={clsx('text-xs font-medium', format === 'png' ? 'text-gray-300' : 'text-gray-500')}>
                        导出质量
                      </label>
                      <span className={clsx('text-xs font-mono', format === 'png' ? 'text-gray-300' : 'text-gray-500')}>
                        {quality}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      disabled={format === 'png'}
                      className={clsx(
                        'w-full h-1.5 rounded-lg appearance-none',
                        format === 'png'
                          ? 'bg-gray-100 cursor-not-allowed [&::-webkit-slider-thumb]:hidden'
                          : 'bg-gray-200 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2563EB]'
                      )}
                    />
                    {format === 'png' && (
                      <div className="flex items-start gap-1.5 text-xs text-amber-500 bg-amber-50 p-2 rounded-lg">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        PNG格式为无损格式，导出质量设置对PNG无效
                      </div>
                    )}
                  </div>
                  </div>
                </div>
              )}

              {enableSceneSelection && activeStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">导出场景</h3>
                    <span className="text-[11px] text-red-500">必选</span>
                  </div>
                  <div className="text-xs leading-5 text-gray-500">
                    请选择一个具体用途。勾选后即可作为本次导出的场景用途。
                  </div>
                  <div className="space-y-3">
                    {Object.entries(SCENE_OPTIONS).map(([key, config]) => (
                      <div key={key} className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                        <div className="px-4 py-3 flex items-center justify-between bg-gray-50/60">
                          <div className="text-sm font-semibold text-gray-900">{config.label}</div>
                          {sceneCategory === key && <Check size={16} className="text-[#2563EB]" />}
                        </div>
                        <div className="px-3 py-3 flex flex-wrap gap-2">
                          {config.options.map((option) => (
                            <label
                              key={option}
                              className={clsx(
                                'inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 transition-colors cursor-pointer select-none',
                                sceneCategory === key && sceneOption === option
                                  ? 'border-[#2563EB] bg-[#EFF6FF]'
                                  : 'border-gray-200 bg-white hover:bg-gray-50'
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={sceneCategory === key && sceneOption === option}
                                onChange={() => {
                                  if (sceneCategory === key && sceneOption === option) {
                                    setSceneCategory('');
                                    setSceneOption('');
                                    setSceneOtherValue('');
                                    setSceneError('');
                                    return;
                                  }
                                  setSceneCategory(key as ExportSceneCategory);
                                  setSceneOption(option);
                                  setSceneError('');
                                  if (option !== '其他') setSceneOtherValue('');
                                }}
                                className="sr-only"
                              />
                              <span
                                className={clsx(
                                  'flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors',
                                  sceneCategory === key && sceneOption === option
                                    ? 'border-[#2563EB] bg-[#2563EB]'
                                    : 'border-gray-300 bg-white'
                                )}
                              >
                                {sceneCategory === key && sceneOption === option && <Check size={12} className="text-white" />}
                              </span>
                              <span
                                className={clsx(
                                  'text-[13px] leading-none transition-colors',
                                  sceneCategory === key && sceneOption === option ? 'font-medium text-gray-900' : 'text-gray-600'
                                )}
                              >
                                {option}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {needsSceneOtherInput && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-gray-500">其他场景说明</label>
                      <input
                        type="text"
                        value={sceneOtherValue}
                        onChange={(event) => {
                          setSceneOtherValue(event.target.value);
                          setSceneError('');
                        }}
                        placeholder="请输入具体场景"
                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#2563EB] focus:outline-none text-sm transition-all"
                      />
                    </div>
                  )}

                  {sceneError && <div className="text-xs text-red-500">{sceneError}</div>}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              {activeStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  上一步
                </button>
              )}
              {activeStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 py-2.5 rounded-xl bg-[#2563EB] text-white font-medium hover:bg-[#1D4ED8] transition-colors shadow-lg shadow-[#2563EB]/20"
                >
                  下一步
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!canConfirm}
                  className={clsx(
                    'flex-1 py-2.5 rounded-xl text-white font-medium transition-colors shadow-lg',
                    canConfirm
                      ? 'bg-[#2563EB] hover:bg-[#1D4ED8] shadow-[#2563EB]/20'
                      : 'bg-gray-300 cursor-not-allowed shadow-transparent'
                  )}
                >
                  确认导出
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

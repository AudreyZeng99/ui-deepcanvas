import { useMemo, useState } from 'react';
import { Copy, Sparkles } from 'lucide-react';
import ToolLayout from './ToolLayout';
import { useToast } from '../../components/ToastProvider';

function buildCopyResult(sourceText: string) {
  const raw = sourceText.trim();
  const normalized = raw.replace(/\s+/g, ' ');
  const summary = normalized.length > 90 ? `${normalized.slice(0, 90)}…` : normalized;
  const keywords = normalized
    .split(/[\s，,。；;、\n]+/g)
    .map((w) => w.trim())
    .filter(Boolean)
    .slice(0, 10);
  const keywordLine = keywords.length ? `关键词：${keywords.join(' / ')}` : '关键词：—';

  const professional = [
    '版本 1（专业清晰）',
    `主标题：${summary || '一句话说清楚你的核心价值'}`,
    '副标题：突出场景 + 价值 + 可信背书（可选）',
    '要点：',
    '1）价值点：更快 / 更省 / 更稳 / 更好看（按需替换）',
    '2）适用场景：适合活动 / 投放 / 社区 / 站内等',
    '3）行动指引：现在开始 / 立即使用 / 一键生成',
    'CTA：立即查看 / 立即体验 / 领取方案',
  ].join('\n');

  const lively = [
    '版本 2（更有情绪）',
    `主标题：${summary ? `${summary}，这次换个更“会说话”的版本` : '这次，让文案更会说话'}`,
    '副标题：把优势讲到点上，把用户拉进来',
    '短句：更顺、更准、更抓眼',
    'CTA：一键优化',
  ].join('\n');

  const promo = [
    '版本 3（转化导向）',
    `主标题：${summary ? `${summary}｜限时直达更高转化` : '限时直达更高转化'}`,
    '副标题：卖点更聚焦，信息更有层次，CTA 更明确',
    '三段式：痛点 → 方案 → 收益',
    'CTA：立即生成文案',
  ].join('\n');

  return [
    'AI 文案生成结果',
    '',
    `原文摘要：${summary || '—'}`,
    keywordLine,
    '',
    professional,
    '',
    lively,
    '',
    promo,
  ].join('\n');
}

export default function AICopy() {
  const toast = useToast();
  const [sourceText, setSourceText] = useState('');
  const [resultText, setResultText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const canGenerate = useMemo(() => sourceText.trim().length > 0 && !isGenerating, [isGenerating, sourceText]);
  const canCopy = useMemo(() => resultText.trim().length > 0, [resultText]);

  const handleGenerate = () => {
    const value = sourceText.trim();
    if (!value) {
      toast.show('请先输入原始文本');
      return;
    }
    setIsGenerating(true);
    const next = buildCopyResult(value);
    window.setTimeout(() => {
      setResultText(next);
      setIsGenerating(false);
    }, 450);
  };

  const handleCopy = async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(resultText);
      toast.show('已复制到剪贴板');
    } catch {
      toast.show('复制失败，请手动复制');
    }
  };

  return (
    <ToolLayout title="AI 文案">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-3xl border border-black/5 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-base font-semibold text-gray-900">AI 文案优化</div>
              <div className="text-sm text-gray-500">输入原始文案，一键生成更清晰、更可用的版本</div>
            </div>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[rgba(143,122,251,0.12)] text-[#6F58F3]">
              <Sparkles size={20} />
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-700">原始文本</div>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    if (canGenerate) handleGenerate();
                  }
                }}
                placeholder="粘贴你的原始文案，例如：活动标题、卖点说明、产品介绍、详情页信息等"
                className="w-full min-h-[320px] rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-4 transition-all"
                style={{
                  ['--tw-ring-color' as any]: 'rgba(143, 122, 251, 0.12)',
                  ['--tw-ring-opacity' as any]: '1',
                }}
              />
              <div className="text-xs text-gray-500">快捷键：⌘/Ctrl + Enter 生成</div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                className="h-10 px-4 rounded-2xl border border-black/5 bg-white text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setSourceText('');
                  setResultText('');
                }}
                disabled={isGenerating}
              >
                清空
              </button>
              <button
                type="button"
                className="h-10 px-4 rounded-2xl text-sm font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#8F7AFB' }}
                onMouseEnter={(e) => {
                  if ((e.currentTarget as HTMLButtonElement).disabled) return;
                  e.currentTarget.style.backgroundColor = '#7C67F5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#8F7AFB';
                }}
                onClick={handleGenerate}
                disabled={!canGenerate}
              >
                {isGenerating ? '生成中…' : '生成文案'}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-black/5 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-black/5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-base font-semibold text-gray-900">生成结果</div>
              <div className="text-sm text-gray-500">右侧展示生成的文案版本，可直接复制使用</div>
            </div>
            <button
              type="button"
              className="h-10 px-4 rounded-2xl border border-black/5 bg-white text-sm font-semibold text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              onClick={handleCopy}
              disabled={!canCopy}
            >
              <Copy size={16} />
              复制结果
            </button>
          </div>
          <div className="p-6">
            {resultText.trim() ? (
              <pre className="whitespace-pre-wrap text-sm text-gray-900 leading-relaxed font-sans rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 min-h-[420px]">
                {resultText}
              </pre>
            ) : (
              <div className="flex items-center justify-center min-h-[420px] rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                <div className="text-center space-y-2 px-6">
                  <div className="text-sm font-semibold text-gray-700">还没有结果</div>
                  <div className="text-sm text-gray-500">在左侧输入原始文本，点击“生成文案”</div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </ToolLayout>
  );
}

import { useEffect, useState } from 'react';
import { AlertTriangle, ShieldAlert, X } from 'lucide-react';

const RISK_NOTICE_STORAGE_KEY = 'deepcanvas_risk_notice_ack_v1';

export default function RiskNotice() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const acknowledged = window.localStorage.getItem(RISK_NOTICE_STORAGE_KEY) === '1';
    if (!acknowledged) {
      setIsOpen(true);
    }
  }, []);

  const handleAcknowledge = () => {
    window.localStorage.setItem(RISK_NOTICE_STORAGE_KEY, '1');
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-5 bottom-5 z-[70] inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-lg shadow-black/5 transition-colors hover:bg-gray-50"
      >
        <ShieldAlert size={16} className="text-amber-500" />
        风险提示
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[24px] border border-black/5 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900">AI 使用风险提示</div>
                  <div className="mt-1 text-sm text-gray-500">请在使用前仔细阅读以下内容</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.localStorage.getItem(RISK_NOTICE_STORAGE_KEY) === '1') {
                    setIsOpen(false);
                  }
                }}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="关闭风险提示"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[60vh] space-y-5 overflow-y-auto px-6 py-6 text-sm leading-7 text-gray-700">
              <p>
                欢迎使用 Deepcanvas。平台内提供的 AI 设计、生图、改图、抠图、文案生成等能力，仅可用于合法、合规、正当的业务和创意场景。
              </p>
              <div>
                <div className="mb-2 font-semibold text-gray-900">请勿使用 AI 从事以下行为：</div>
                <ul className="space-y-2 text-gray-600">
                  <li>1. 生成、传播违法违规、涉黄涉暴、涉赌涉毒、恐怖极端、仇恨歧视等内容。</li>
                  <li>2. 伪造公文证照、冒充机构或个人身份、编造虚假信息、误导公众。</li>
                  <li>3. 侵犯他人知识产权、肖像权、名誉权、隐私权或其他合法权益。</li>
                  <li>4. 生成不符合金融、政务、宣传、党建等严肃场景规范的违规内容。</li>
                  <li>5. 将 AI 能力用于任何违反国家法律法规、行业监管要求和公司管理制度的用途。</li>
                </ul>
              </div>
              <div>
                <div className="mb-2 font-semibold text-gray-900">使用要求：</div>
                <ul className="space-y-2 text-gray-600">
                  <li>1. 请确保上传素材、输入文本、输出内容均具备合法来源与使用权限。</li>
                  <li>2. 对外发布前，请结合业务规范、品牌规范和人工审核流程进行复核。</li>
                  <li>3. 若用于正式宣传、投放、对客营销或内部正式传播，请勿绕过应有审批流程。</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                如因违规使用 AI 生成能力造成风险、纠纷或损失，相关责任需由使用方自行承担。
              </div>
            </div>

            <div className="border-t border-black/5 px-6 py-5">
              <button
                type="button"
                onClick={handleAcknowledge}
                className="w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-900"
              >
                我已阅读并知悉上述风险提示内容
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useState } from 'react';
import { BookOpen, HelpCircle, Send, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export default function Feedback() {
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'manual' | 'faq' | 'new-issue'>('new-issue');

  const faqs = [
    { q: '如何导出我的设计？', a: '点击编辑器右上角的“导出”按钮，选择您需要的格式（PNG, JPG, PDF）即可下载。' },
    { q: '支持哪些快捷键？', a: '您可以按下 "/" 键查看完整的快捷键列表。常用的包括：Ctrl+C (复制), Ctrl+V (粘贴), Ctrl+Z (撤销)。' },
    { q: '如何添加自定义字体？', a: '目前暂不支持上传自定义字体，我们正在开发此功能，敬请期待。' },
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">用户意见收集</h1>
        <p className="text-gray-500">您的反馈是我们改进产品的动力。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Cards */}
        <button
          onClick={() => setActiveTab('manual')}
          className={clsx(
            "p-6 rounded-2xl border transition-all text-left group",
            activeTab === 'manual' 
              ? "border-black bg-black text-white shadow-lg scale-[1.02]" 
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
          )}
        >
          <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center mb-4", activeTab === 'manual' ? "bg-white/20" : "bg-blue-50 text-blue-600")}>
            <BookOpen size={20} />
          </div>
          <h3 className="font-bold text-lg mb-1">操作手册</h3>
          <p className={clsx("text-sm", activeTab === 'manual' ? "text-white/70" : "text-gray-500")}>阅读当前版本的功能使用说明</p>
        </button>

        <button
          onClick={() => setActiveTab('faq')}
          className={clsx(
            "p-6 rounded-2xl border transition-all text-left group",
            activeTab === 'faq' 
              ? "border-black bg-black text-white shadow-lg scale-[1.02]" 
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
          )}
        >
          <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center mb-4", activeTab === 'faq' ? "bg-white/20" : "bg-green-50 text-green-600")}>
            <HelpCircle size={20} />
          </div>
          <h3 className="font-bold text-lg mb-1">常见问题</h3>
          <p className={clsx("text-sm", activeTab === 'faq' ? "text-white/70" : "text-gray-500")}>快速查找常见问题的解答</p>
        </button>

        <button
          onClick={() => setActiveTab('new-issue')}
          className={clsx(
            "p-6 rounded-2xl border transition-all text-left group",
            activeTab === 'new-issue' 
              ? "border-black bg-black text-white shadow-lg scale-[1.02]" 
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
          )}
        >
          <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center mb-4", activeTab === 'new-issue' ? "bg-white/20" : "bg-orange-50 text-orange-600")}>
            <AlertCircle size={20} />
          </div>
          <h3 className="font-bold text-lg mb-1">新建问题</h3>
          <p className={clsx("text-sm", activeTab === 'new-issue' ? "text-white/70" : "text-gray-500")}>提交您遇到的问题或建议</p>
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 min-h-[400px] shadow-sm">
        {activeTab === 'manual' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">操作手册 (v1.0.0)</h2>
              <button className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                下载 PDF
              </button>
            </div>
            <div className="prose prose-gray max-w-none">
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 space-y-4">
                <h3 className="font-bold text-lg">1. 快速开始</h3>
                <p>欢迎使用 DeepCanvas。通过左侧导航栏，您可以快速访问不同的设计工具。点击“创建设计”进入主编辑器。</p>
                <div className="h-px bg-gray-200" />
                <h3 className="font-bold text-lg">2. AI 生图</h3>
                <p>在编辑器中，点击工具栏的“AI”图标，输入提示词即可生成高质量图片。支持拖拽直接添加到画布。</p>
                <div className="h-px bg-gray-200" />
                <h3 className="font-bold text-lg">3. 资产管理</h3>
                <p>您的所有上传图片和生成图片都会保存在“资产管理”中，方便随时调用。</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-2xl font-bold">常见问题解答</h2>
            <div className="grid gap-4">
              {faqs.map((faq, index) => (
                <div key={index} className="p-5 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-2">
                    <span className="text-blue-500">Q:</span> {faq.q}
                  </h3>
                  <p className="text-gray-600 pl-6">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'new-issue' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-300">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">提交新问题</h2>
              <p className="text-gray-500">请详细描述您遇到的问题，我们会尽快处理。</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">问题标题</label>
                <input
                  type="text"
                  value={issueTitle}
                  onChange={(e) => setIssueTitle(e.target.value)}
                  placeholder="简要描述问题，如：AI生成图片失败"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">问题描述</label>
                <textarea
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="请详细描述问题的复现步骤和现象..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all resize-none"
                />
              </div>

              <div className="flex justify-center pt-4">
                <button 
                  className="w-full py-3 px-6 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  onClick={() => {
                  if (!issueTitle || !issueDescription) {
                    alert('请填写完整信息');
                    return;
                  }
                  alert('提交成功！感谢您的反馈。');
                  setIssueTitle('');
                  setIssueDescription('');
                }}
                >
                  <Send size={18} />
                  提交反馈
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

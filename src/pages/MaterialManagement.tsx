import { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  FileText, 
  MessageSquare, 
  Settings, 
  Users, 
  Upload, 
  Trash2, 
  Download,
  Image as ImageIcon,
  Send,
  Check,
  HelpCircle
} from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

export default function MaterialManagement() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('feedback');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
              <Settings size={18} />
            </div>
            <h1 className="font-bold text-lg">素材管理后台</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem 
            icon={Users} 
            label="用户管理" 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')} 
          />
          <SidebarItem 
            icon={ImageIcon} 
            label="素材库管理" 
            active={activeTab === 'materials'} 
            onClick={() => setActiveTab('materials')} 
          />
          <SidebarItem 
            icon={MessageSquare} 
            label="用户意见收集" 
            active={activeTab === 'feedback'} 
            onClick={() => setActiveTab('feedback')} 
          />
          <SidebarItem 
            icon={Settings} 
            label="系统设置" 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
          />
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h2 className="text-xl font-bold text-gray-800">
            {activeTab === 'feedback' && '用户意见收集与反馈'}
            {activeTab === 'users' && '用户管理'}
            {activeTab === 'materials' && '素材库管理'}
            {activeTab === 'settings' && '系统设置'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              管理员在线
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === 'feedback' && <FeedbackManagement />}
          {activeTab !== 'feedback' && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Settings size={48} className="mb-4 opacity-20" />
              <p>该模块正在开发中...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
        active 
          ? "bg-black text-white shadow-md" 
          : "text-gray-600 hover:bg-gray-100"
      )}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}

function FeedbackManagement() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Section 1: Manual Upload */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="text-blue-500" size={20} />
              操作手册管理
            </h3>
            <p className="text-sm text-gray-500 mt-1">上传或更新用户帮助中心的操作手册文档</p>
          </div>
          <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2">
            <Upload size={16} />
            上传新版本
          </button>
        </div>
        
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-3 group-hover:scale-110 transition-transform">
            <FileText size={24} />
          </div>
          <h4 className="font-medium text-gray-900">点击或拖拽上传 Word 文档</h4>
          <p className="text-xs text-gray-400 mt-1">支持 .doc, .docx 格式，最大 10MB</p>
          
          <div className="mt-6 w-full max-w-md bg-white border border-gray-100 rounded-lg p-3 flex items-center gap-3 text-left">
            <div className="w-8 h-8 bg-blue-100 rounded text-blue-600 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold">DOC</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">DeepCanvas_User_Manual_v2.4.docx</p>
              <p className="text-xs text-gray-400">更新于 2024-02-28 14:30</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600">
              <Download size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: FAQ Management */}
      <FAQSection />

      {/* Section 3: User Feedback List */}
      <UserFeedbackList />
    </div>
  );
}

function FAQSection() {
  const [faqs, setFaqs] = useState([
    { id: 1, question: '如何导出高清图片？', answer: '在编辑页面右上角点击“导出”按钮，选择 PNG 格式并设置 2x 或更高倍率即可导出高清素材。' },
    { id: 2, question: 'AI 额度如何获取？', answer: '新用户注册即送 50 点数，每日登录可领取 10 点数。也可以通过邀请好友获取更多额度。' },
    { id: 3, question: '支持哪些格式的文件上传？', answer: '目前支持 JPG, PNG, SVG 格式的图片素材上传，单张大小限制在 5MB 以内。' },
  ]);

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="text-orange-500" size={20} />
            常见问题 (FAQ) 配置
          </h3>
          <p className="text-sm text-gray-500 mt-1">管理帮助中心展示的常见问题列表</p>
        </div>
        <button 
          onClick={() => setFaqs([...faqs, { id: Date.now(), question: '新问题', answer: '请输入回答内容...' }])}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          添加问题
        </button>
      </div>

      <div className="space-y-4">
        {faqs.map(faq => (
          <div key={faq.id} className="group border border-gray-100 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all bg-gray-50/50 hover:bg-white">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">Q</span>
                  <input 
                    value={faq.question}
                    onChange={(e) => {
                      const newFaqs = faqs.map(f => f.id === faq.id ? { ...f, question: e.target.value } : f);
                      setFaqs(newFaqs);
                    }}
                    className="flex-1 bg-transparent border-none p-0 font-medium text-gray-900 focus:ring-0 placeholder:text-gray-400"
                    placeholder="输入问题..."
                  />
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold mt-0.5">A</span>
                  <textarea 
                    value={faq.answer}
                    onChange={(e) => {
                      const newFaqs = faqs.map(f => f.id === faq.id ? { ...f, answer: e.target.value } : f);
                      setFaqs(newFaqs);
                    }}
                    rows={2}
                    className="flex-1 bg-transparent border-none p-0 text-sm text-gray-600 focus:ring-0 placeholder:text-gray-400 resize-none"
                    placeholder="输入回答..."
                  />
                </div>
              </div>
              <button 
                onClick={() => setFaqs(faqs.filter(f => f.id !== faq.id))}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function UserFeedbackList() {
  const [feedbacks, setFeedbacks] = useState([
    { 
      id: 1, 
      user: '设计师小王', 
      contact: 'wang@example.com',
      title: '建议增加批量导出功能', 
      desc: '目前只能一张张导出，做系列图的时候非常麻烦，希望能支持批量导出所有画板。',
      images: ['https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&q=80'],
      status: 'pending',
      date: '2024-02-28 10:23'
    },
    { 
      id: 2, 
      user: '独立开发者', 
      contact: '13800138000',
      title: 'AI 生成速度变慢了', 
      desc: '最近几天生成图片的等待时间明显变长，有时候需要等 1 分钟以上，请检查一下服务器。',
      images: [],
      status: 'replied',
      date: '2024-02-27 15:45'
    },
    { 
      id: 3, 
      user: 'UI_Master', 
      contact: '微信: uimaster',
      title: '字体缺失', 
      desc: '常用的 PingFang SC 字体在列表里找不到，导致设计稿还原度有问题。',
      images: ['https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=200&q=80'],
      status: 'pending',
      date: '2024-02-27 09:12'
    }
  ]);
  
  const [replyId, setReplyId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const handleReply = (id: number) => {
    // Mock reply submission
    setFeedbacks(feedbacks.map(f => f.id === id ? { ...f, status: 'replied' } : f));
    setReplyId(null);
    setReplyContent('');
  };

  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="text-purple-500" size={20} />
            用户反馈列表
          </h3>
          <p className="text-sm text-gray-500 mt-1">查看并回复用户提交的问题和建议</p>
        </div>
        <div className="flex gap-2">
           <div className="relative">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input type="text" placeholder="搜索反馈..." className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black/20" />
           </div>
           <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
             <Filter size={16} />
           </button>
        </div>
      </div>

      <div className="space-y-4">
        {feedbacks.map(item => (
          <div key={item.id} className="border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all bg-white">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <span className={clsx(
                  "w-2 h-2 rounded-full",
                  item.status === 'pending' ? "bg-red-500" : "bg-green-500"
                )} />
                <h4 className="font-bold text-gray-900">{item.title}</h4>
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{item.date}</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-xs text-gray-500">来自: {item.user}</span>
                 <div className="h-3 w-px bg-gray-200" />
                 <span className="text-xs text-gray-500">{item.contact}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              {item.desc || <span className="text-gray-400 italic">无详细描述</span>}
            </p>
            
            {item.images.length > 0 && (
              <div className="flex gap-2 mb-4">
                {item.images.map((img, idx) => (
                  <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90">
                    <img src={img} alt="Feedback attachment" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            
            <div className="border-t border-gray-100 pt-4">
              {replyId === item.id ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <textarea 
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none"
                    placeholder="请输入回复内容..."
                    rows={3}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setReplyId(null)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      取消
                    </button>
                    <button 
                      onClick={() => handleReply(item.id)}
                      className="px-3 py-1.5 text-xs font-medium bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                    >
                      <Send size={12} />
                      发送回复
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                   {item.status === 'replied' ? (
                     <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                       <Check size={12} />
                       已回复
                     </span>
                   ) : (
                     <button 
                       onClick={() => setReplyId(item.id)}
                       className="flex items-center gap-1.5 text-xs font-medium text-black bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                     >
                       <MessageSquare size={12} />
                       回复问题
                     </button>
                   )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
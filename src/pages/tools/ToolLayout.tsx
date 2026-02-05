import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface ToolLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function ToolLayout({ title, children }: ToolLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </header>
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </div>
  );
}

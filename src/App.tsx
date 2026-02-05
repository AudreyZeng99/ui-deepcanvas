import { useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Home from './pages/Home';
import Editor from './pages/Editor';
import Gallery from './pages/Gallery';
import DesignSystem from './pages/DesignSystem';
import Inspiration from './pages/Inspiration';
import TextToImage from './pages/TextToImage';
import Templates from './pages/Templates';
import Settings from './pages/Settings';
import { ProjectProvider } from './context/ProjectContext';
import Projects from './pages/Projects';
import AIEdit from './pages/tools/AIEdit';
import AIErase from './pages/tools/AIErase';
import AIMatting from './pages/tools/AIMatting';
import AIBlend from './pages/tools/AIBlend';
import MD2Card from './pages/tools/MD2Card';
import PPTGen from './pages/tools/PPTGen';
import IDPhoto from './pages/tools/IDPhoto';
import OldPhotoRestore from './pages/tools/OldPhotoRestore';
import clsx from 'clsx';

function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isToolPage = location.pathname.startsWith('/tools/');
  const showSidebar = !isHome && !isToolPage;
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {showSidebar && (
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
      )}
      <main 
        className={clsx(
          "flex-1 transition-all duration-300 relative", 
          showSidebar ? (isSidebarCollapsed ? "ml-20" : "ml-64") : ""
        )}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/design-system" element={<DesignSystem />} />
          <Route path="/inspiration" element={<Inspiration />} />
          <Route path="/text-to-image" element={<TextToImage />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/settings" element={<Settings />} />
          
          {/* Tool Pages */}
          <Route path="/tools/ai-edit" element={<AIEdit />} />
          <Route path="/tools/ai-erase" element={<AIErase />} />
          <Route path="/tools/ai-matting" element={<AIMatting />} />
          <Route path="/tools/ai-blend" element={<AIBlend />} />
          <Route path="/tools/md2card" element={<MD2Card />} />
          <Route path="/tools/ppt-gen" element={<PPTGen />} />
          <Route path="/tools/id-photo" element={<IDPhoto />} />
          <Route path="/tools/old-photo" element={<OldPhotoRestore />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ProjectProvider>
      <Router>
        <Layout />
      </Router>
    </ProjectProvider>
  );
}

export default App;

import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Home from './pages/Home';
import Editor from './pages/Editor';
import MaterialEditor from './pages/MaterialEditor';
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
import AICopy from './pages/tools/AICopy';
import IDPhoto from './pages/tools/IDPhoto';
import OldPhotoRestore from './pages/tools/OldPhotoRestore';
import MaterialBatchGenerator from './pages/tools/MaterialBatchGenerator';
import clsx from 'clsx';
import Feedback from './pages/Feedback';

import MaterialManagement from './pages/MaterialManagement';
import { ToastProvider } from './components/ToastProvider';
import AIAdDesignAssistant from './pages/AIAdDesignAssistant';
import AIAdProjectCanvas from './pages/AIAdProjectCanvas';
import PublicCanvas from './pages/PublicCanvas';
import LayerLibrary from './pages/LayerLibrary';

function Layout() {
  const location = useLocation();
  const isMaterialManagement = location.pathname === '/material-management';
  const isAIAdDesignAssistant = location.pathname.startsWith('/ai-ad-design-assistant');
  const isCanvasLike =
    location.pathname === '/editor' ||
    location.pathname === '/public-canvas' ||
    location.pathname === '/material-editor';
  const showSidebar = !isMaterialManagement && !isAIAdDesignAssistant && !isCanvasLike;

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {showSidebar && (
        <Sidebar />
      )}
      <main 
        className={clsx(
          "flex-1 transition-all duration-300 relative", 
          showSidebar ? "ml-20" : ""
        )}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/layer-library" element={<LayerLibrary />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/public" element={<Projects />} />
          <Route path="/public-canvas" element={<PublicCanvas />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/material-editor" element={<MaterialEditor />} />
          <Route path="/ai-ad-design-assistant" element={<AIAdDesignAssistant />} />
          <Route path="/ai-ad-design-assistant/projects/:projectInternalId" element={<AIAdProjectCanvas />} />
          <Route path="/material-management" element={<MaterialManagement />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/design-system" element={<DesignSystem />} />
          <Route path="/inspiration" element={<Inspiration />} />
          <Route path="/text-to-image" element={<TextToImage />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/team-templates" element={<Templates scope="team" />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/feedback" element={<Feedback />} />
          
          {/* Tool Pages */}
          <Route path="/tools/ai-edit" element={<AIEdit />} />
          <Route path="/tools/ai-erase" element={<AIErase />} />
          <Route path="/tools/ai-matting" element={<AIMatting />} />
          <Route path="/tools/ai-blend" element={<AIBlend />} />
          <Route path="/tools/ai-copy" element={<AICopy />} />
          <Route path="/tools/md2card" element={<MD2Card />} />
          <Route path="/tools/ppt-gen" element={<PPTGen />} />
          <Route path="/tools/id-photo" element={<IDPhoto />} />
          <Route path="/tools/old-photo" element={<OldPhotoRestore />} />
          <Route path="/tools/material-batch-generator" element={<MaterialBatchGenerator />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ProjectProvider>
      <ToastProvider>
        <Router>
          <Layout />
        </Router>
      </ToastProvider>
    </ProjectProvider>
  );
}

export default App;

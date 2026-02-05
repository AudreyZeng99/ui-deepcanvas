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
import clsx from 'clsx';

function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {!isHome && (
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
      )}
      <main 
        className={clsx(
          "flex-1 transition-all duration-300 relative", 
          !isHome && (isSidebarCollapsed ? "ml-20" : "ml-64")
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

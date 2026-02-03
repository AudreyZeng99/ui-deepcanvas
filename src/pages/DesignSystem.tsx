import { useTheme } from '../theme/ThemeContext';
import clsx from 'clsx';
import { Check, Settings, PenTool, Wand2, LayoutGrid, Share2, Download, Plus, ArrowRight, User, X, ChevronDown } from 'lucide-react';

export default function DesignSystem() {
  const { theme, setTheme, availableThemes } = useTheme();

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 p-8">
      <header className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tight">Design System</h1>
        <p className="text-xl opacity-60">{theme.description}</p>
      </header>

      {/* Theme Switcher */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Active Theme</h2>
        <p className="text-gray-600 max-w-2xl">
          控制全站的主题色模式（如深色/浅色/自定义），决定了全局的基础色调映射。
          切换主题会实时更新下方 Color Palette 中的所有颜色变量值。
        </p>
        <div className="flex flex-wrap gap-4">
          {availableThemes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={clsx(
                "group relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left min-w-[240px]",
                theme.id === t.id 
                  ? "border-accent-primary bg-white shadow-lg ring-1 ring-accent-primary" 
                  : "border-black/5 bg-white/50 hover:bg-white hover:shadow-md"
              )}
            >
              <div className="flex gap-1">
                <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: t.colors.background }} />
                <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: t.colors.accentPrimary }} />
                <div className="w-6 h-6 rounded-full border border-black/5" style={{ backgroundColor: t.colors.accentPromotion }} />
              </div>
              <div className="flex-1">
                 <div className="font-medium">{t.name}</div>
              </div>
              {theme.id === t.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-accent-primary text-white rounded-full flex items-center justify-center">
                  <Check size={12} strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
           <strong>How to add a new theme:</strong> Open <code>src/theme/themes.ts</code> and add a new object to the <code>themes</code> array. You can define background, foreground, and accent colors there.
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <ColorCard name="Background" hex={theme.colors.background} variable="--background" className="border border-black/10" style={{ backgroundColor: theme.colors.background, color: theme.colors.foreground }} />
          <ColorCard name="Foreground" hex={theme.colors.foreground} variable="--foreground" className="text-white" style={{ backgroundColor: theme.colors.foreground }} />
          <ColorCard name="Primary" hex={theme.colors.primary} variable="--primary" className="text-white" style={{ backgroundColor: theme.colors.primary }} />
          
          {/* 5-Level Semantic Colors */}
          <ColorCard name="Promotion" hex={theme.colors.promotion} variable="--promotion" className="text-white" style={{ backgroundColor: theme.colors.promotion, color: theme.colors.promotionForeground }} />
          <ColorCard name="Minor" hex={theme.colors.minor} variable="--minor" className="text-white" style={{ backgroundColor: theme.colors.minor, color: theme.colors.minorForeground }} />

          <ColorCard name="Accent Primary" hex={theme.colors.accentPrimary} variable="--accent-primary" className="text-white" style={{ backgroundColor: theme.colors.accentPrimary }} />
          <ColorCard name="Accent Promotion" hex={theme.colors.accentPromotion} variable="--accent-promotion" className="text-white" style={{ backgroundColor: theme.colors.accentPromotion }} />
          <ColorCard name="Accent Minor" hex={theme.colors.accentMinor} variable="--accent-minor" className="text-white" style={{ backgroundColor: theme.colors.accentMinor }} />
          
          {/* Card Semantics */}
          <ColorCard name="Card Primary" hex={theme.colors.cardPrimary} variable="--card-primary" className="text-white border border-black/10" style={{ backgroundColor: theme.colors.cardPrimary }} />
          <ColorCard name="Card Dark" hex={theme.colors.cardDark} variable="--card-dark" className="text-white" style={{ backgroundColor: theme.colors.cardDark }} />
          <ColorCard name="Card Light" hex={theme.colors.cardLight} variable="--card-light" className="text-black border border-black/10" style={{ backgroundColor: theme.colors.cardLight }} />

          {theme.colors.accentPurple && (
             <ColorCard name="Accent Purple" hex={theme.colors.accentPurple} variable="--accent-purple" className="text-white" style={{ backgroundColor: theme.colors.accentPurple }} />
          )}
          {theme.colors.accentGreen && (
             <ColorCard name="Accent Green" hex={theme.colors.accentGreen} variable="--accent-green" className="text-white" style={{ backgroundColor: theme.colors.accentGreen }} />
          )}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Typography</h2>
        <div className="glass-panel p-8 space-y-6">
          <div className="space-y-2">
            <p className="text-sm opacity-50">Display / H1</p>
            {/* Graffiti Style for Nunito Theme Example */}
            {theme.id === 'nunito-vibrant' ? (
              <h1 className="text-6xl font-black relative inline-block">
                <span className="relative z-10">Work smarter, faster</span>
                <svg className="absolute -bottom-2 right-0 w-32 h-4 z-0 text-accent-green" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" className="opacity-50" />
                </svg>
                <span className="absolute -top-4 -right-8 text-4xl animate-bounce">✨</span>
              </h1>
            ) : (
              <h1 className="text-6xl font-bold">Swiss Design</h1>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm opacity-50">Heading / H2</p>
            <h2 className="text-4xl font-bold">Minimalist Interface</h2>
          </div>
          <div className="space-y-2">
            <p className="text-sm opacity-50">Body / Large</p>
            <p className="text-xl">The quick brown fox jumps over the lazy dog.</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm opacity-50">Body / Regular</p>
            <p className="text-base opacity-70">This is a paragraph of text designed for readability. The tracking is tight and the font is {theme.fontFamily}.</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Semantic Component States</h2>
        <p className="opacity-60">Hover over elements to see interactive states.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Promotion */}
          <div className="space-y-4">
             <h3 className="font-medium opacity-70">Promotion</h3>
             <div className="p-6 rounded-3xl bg-accent-promotion text-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="font-bold text-lg">Card</div>
                <div className="text-sm opacity-80">Hover me</div>
             </div>
             <button className="w-full py-3 rounded-xl bg-accent-promotion text-white hover:opacity-90 transition-opacity font-medium shadow-sm">
                Button
             </button>
          </div>

          {/* Important (Accent Primary) */}
          <div className="space-y-4">
             <h3 className="font-medium opacity-70">Important (Accent Primary)</h3>
             <div className="p-6 rounded-3xl bg-accent-primary text-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="font-bold text-lg">Card</div>
                <div className="text-sm opacity-80">Hover me</div>
             </div>
             <button className="w-full py-3 rounded-xl bg-accent-primary text-white hover:opacity-90 transition-opacity font-medium shadow-sm">
                Button
             </button>
          </div>

          {/* Normal */}
          <div className="space-y-4">
             <h3 className="font-medium opacity-70">Normal</h3>
             <div className="p-6 rounded-3xl bg-white border border-black/5 text-black hover:shadow-xl hover:-translate-y-1 hover:border-black/10 transition-all duration-300 cursor-pointer">
                <div className="font-bold text-lg">Card</div>
                <div className="text-sm opacity-70">Hover me</div>
             </div>
             <button className="w-full py-3 rounded-xl bg-white border border-black/10 text-black hover:bg-gray-50 transition-all font-medium shadow-sm">
                Button
             </button>
          </div>

          {/* Minor */}
          <div className="space-y-4">
             <h3 className="font-medium opacity-70">Minor</h3>
             <div className="p-6 rounded-3xl bg-minor text-minor-foreground hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="font-bold text-lg">Card</div>
                <div className="text-sm opacity-80">Hover me</div>
             </div>
             <button className="w-full py-3 rounded-xl bg-minor text-minor-foreground hover:opacity-90 transition-opacity font-medium shadow-sm">
                Button
             </button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Components</h2>
        <div className="glass-panel p-8 space-y-12">
          
          {/* Project Button Gallery */}
          <div className="space-y-8">
            <div className="flex items-end justify-between border-b pb-4">
              <h3 className="text-xl font-medium">Button Gallery</h3>
              <p className="text-sm opacity-50">Comprehensive collection of buttons used across the project</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
              
              {/* Header & Navigation Group */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest opacity-40">Header & Navigation</h4>
                <div className="p-6 rounded-2xl border border-black/5 bg-gray-50/50 flex flex-wrap gap-4 items-center">
                  {/* Standard Nav Link */}
                  <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-black/5 transition-colors text-sm font-medium text-gray-700">
                    <LayoutGrid size={16} />
                    Gallery
                  </button>
                  
                  {/* Sign In (Ghost) */}
                  <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-black/5 transition-colors text-sm font-medium text-gray-700">
                    <User size={16} />
                    Sign In
                  </button>

                  {/* CTA Primary */}
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white hover:opacity-80 transition-opacity text-sm font-medium shadow-lg shadow-black/20">
                    Get Started 
                    <ArrowRight size={16} className="opacity-60" />
                  </button>
                </div>
              </div>

              {/* Editor Toolbar Group */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest opacity-40">Editor Toolbar</h4>
                <div className="p-6 rounded-2xl border border-black/5 bg-gray-50/50 flex flex-wrap gap-6 items-center">
                  
                  {/* Tool Group */}
                  <div className="flex items-center gap-1 p-1.5 bg-white rounded-xl border border-black/5 shadow-sm">
                    <button className="p-2 rounded-lg bg-black/5 text-black transition-colors" title="Select">
                      <Settings size={18} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-black/5 transition-colors text-black/60 hover:text-black" title="Draw">
                      <PenTool size={18} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-black/5 transition-colors text-black/60 hover:text-black" title="Magic">
                      <Wand2 size={18} />
                    </button>
                  </div>

                  {/* Dropdown Trigger */}
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 transition-colors text-sm font-medium">
                    <span>100%</span>
                    <ChevronDown size={14} className="opacity-50" />
                  </button>

                </div>
              </div>

              {/* Action Buttons Group */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest opacity-40">Primary Actions</h4>
                <div className="p-6 rounded-2xl border border-black/5 bg-gray-50/50 flex flex-wrap gap-4 items-center">
                  
                  {/* Export (Theme Primary) */}
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-primary text-white hover:opacity-90 transition-opacity font-medium text-sm shadow-sm">
                    <Download size={16} />
                    Export
                  </button>

                  {/* Share (Outline) */}
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-black/10 hover:bg-gray-50 text-black font-medium text-sm shadow-sm transition-colors">
                    <Share2 size={16} />
                    Share
                  </button>

                  {/* Destructive/Cancel */}
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors font-medium text-sm">
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </div>

              {/* Card & Create Actions */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest opacity-40">Card & Creation</h4>
                <div className="p-6 rounded-2xl border border-black/5 bg-gray-50/50 flex flex-wrap gap-4 items-center">
                  
                  {/* New Canvas Card Button */}
                  <button className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 border-dashed border-black/10 hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all gap-2 text-black/40 hover:text-accent-primary">
                    <Plus size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">New</span>
                  </button>

                  {/* Floating Action / Icon Button */}
                  <button className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                    <Plus size={20} />
                  </button>

                  {/* Tag/Filter Button */}
                  <button className="px-3 py-1.5 rounded-full bg-white border border-black/10 text-xs font-medium hover:border-black/30 transition-colors">
                    Filter
                  </button>

                </div>
              </div>

            </div>
          </div>
          
          {/* Visual Effects Section (Moved down) */}
          <div className="space-y-4 border-t pt-8">
            <h3 className="text-lg font-medium opacity-50">Visual Effects</h3>
            <div className="flex flex-wrap gap-8">
              <div className="space-y-2">
                <span className="text-xs font-medium opacity-50 uppercase tracking-wider">Glass Panel (Blur XL)</span>
                <div className="glass-panel p-6 w-64 h-32 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-sm font-medium opacity-50 relative z-10">Hover me</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

function ColorCard({ name, hex, variable, className, style }: { name: string, hex: string, variable: string, className?: string, style?: React.CSSProperties }) {
  return (
    <div className={`p-6 rounded-3xl h-40 flex flex-col justify-between transition-colors duration-300 ${className}`} style={style}>
      <span className="font-medium">{name}</span>
      <div className="text-sm opacity-80">
        <p>{hex}</p>
        <p className="font-mono text-xs opacity-60">{variable}</p>
      </div>
    </div>
  );
}

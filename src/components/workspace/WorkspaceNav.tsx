import { Home, FileText, Settings, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const WorkspaceNav = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="glass-panel border-b border-border/50 px-6 py-4 flex items-center justify-between sticky top-0 z-30 animate-slide-up">
      <Link to="/" className="flex items-center gap-3 group">
        <img src="/logo.svg" alt="EduVoice AI" className="h-10 w-auto drop-shadow-md group-hover:scale-105 transition-transform" />
        <div className="flex flex-col">
          <span className="font-bold text-xl gradient-text leading-none">EduVoice AI</span>
          <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">Voice-first learning workspace</span>
        </div>
      </Link>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="touch-target rounded-xl hover:bg-primary/10 focus-ring"
          title="Home"
        >
          <Home className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="touch-target rounded-xl hover:bg-primary/10 focus-ring"
          title="Documents"
        >
          <FileText className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="touch-target rounded-xl hover:bg-primary/10 focus-ring"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-2" />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="touch-target rounded-xl hover:bg-primary/10 focus-ring"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>
        
        <Button
          className="pill-button bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground shadow-lg glow-hover focus-ring ml-2"
        >
          Sign In
        </Button>
      </div>
    </nav>
  );
};

export default WorkspaceNav;

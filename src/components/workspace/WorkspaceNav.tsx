import { FileText, Home, Moon, Settings, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BrandMark from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface WorkspaceNavProps {
  onSelectPdf?: (file: File) => void;
}

const WorkspaceNav = ({ onSelectPdf }: WorkspaceNavProps) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast.info('Choose a PDF first');
      return;
    }
    if (!file.type.includes('pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }
    try {
      setLoading(true);
      onSelectPdf?.(file);
      setOpen(false);
      setFile(null);
      toast.success('Analyzing PDF…');
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="bg-background/95 backdrop-blur-xl border-b-2 border-border/40 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-lg">
      <Link to="/" className="whitespace-nowrap">
        <BrandMark
          size="sm"
          titleClassName="text-lg tracking-[0.28em]"
          taglineClassName="text-[0.6rem] tracking-[0.16em]"
        />
      </Link>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="touch-target rounded-xl hover:bg-foreground hover:text-background border border-border/30 focus-ring transition-all"
          title="Home"
        >
          <Home className="w-5 h-5" />
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="touch-target rounded-xl hover:bg-foreground hover:text-background border border-border/30 focus-ring transition-all"
              title="Upload & Analyze PDF"
            >
              <FileText className="w-5 h-5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload PDF</DialogTitle>
              <DialogDescription>Select a PDF to extract highlights and add them to your canvas.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleAnalyze} disabled={loading || !file}>Analyze</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Link to="/teacher" title="Teacher Dashboard">
          <Button
            variant="ghost"
            size="icon"
            className="touch-target rounded-xl hover:bg-foreground hover:text-background border border-border/30 focus-ring transition-all"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </Link>

        <div className="w-px h-6 bg-border/50 mx-2" />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="touch-target rounded-xl hover:bg-foreground hover:text-background border border-border/30 focus-ring transition-all"
          title="Toggle Theme"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </Button>

        <Button
          className="pill-button bg-foreground hover:bg-foreground/90 text-background shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all focus-ring ml-2 border-2 border-foreground font-semibold"
        >
          Sign In
        </Button>
      </div>
    </nav>
  );
};

export default WorkspaceNav;

import { Button } from "@/components/ui/button";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col whitespace-nowrap">
          <span className="text-xl font-semibold text-foreground leading-none">EduVoice AI</span>
          <span className="text-xs text-muted-foreground leading-none">Voice-first AI tutor</span>
        </div>

        <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-foreground hover:text-foreground/70 font-medium transition-colors">
              Home
            </a>
            <a href="#solutions" className="text-foreground hover:text-foreground/70 font-medium transition-colors">
              Solutions
            </a>
            <a href="#pricing" className="text-foreground hover:text-foreground/70 font-medium transition-colors">
              Pricing
            </a>
            <a href="#docs" className="text-foreground hover:text-foreground/70 font-medium transition-colors">
              Docs
            </a>
            <a href="#blog" className="text-foreground hover:text-foreground/70 font-medium transition-colors">
              Blog
            </a>
          </div>

          <Button variant="outline" className="rounded-full border-2 border-foreground/20 hover:bg-foreground hover:text-background font-semibold transition-all">
            Sign In
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

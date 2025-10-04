import { Button } from "@/components/ui/button";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.svg" alt="EduVoice AI" className="w-10 h-10 drop-shadow-sm" />
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-foreground leading-none">EduVoice AI</span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Voice-first AI tutor</span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-foreground hover:text-primary transition-colors">
              Home
            </a>
            <a href="#solutions" className="text-foreground hover:text-primary transition-colors">
              Solutions
            </a>
            <a href="#pricing" className="text-foreground hover:text-primary transition-colors">
              Pricing
            </a>
            <a href="#docs" className="text-foreground hover:text-primary transition-colors">
              Docs
            </a>
            <a href="#blog" className="text-foreground hover:text-primary transition-colors">
              Blog
            </a>
          </div>

          <Button variant="outline" className="rounded-full">
            Sign In
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

import BrandMark from "@/components/BrandMark";
import BrandMark from "@/components/BrandMark";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <BrandMark
              size="sm"
              titleClassName="text-lg tracking-[0.28em]"
              taglineClassName="text-[0.65rem] tracking-[0.18em]"
            />
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="font-medium text-foreground transition-colors hover:text-foreground/70">
                Home
              </a>
              <a href="#solutions" className="font-medium text-foreground transition-colors hover:text-foreground/70">
                Solutions
              </a>
              <a href="#pricing" className="font-medium text-foreground transition-colors hover:text-foreground/70">
                Pricing
              </a>
              <a href="#docs" className="font-medium text-foreground transition-colors hover:text-foreground/70">
                Docs
              </a>
              <a href="#blog" className="font-medium text-foreground transition-colors hover:text-foreground/70">
                Blog
              </a>
            </div>
          </div>

          <Button
            variant="outline"
            className="rounded-full border-2 border-foreground/20 font-semibold transition-all hover:bg-foreground hover:text-background"
          >
            Sign In
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

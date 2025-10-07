import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#solutions", label: "Solutions" },
  { href: "#pricing", label: "Pricing" },
  { href: "#docs", label: "Docs" },
  { href: "#blog", label: "Blog" },
];

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            <BrandMark
              size="sm"
              titleClassName="text-lg tracking-[0.28em]"
              taglineClassName="text-[0.65rem] tracking-[0.18em]"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="font-medium text-foreground transition-colors hover:text-foreground/70"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link to="/chat">
              <Button className="rounded-full font-semibold">Chat</Button>
            </Link>
            <Button
              variant="outline"
              className="hidden md:inline-flex rounded-full border-2 border-foreground/20 font-semibold transition-all hover:bg-foreground hover:text-background"
            >
              Sign In
            </Button>
            
            {/* Mobile Navigation Trigger */}
            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-background">
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b">
                      <BrandMark size="sm" />
                    </div>
                    <div className="flex flex-col space-y-4 p-4">
                      {navLinks.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="font-medium text-lg text-foreground transition-colors hover:text-primary"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                    <div className="mt-auto p-4 border-t">
                       <Button
                          variant="outline"
                          className="w-full rounded-full border-2 border-foreground/20 font-semibold transition-all hover:bg-foreground hover:text-background"
                        >
                          Sign In
                        </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

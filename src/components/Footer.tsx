import { Github, Twitter, Linkedin, Youtube } from "lucide-react";

import BrandMark from "@/components/BrandMark";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/20 px-6 py-12">
      <div className="container mx-auto">
        <div className="mb-8 grid gap-8 md:grid-cols-4">
          <div>
            <BrandMark
              size="sm"
              className="mb-4"
              titleClassName="text-lg tracking-[0.28em]"
              taglineClassName="text-[0.65rem] tracking-[0.18em]"
            />
            <p className="text-sm text-muted-foreground">
              A minimalist, voice-aware intelligence studio where insights unfold through calm mind maps, guided narration, and adaptive practice.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#docs" className="text-muted-foreground hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#changelog" className="text-muted-foreground hover:text-primary transition-colors">Changelog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#about" className="text-muted-foreground hover:text-primary transition-colors">About</a></li>
              <li><a href="#blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#careers" className="text-muted-foreground hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#security" className="text-muted-foreground hover:text-primary transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-4 border-t border-border pt-8 md:flex-row md:justify-between">
          <p className="text-sm text-muted-foreground">
            © 2025 Shunya AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#twitter" className="text-muted-foreground transition-colors hover:text-foreground">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#github" className="text-muted-foreground transition-colors hover:text-foreground">
              <Github className="h-5 w-5" />
            </a>
            <a href="#linkedin" className="text-muted-foreground transition-colors hover:text-foreground">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#youtube" className="text-muted-foreground transition-colors hover:text-foreground">
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-workspace.png";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-6" id="home">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Your AI-Powered Workspace for Serious Productivity
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Collaborate, organize, analyze, and visualize—powered by state-of-the-art AI.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="rounded-full">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full">
                See Demo
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <img 
              src={heroImage} 
              alt="AI-powered workspace showing charts, notes, and collaboration tools" 
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

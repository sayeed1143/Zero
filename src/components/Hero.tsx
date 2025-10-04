import { ArrowRight, BarChart3, Download, Mic, Network } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-workspace.png";

const heroHighlights = [
  {
    icon: Mic,
    label: "Simply speak in 50+ languages—EduVoice understands",
  },
  {
    icon: Network,
    label: "Live mind maps and visual concept connections",
  },
  {
    icon: BarChart3,
    label: "Personalized quizzes that target weak spots",
  },
  {
    icon: Download,
    label: "Export audio replies, maps, and notes anywhere",
  },
];

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-6" id="home">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background/80 backdrop-blur">
              <span className="text-sm font-medium">🎙️ Voice-First AI Tutor + Visual Canvas</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight">
              Speak. See. Master instantly.
            </h1>
            <p className="text-xl font-semibold text-foreground">
              EduVoice AI listens to your voice, responds out loud, and turns ideas into interactive visuals.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Ask questions naturally, upload any study material, and watch the AI generate mind maps, step-by-step explanations, and adaptive quizzes in real time.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/workspace">
                <Button size="lg" className="rounded-full gap-2">
                  Launch Live Workspace
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="#solutions">
                <Button size="lg" variant="outline" className="rounded-full">
                  Explore Features
                </Button>
              </Link>
            </div>
            <ul className="grid sm:grid-cols-2 gap-3 pt-4">
              {heroHighlights.map((item, index) => (
                <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <item.icon className="w-5 h-5" />
                  </span>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 pt-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-black border-2 border-background"></div>
                <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-background"></div>
                <div className="w-10 h-10 rounded-full bg-gray-500 border-2 border-background"></div>
                <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-background"></div>
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-foreground">⭐⭐⭐⭐⭐</span>
                </div>
                <p className="text-muted-foreground">
                  Trusted by <strong className="text-foreground">50,000+</strong> learners worldwide
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt="EduVoice AI workspace with voice and visual learning tools"
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

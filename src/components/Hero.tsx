import { ArrowRight, BarChart3, Download, Mic, Network } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-workspace.png";

const heroHighlights = [
  {
    icon: Mic,
    label: "Simply speak your questions—AI listens, understands, and answers with voice plus visuals.",
  },
  {
    icon: Network,
    label: "Auto-generated mind maps reveal concept connections in an interactive canvas.",
  },
  {
    icon: BarChart3,
    label: "Personalized quizzes identify weak areas and generate targeted practice.",
  },
  {
    icon: Download,
    label: "Download mind maps, quizzes, and notes as PDF, PNG, or shareable links.",
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
              Voice-first tutoring meets visual learning—powered by GPT-4 Turbo, Claude 3 Opus, and Gemini 1.5 Pro via OpenRouter.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Simply speak, or drop in PDFs, images, handwritten notes, or YouTube links. EduVoice extracts every insight, builds interactive mind maps, and delivers adaptive practice with real-time narration in 50+ languages.
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

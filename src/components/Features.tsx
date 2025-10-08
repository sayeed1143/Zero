import { Card, CardContent } from "@/components/ui/card";
import { Users, BarChart3, Download, FileCheck, FileUp, Globe, Mic, Network } from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Voice-First AI Tutor",
    description:
      "Simply speak your questions. AI listens, understands, and responds with both voice playback and visual explanations.",
    color: "bg-gradient-to-br from-sky-400 to-cyan-500",
  },
  {
    icon: Network,
    title: "Visual Learning Canvas",
    description:
      "Auto-generated mind maps and concept connections reveal relationships between topics in an interactive canvas.",
    color: "bg-gradient-to-br from-violet-500 to-purple-600",
  },
  {
    icon: FileCheck,
    title: "Smart Test Generator",
    description:
      "AI creates personalized quizzes from your study materials, identifies weak areas, and generates targeted practice.",
    color: "bg-gradient-to-br from-emerald-400 to-green-500",
  },
  {
    icon: FileUp,
    title: "Multi-Modal Input",
    description:
      "Upload PDFs, images, handwritten notes, or YouTube links—Shunya AI extracts, explains, and visualizes everything.",
    color: "bg-gradient-to-br from-rose-400 to-red-500",
  },
  {
    icon: Globe,
    title: "50+ Languages",
    description:
      "Learn in your native language with real-time translation and voice support across 50+ languages.",
    color: "bg-gradient-to-br from-blue-500 to-indigo-600",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Monitor your learning journey with detailed analytics, insights, and mastery streaks.",
    color: "bg-gradient-to-br from-amber-400 to-orange-500",
  },
  {
    icon: Download,
    title: "Export Anywhere",
    description:
      "Download mind maps, quizzes, and notes as PDF, PNG, or LMS-ready files—export anywhere in seconds.",
    color: "bg-gradient-to-br from-slate-500 to-slate-600",
  },
  {
    icon: Users,
    title: "Collaborative Spaces",
    description:
      "Share your learning canvas with peers or instructors, work together in real-time, and get feedback instantly.",
    color: "bg-gradient-to-br from-fuchsia-500 to-pink-600",
  },
];

const Features = () => {
  return (
    <section className="py-20 px-6" id="solutions">
      <div className="container mx-auto">
        <div className="text-center mb-16 space-y-4">
          <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium inline-flex items-center justify-center">
            Voice + Visual + Assessment
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            A full-stack learning copilot
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Every feature is powered by best-in-class OpenRouter models, tuned for spoken dialogue, multi-modal reasoning, and coaching feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group border-2 border-border/40 bg-background hover:border-foreground/20 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
            >
              <CardContent className="p-6 space-y-4">
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center shadow-xl border border-border/20 group-hover:scale-110 transition-transform duration-300`}> 
                  <feature.icon className="w-7 h-7 text-background" />
                </div>
                <h3 className="text-lg font-bold text-foreground group-hover:text-foreground/90 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          Customize which OpenRouter model powers each feature—mix Gemini 2.5 Flash Lite, Grok-4 Fast, Gemini 2.0 Flash 001, ElevenLabs, Whisper, and the Gemini 2.5 Flash Lite preview to match every learner.
        </p>
      </div>
    </section>
  );
};

export default Features;

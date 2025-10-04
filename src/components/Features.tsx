import { Card, CardContent } from "@/components/ui/card";
import { Mic, Network, FileCheck, FileUp, Globe, BarChart, Download } from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Voice-First AI Tutor",
    description: "Simply speak your questions. AI listens, understands, and responds with both voice and visual explanations.",
    color: "bg-black",
  },
  {
    icon: Network,
    title: "Visual Learning Canvas",
    description: "Auto-generated mind maps and concept connections. See relationships between topics with interactive interface.",
    color: "bg-black",
  },
  {
    icon: FileCheck,
    title: "Smart Test Generator",
    description: "AI creates personalized quizzes based on your study materials. Identifies weak areas and generates targeted practice.",
    color: "bg-black",
  },
  {
    icon: FileUp,
    title: "Multi-Modal Input",
    description: "Upload PDFs, images, handwritten notes, or YouTube links. AI extracts and explains everything.",
    color: "bg-black",
  },
  {
    icon: Globe,
    title: "50+ Languages",
    description: "Learn in your native language with real-time translation and voice support.",
    color: "bg-black",
  },
  {
    icon: BarChart,
    title: "Progress Tracking",
    description: "Monitor your learning journey with detailed analytics and insights.",
    color: "bg-black",
  },
  {
    icon: Download,
    title: "Export Anywhere",
    description: "Download mind maps, quizzes, and notes as PDF, PNG, or share instantly.",
    color: "bg-black",
  },
];

const Features = () => {
  return (
    <section className="py-20 px-6" id="solutions">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Powerful
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need for next-generation learning
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

import { FolderTree, Network, Users, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: FolderTree,
    title: "Smart Organization",
    description: "Instantly sort notes, documents, and ideas with AI.",
  },
  {
    icon: Network,
    title: "Visual Workspace",
    description: "Mind-maps, diagrams, and tables in one interactive canvas.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Real-time multi-user editing, comments, and sharing.",
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    description: "Summarization, Q&A, document analysis from your files.",
  },
];

const Features = () => {
  return (
    <section className="py-20 px-6 bg-secondary/30" id="solutions">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Everything You Need to Work Smarter
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to streamline your workflow and boost productivity
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
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

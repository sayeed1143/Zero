import { Sparkles } from "lucide-react";
import type { VisualizationDiagram } from "@/types/ai";

interface VisualizationBlockProps {
  diagram: VisualizationDiagram;
}

const VisualizationBlock = ({ diagram }: VisualizationBlockProps) => {
  const steps = Array.isArray(diagram.steps) ? diagram.steps : [];

  return (
    <div className="mt-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-primary">
        <Sparkles className="h-4 w-4" />
        <span>{diagram.title}</span>
        {diagram.relation && (
          <span className="rounded-full border border-primary/40 px-2 py-0.5 text-xs font-medium text-primary/80">
            {diagram.relation}
          </span>
        )}
      </div>

      <div className="mt-3">
        <div className="relative pl-6">
          <div className="absolute left-2 top-0 bottom-0 w-px bg-primary/30" />
          <ol className="space-y-3 text-sm text-muted-foreground">
            {steps.map((step, i) => (
              <li key={i} className="relative">
                <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-primary" />
                <div className="rounded-lg bg-background/80 p-3 ring-1 ring-border/60">
                  <p className="font-medium text-foreground">{step.title}</p>
                  {step.detail && <p className="text-muted-foreground/90 mt-1">{step.detail}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default VisualizationBlock;

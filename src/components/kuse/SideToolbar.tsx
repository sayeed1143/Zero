import { BookCopy, BrainCircuit, Download, FileQuestion, MessageSquarePlus, Mic, Save, Share2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const tools = [
  { icon: BrainCircuit, label: 'Visualize' },
  { icon: FileQuestion, label: 'Quiz' },
  { icon: BookCopy, label: 'Canvas' },
  { icon: MessageSquarePlus, label: 'Practice' },
  { icon: Mic, label: 'Doubt' },
  { icon: Save, label: 'Save' },
  { icon: Download, label: 'Export' },
  { icon: Printer, label: 'Print' },
];

const SideToolbar = () => {
  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20">
      <div className="glass-pane p-2 rounded-2xl flex flex-col gap-2">
        {tools.map((tool) => (
          <Tooltip key={tool.label}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-12 w-12 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 text-foreground/80 hover:text-foreground">
                <tool.icon className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{tool.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default SideToolbar;

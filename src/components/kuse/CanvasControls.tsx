import { Layout, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CanvasControlsProps {
  onLayout: () => void;
  onExport: () => void;
  onReset: () => void;
}

const CanvasControls = ({ onLayout, onExport, onReset }: CanvasControlsProps) => {
  return (
    <div className="absolute top-6 right-6 z-20">
      <div className="glass-pane p-2 rounded-2xl flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onLayout} variant="ghost" size="icon" className="h-12 w-12 rounded-lg hover:bg-white/10 text-white/80 hover:text-white">
              <Layout className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Auto-Arrange</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onExport} variant="ghost" size="icon" className="h-12 w-12 rounded-lg hover:bg-white/10 text-white/80 hover:text-white">
              <Download className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export Board</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onReset} variant="ghost" size="icon" className="h-12 w-12 rounded-lg hover:bg-white/10 text-white/80 hover:text-white">
              <RotateCcw className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset View</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default CanvasControls;

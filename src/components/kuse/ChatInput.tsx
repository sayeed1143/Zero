import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

const ChatInput = ({ onSendMessage, isProcessing }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isProcessing) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl z-20">
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass-pane rounded-2xl p-2 flex items-center gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                handleSubmit(e);
              }
            }}
            placeholder="Message Shunya AI..."
            className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-white/50 resize-none h-12 text-base"
            rows={1}
            disabled={isProcessing}
          />
          <Button type="submit" size="icon" className="h-12 w-12 rounded-xl bg-gradient-to-br from-glow-cyan to-glow-violet text-white shadow-[0_0_20px_hsl(var(--glow-cyan)/0.5)] hover:shadow-[0_0_30px_hsl(var(--glow-violet)/0.7)] transition-shadow" disabled={isProcessing}>
            <Send className="h-6 w-6" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { motion } from 'framer-motion';
import { MessageSquare, User, Bot, Image as ImageIcon } from 'lucide-react';

const MessageNode = ({ data }: NodeProps) => {
  const isUser = data.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'backOut' }}
      className="glass-pane rounded-2xl w-64 shadow-lg shadow-black/50"
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br ${isUser ? 'from-glow-cyan to-blue-500' : 'from-glow-violet to-purple-500'}`}>
            {isUser ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
          </div>
          <p className="font-orbitron text-sm font-bold text-white">{isUser ? 'You' : 'Shunya AI'}</p>
        </div>
        
        {data.type === 'image' && data.content ? (
          <div className="space-y-2">
            <img src={data.content} alt="User upload" className="rounded-lg w-full h-auto" />
            <p className="text-white/80 text-sm">{data.label}</p>
          </div>
        ) : (
          <p className="text-white/90 text-sm leading-relaxed break-words">{data.label}</p>
        )}
      </div>

      <Handle type="target" position={Position.Left} className="!bg-glow-cyan !h-3 !w-3" />
      <Handle type="source" position={Position.Right} className="!bg-glow-violet !h-3 !w-3" />
    </motion.div>
  );
};

export default memo(MessageNode);

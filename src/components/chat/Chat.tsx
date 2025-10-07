import { useState, useRef, useEffect } from 'react';
import { Search, Settings, Paperclip, Mic, SendHorizontal, Video, Phone, MoreVertical, Copy } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { conversations as mockConversations, messages as mockMessages, loggedInUser, Message, Conversation } from './data';
import { toast } from '../ui/sonner';

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex items-center gap-2"
  >
    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
    <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></div>
  </motion.div>
);

const Chat = () => {
  const [conversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation>(conversations[0]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: new Date().toISOString(),
      sender: loggedInUser,
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
    };
    setMessages([...messages, message]);
    setNewMessage('');
    
    // Simulate bot response
    setIsTyping(true);
    setTimeout(() => {
      const botResponse: Message = {
        id: new Date().toISOString() + 'bot',
        sender: { name: selectedConversation.name, avatar: selectedConversation.avatar },
        text: 'Thanks for the message! I am currently a demo and cannot reply properly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Message copied!');
  };

  return (
    <div className="h-screen w-full flex bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[300px] hidden md:flex flex-col border-r bg-card/40">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." className="pl-10 rounded-full" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-1">
            {conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setSelectedConversation(convo)}
                className={cn(
                  'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors',
                  selectedConversation.id === convo.id
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'hover:bg-muted/50'
                )}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={convo.avatar} alt={convo.name} />
                  <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 truncate">
                  <p className="truncate font-medium">{convo.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                </div>
                <div className="text-xs text-muted-foreground self-start">{convo.lastMessageTime}</div>
              </button>
            ))}
          </nav>
        </ScrollArea>
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={loggedInUser.avatar} />
                <AvatarFallback>Y</AvatarFallback>
              </Avatar>
              <span className="font-semibold">You</span>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col chat-background relative">
        {/* Chat Header */}
        <header className="flex items-center justify-between p-4 border-b bg-background/70 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
              <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{selectedConversation.name}</h2>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <p className="text-sm text-muted-foreground">Online</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Phone className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><Video className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
          </div>
        </header>

        {/* Chat Messages */}
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto space-y-1 p-4 md:p-6">
            <AnimatePresence>
              {messages.map((msg, index) => {
                const prevMsg = messages[index - 1];
                const nextMsg = messages[index + 1];
                const isFirstInGroup = !prevMsg || prevMsg.sender.isUser !== msg.sender.isUser;
                const isLastInGroup = !nextMsg || nextMsg.sender.isUser !== msg.sender.isUser;

                return (
                  <motion.div
                    key={msg.id}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={cn('flex items-end gap-3 group', { 'justify-end': msg.sender.isUser })}
                  >
                    {!msg.sender.isUser && (
                      <Avatar className={cn('h-8 w-8', { 'invisible': !isLastInGroup })}>
                        <AvatarImage src={msg.sender.avatar} />
                        <AvatarFallback>{msg.sender.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn(
                      'max-w-xs md:max-w-md lg:max-w-lg p-3 relative',
                      msg.sender.isUser
                        ? 'bg-user-message text-user-message-foreground'
                        : 'bg-card border',
                      {
                        'rounded-2xl': isFirstInGroup && isLastInGroup,
                        'rounded-t-2xl rounded-b-lg': isFirstInGroup && !isLastInGroup,
                        'rounded-b-2xl rounded-t-lg': !isFirstInGroup && isLastInGroup,
                        'rounded-lg': !isFirstInGroup && !isLastInGroup,
                        'rounded-br-lg': msg.sender.isUser && isLastInGroup,
                        'rounded-bl-lg': !msg.sender.isUser && isLastInGroup,
                      }
                    )}>
                      {msg.type === 'text' && <p className="leading-relaxed">{msg.text}</p>}
                      {msg.type === 'image' && msg.image && (
                          <div>
                              <img src={msg.image} alt={msg.text || 'Chat image'} className="rounded-lg mb-2" />
                              {msg.text && <p className="text-sm">{msg.text}</p>}
                          </div>
                      )}
                      {msg.type === 'file' && msg.file && (
                          <div className="flex items-center gap-3 p-2 bg-background/50 rounded-lg border">
                              <Paperclip className="h-6 w-6 text-muted-foreground" />
                              <div>
                                  <p className="font-semibold">{msg.file.name}</p>
                                  <p className="text-xs text-muted-foreground">{msg.file.size}</p>
                              </div>
                          </div>
                      )}
                      <p className="text-xs mt-2 opacity-60 text-right">{msg.timestamp}</p>
                      
                      {msg.type === 'text' && (
                        <div className="absolute top-0 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" style={msg.sender.isUser ? {left: '-2.5rem'} : {right: '-2.5rem'}}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => handleCopy(msg.text)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy</TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                     {msg.sender.isUser && (
                      <Avatar className={cn('h-8 w-8', { 'invisible': !isLastInGroup })}>
                        <AvatarImage src={msg.sender.avatar} />
                        <AvatarFallback>{msg.sender.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-end gap-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={selectedConversation.avatar} />
                  <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="bg-card border p-3 rounded-2xl rounded-bl-lg">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}
          </div>
          <div className="h-28" /> {/* Spacer for the input field */}
        </ScrollArea>

        {/* Chat Input */}
        <footer className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/80 to-transparent pointer-events-none">
          <div className="max-w-2xl mx-auto pointer-events-auto">
            <form onSubmit={handleSendMessage} className="relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="w-full h-14 rounded-full pl-6 pr-40 bg-card shadow-lg border-2 border-border/20 focus-visible:ring-primary/50"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon" className="rounded-full"><Paperclip className="h-5 w-5" /></Button>
                <Button type="button" variant="ghost" size="icon" className="rounded-full"><Mic className="h-5 w-5" /></Button>
                <Button type="submit" size="icon" className="w-10 h-10 rounded-full bg-user-message hover:bg-user-message/90">
                  <SendHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Chat;

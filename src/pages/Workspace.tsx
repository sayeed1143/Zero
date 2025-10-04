import { useState } from "react";
import Canvas from "@/components/workspace/Canvas";
import ChatInterface from "@/components/workspace/ChatInterface";
import WorkspaceNav from "@/components/workspace/WorkspaceNav";

const Workspace = () => {
  const [canvasItems, setCanvasItems] = useState<any[]>([]);

  const handleSendMessage = async (message: string) => {
    console.log("Message sent:", message);
    // AI integration would go here with Lovable Cloud
  };

  return (
    <div className="h-screen flex flex-col bg-secondary/10">
      <WorkspaceNav />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Canvas items={canvasItems} />
        <ChatInterface onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default Workspace;

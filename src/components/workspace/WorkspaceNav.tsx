import { Home, FileText, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const WorkspaceNav = () => {
  return (
    <nav className="border-b bg-background px-6 py-3 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">K</span>
        </div>
        <span className="font-semibold text-foreground">kuse</span>
      </Link>
      
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
          <Home className="w-5 h-5 text-muted-foreground" />
        </button>
        <button className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
          <FileText className="w-5 h-5 text-muted-foreground" />
        </button>
        <button className="p-2 hover:bg-secondary/50 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-muted-foreground" />
        </button>
        <button className="bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          Login
        </button>
      </div>
    </nav>
  );
};

export default WorkspaceNav;

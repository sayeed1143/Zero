import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import KuseChat from "./pages/KuseChat";
import NotFound from "./pages/NotFound";
import TeacherDashboard from "./pages/TeacherDashboard";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/kuse-chat" element={<KuseChat />} />
            
            {/* Redirect all old app routes to the new KuseChat interface */}
            <Route path="/workspace" element={<Navigate to="/kuse-chat" replace />} />
            <Route path="/chat" element={<Navigate to="/kuse-chat" replace />} />
            <Route path="/canvas" element={<Navigate to="/kuse-chat" replace />} />
            <Route path="/practice" element={<Navigate to="/kuse-chat" replace />} />
            <Route path="/doubt" element={<Navigate to="/kuse-chat" replace />} />
            
            <Route path="/teacher" element={<TeacherDashboard />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
